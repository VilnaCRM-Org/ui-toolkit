#!/usr/bin/env bats

# Contract for the referenced-path gate (`make lint-ci-paths`, issue #96).
#
# The memory-leak gate stayed green for weeks while running nothing, because a
# rename left the Makefile and its workflow pointing at a file that no longer
# existed. These tests prove the guard trips on exactly that shape, that it
# stays quiet for the constructs it must not flag, and that a scan which
# inspected the wrong thing fails instead of passing.

load './test_helper.bash'

GUARD_SOURCE='scripts/ci/check-referenced-paths.ts'

setup() {
  setup_makefile_test_env
}

# The guard resolves the project root from the working directory, so the root it
# audits against is chosen by the caller rather than baked in.
run_guard_in() {
  run bash -c 'root="$1"; script="$2"; shift 2; cd "$root" && bun "$script" "$@"' _ "$@"
}

run_guard() {
  run_guard_in "$PROJECT_ROOT" "$PROJECT_ROOT/$GUARD_SOURCE" "$@"
}

@test "lint-ci-paths passes over this repository's whole Makefile and workflow surface" {
  local workflows expected
  workflows="$(find "$PROJECT_ROOT/.github/workflows" -maxdepth 1 -name '*.yml' | wc -l)"
  expected=$((workflows + 1))
  [ "$expected" -gt 1 ]

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains "passed across ${expected} file(s)"
}

@test "lint-ci-paths fails on the historic memlab rename that CI never noticed" {
  local fixture="$BATS_TEST_TMPDIR/Makefile.stale"
  printf 'run:\n\tbun ./tests/memory-leak/runMemlabTests.js\n' > "$fixture"

  run_guard "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'tests/memory-leak/runMemlabTests.js'
}

@test "lint-ci-paths fails on a workflow step naming a missing script" {
  local fixture="$BATS_TEST_TMPDIR/broken.yml"
  cat > "$fixture" <<'EOF'
jobs:
  guard:
    steps:
      - run: bash scripts/ci/not_a_real_script.sh scan
EOF

  run_guard "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'scripts/ci/not_a_real_script.sh'
}

@test "lint-ci-paths fails on a renamed root-level config and a missing Dockerfile variant" {
  local fixture="$BATS_TEST_TMPDIR/rootfiles.yml"
  cat > "$fixture" <<'EOF'
jobs:
  guard:
    steps:
      - run: docker build -f Dockerfile.gone .
      - run: bun x stryker run stryker.renamed.config.mjs
EOF

  run_guard "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'Dockerfile.gone'
  assert_output_contains 'stryker.renamed.config.mjs'
}

@test "lint-ci-paths accepts a workflow that names only real paths" {
  local fixture="$BATS_TEST_TMPDIR/ok.yml"
  cat > "$fixture" <<'EOF'
jobs:
  guard:
    steps:
      - run: bash scripts/ci/alpine_base_guard.sh scan
      - run: bun scripts/ci/check-referenced-paths.ts
      - run: bun x stryker run stryker.shard.config.mjs
      - run: cat .dive-ci Dockerfile.playwright
EOF

  run_guard "$fixture"
  [ "$status" -eq 0 ]
}

@test "lint-ci-paths flags a root-level config file that is gone from the project root" {
  local root="$BATS_TEST_TMPDIR/elsewhere"
  mkdir -p "$root"
  printf 'jobs:\n  a:\n    steps:\n      - run: dive --ci-config .dive-ci\n' > "$root/check.yml"

  run_guard_in "$root" "$PROJECT_ROOT/$GUARD_SOURCE" check.yml
  [ "$status" -eq 1 ]
  assert_output_contains '.dive-ci'
}

@test "lint-ci-paths does not flag interpolations, globs, generated output or prose" {
  local fixture="$BATS_TEST_TMPDIR/noise.yml"
  cat > "$fixture" <<'EOF'
# A comment mentioning tests/prose/never-existed.ts must not be treated as a reference.
name: calibreapp/image-actions
jobs:
  noise:
    steps:
      - run: cp $(REPORTS_DIR)tests/never-existed/out.js reports/mutation/merged.json
      - run: cat ${{ github.workspace }}/codeql_databases/db.json
      - run: ls '**/Dockerfile.*' coverage/lcov.info playwright-report/index.html
      - run: docker compose cp bun:/app/coverage ./coverage
      - run: sed s/old/new/g && curl -H "Accept: application/json"
      - run: docker build --platform linux/amd64 . && git push origin refs/heads/main
EOF

  run_guard "$fixture"
  [ "$status" -eq 0 ]
}

@test "lint-ci-paths still strips comments from a file with CRLF line endings" {
  local fixture="$BATS_TEST_TMPDIR/crlf.yml"
  printf 'jobs:\r\n  a:\r\n    steps:\r\n      - run: echo hi # see tests/gone/x.ts\r\n' > "$fixture"

  run_guard "$fixture"
  [ "$status" -eq 0 ]
}

@test "lint-ci-paths fails closed when asked to audit a source that does not exist" {
  run_guard "$BATS_TEST_TMPDIR/absent.yml"
  [ "$status" -eq 2 ]
}

@test "lint-ci-paths fails closed when a source cannot be read as a file" {
  run_guard "$PROJECT_ROOT/scripts"
  [ "$status" -eq 2 ]
}

@test "lint-ci-paths fails closed when the workflow directory holds no workflows" {
  local root="$BATS_TEST_TMPDIR/no-workflows"
  mkdir -p "$root/.github/workflows"
  printf 'run:\n\techo ok\n' > "$root/Makefile"

  run_guard_in "$root" "$PROJECT_ROOT/$GUARD_SOURCE"
  [ "$status" -eq 2 ]
  assert_output_contains 'refusing to report a vacuous pass'
}

@test "make lint-ci-paths actually runs the referenced-path checker" {
  reset_command_log
  run_make_target lint-ci-paths
  [ "$status" -eq 0 ]
  assert_log_contains "docker compose run --rm bun bun ${GUARD_SOURCE}"
}

@test "lint-ci-paths is wired into make lint and into the static testing workflow" {
  run grep -E '^lint:.*lint-ci-paths' "$PROJECT_ROOT/Makefile"
  [ "$status" -eq 0 ]

  run grep -F 'make lint-ci-paths' "$PROJECT_ROOT/.github/workflows/static-testing.yml"
  [ "$status" -eq 0 ]
}
