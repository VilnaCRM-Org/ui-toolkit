#!/usr/bin/env bats

# Coverage for the unused-dependency gate (issues #92 and #93): the Makefile
# target that dispatches it into the bun container, its registration in the
# `lint` aggregate, and the script's own verdicts against fixture manifests.

load './test_helper.bash'

MAKEFILE="$PROJECT_ROOT/Makefile"
GATE_SCRIPT="$PROJECT_ROOT/scripts/ci/check-unused-dependencies.ts"

# One package per implicit-usage rule the policy applies: a `@types/*` package
# the compiler consumes, an alias-resolved package from IMPLICITLY_RESOLVED, and
# a package the fixture also declares as a peer dependency.
IMPLICITLY_USED_DEV_DEPENDENCIES='"@types/node": "^26.0.0", "jest-environment-jsdom": "^30.4.1", "peer-only": "^1.0.0"'

setup() {
  setup_makefile_test_env
}

# Build a fixture tree whose only real reference is `used-lib`, imported from
# src/index.ts. The tree has no git index, so the gate falls back to its walk.
write_fixture() {
  local dir="$1"
  local dev_dependencies="$2"

  mkdir -p "$dir/src"
  printf "import used from 'used-lib';\n\nexport default used;\n" > "$dir/src/index.ts"

  cat > "$dir/package.json" <<EOF
{
  "name": "unused-dependency-fixture",
  "dependencies": { "used-lib": "^1.0.0" },
  "devDependencies": { $dev_dependencies },
  "peerDependencies": { "peer-only": "^1.0.0" }
}
EOF
}

# ---- Makefile wiring ---------------------------------------------------------

@test "lint-unused-deps delegates to the gate script inside the bun container" {
  run_make_target lint-unused-deps
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose run --rm bun bun scripts/ci/check-unused-dependencies.ts'
}

@test "lint-unused-deps is declared in .PHONY" {
  awk '/^\.PHONY/{buf=""; flag=1} flag{buf=buf $0; if(/\\$/)next; if(buf ~ /lint-unused-deps/ && flag){found=1; exit}} END{exit !found}' "$MAKEFILE"
}

@test "lint target chain includes lint-unused-deps as a dependency" {
  grep -qE '^lint:.*lint-unused-deps' "$MAKEFILE"
}

# ---- gate verdicts -----------------------------------------------------------

@test "the gate passes when every declared package is referenced or implicitly resolved" {
  local fixture="$BATS_TEST_TMPDIR/referenced"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES"

  run bun "$GATE_SCRIPT" "$fixture"
  [ "$status" -eq 0 ]
  assert_output_contains 'Every dependency and devDependency is referenced'
}

@test "the gate fails on a declared package nothing references" {
  local fixture="$BATS_TEST_TMPDIR/unreferenced"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES, \"never-referenced-pkg\": \"^1.0.0\""

  run bun "$GATE_SCRIPT" "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'devDependencies.never-referenced-pkg'
}

@test "the gate ignores planning prose under specs/ when deciding a package is used" {
  local fixture="$BATS_TEST_TMPDIR/specs-only"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES, \"specs-only-pkg\": \"^1.0.0\""
  mkdir -p "$fixture/specs"
  printf 'The plan considered specs-only-pkg but nothing adopted it.\n' > "$fixture/specs/plan.md"

  run bun "$GATE_SCRIPT" "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'devDependencies.specs-only-pkg'
}

@test "the gate ignores markdown prose and env values when deciding a package is used" {
  local fixture="$BATS_TEST_TMPDIR/prose-only"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES, \"prose-only-pkg\": \"^1.0.0\""
  printf 'The README discusses prose-only-pkg without importing it.\n' > "$fixture/README.md"
  printf 'SOME_URL="http://localhost/api/prose-only-pkg"\n' > "$fixture/.env.example"

  run bun "$GATE_SCRIPT" "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'devDependencies.prose-only-pkg'
}

@test "the gate exits 2 when the manifest cannot be read" {
  run bun "$GATE_SCRIPT" "$BATS_TEST_TMPDIR/does-not-exist"
  [ "$status" -eq 2 ]
  assert_output_contains 'Failed to read or parse'
}

@test "the real repository manifest passes the gate" {
  run bun "$GATE_SCRIPT" "$PROJECT_ROOT"
  [ "$status" -eq 0 ]
}
