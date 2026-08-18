#!/usr/bin/env bats

# Contract for the referenced-path gate (`make lint-ci-paths`, issue #96).
#
# The memory-leak gate stayed green for weeks while running nothing, because a
# rename left the Makefile and its workflow pointing at a file that no longer
# existed. These tests prove the guard trips on exactly that shape, and that it
# stays quiet for the constructs it must not flag.

load './test_helper.bash'

run_guard() {
  run bash -c 'cd "$1" && shift && bun scripts/ci/check-referenced-paths.ts "$@"' _ \
    "$PROJECT_ROOT" "$@"
}

@test "lint-ci-paths passes over this repository's own Makefile and workflows" {
  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains 'Referenced-path check passed'
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

@test "lint-ci-paths accepts a workflow that names only real paths" {
  local fixture="$BATS_TEST_TMPDIR/ok.yml"
  cat > "$fixture" <<'EOF'
jobs:
  guard:
    steps:
      - run: bash scripts/ci/alpine_base_guard.sh scan
      - run: bun scripts/ci/check-referenced-paths.ts
EOF

  run_guard "$fixture"
  [ "$status" -eq 0 ]
}

@test "lint-ci-paths does not flag interpolations, globs, generated output or prose" {
  local fixture="$BATS_TEST_TMPDIR/noise.yml"
  cat > "$fixture" <<'EOF'
# A comment mentioning tests/prose/never-existed.ts must not be treated as a reference.
name: calibreapp/image-actions
jobs:
  noise:
    steps:
      - run: cp $(REPORTS_DIR)/mutation-shard-$(INDEX).json reports/mutation/merged.json
      - run: cat ${{ github.workspace }}/codeql_databases/db.json
      - run: ls '**/Dockerfile.*' coverage/lcov.info playwright-report/index.html
      - run: docker compose cp bun:/app/coverage ./coverage
EOF

  run_guard "$fixture"
  [ "$status" -eq 0 ]
}

@test "lint-ci-paths fails closed when asked to audit a source that does not exist" {
  run_guard "$BATS_TEST_TMPDIR/absent.yml"
  [ "$status" -eq 2 ]
}

@test "lint-ci-paths is wired into make lint and into the static testing workflow" {
  run grep -E '^lint:.*lint-ci-paths' "$PROJECT_ROOT/Makefile"
  [ "$status" -eq 0 ]

  run grep -F 'make lint-ci-paths' "$PROJECT_ROOT/.github/workflows/static-testing.yml"
  [ "$status" -eq 0 ]
}
