#!/usr/bin/env bats

load './test_helper.bash'

CHECK_SCRIPT() {
  printf '%s' "$PROJECT_ROOT/scripts/check-test-structure.sh"
}

# Build a minimal repo-shaped fixture under BATS_TEST_TMPDIR with an allowed
# unit test plus generated trees that the check must ignore.
setup_fixture() {
  FIXTURE="$BATS_TEST_TMPDIR/repo"
  mkdir -p \
    "$FIXTURE/src/components" \
    "$FIXTURE/tests/unit" \
    "$FIXTURE/node_modules/pkg" \
    "$FIXTURE/coverage" \
    "$FIXTURE/.stryker-tmp/sandbox-1/src"
  echo 'allowed' > "$FIXTURE/tests/unit/ok.test.ts"
  echo 'ignored' > "$FIXTURE/node_modules/pkg/dep.test.js"
  echo 'ignored' > "$FIXTURE/coverage/report.spec.js"
  echo 'ignored' > "$FIXTURE/.stryker-tmp/sandbox-1/src/Mutant.test.tsx"
}

@test "structure check script exists and is executable" {
  run test -x "$(CHECK_SCRIPT)"
  [ "$status" -eq 0 ]
}

@test "structure check passes on the current repository layout" {
  run "$(CHECK_SCRIPT)" "$PROJECT_ROOT"
  [ "$status" -eq 0 ]
  assert_output_contains 'OK: all test files live under the root tests/ directory.'
}

@test "structure check passes when only allowed and generated test files exist" {
  setup_fixture
  run "$(CHECK_SCRIPT)" "$FIXTURE"
  [ "$status" -eq 0 ]
}

@test "structure check fails when a test file lives outside tests/" {
  setup_fixture
  echo 'stray' > "$FIXTURE/src/components/Bad.test.tsx"
  run "$(CHECK_SCRIPT)" "$FIXTURE"
  [ "$status" -eq 1 ]
  assert_output_contains 'src/components/Bad.test.tsx'
}

@test "structure check fails for a spec file in a non-root tests/ folder" {
  setup_fixture
  mkdir -p "$FIXTURE/src/feature/tests"
  echo 'stray' > "$FIXTURE/src/feature/tests/feature.spec.ts"
  run "$(CHECK_SCRIPT)" "$FIXTURE"
  [ "$status" -eq 1 ]
  assert_output_contains 'src/feature/tests/feature.spec.ts'
}

@test "structure check flags a test file under a non-ignored dist/ directory" {
  setup_fixture
  mkdir -p "$FIXTURE/src/feature/dist"
  echo 'stray' > "$FIXTURE/src/feature/dist/Feature.test.ts"
  run "$(CHECK_SCRIPT)" "$FIXTURE"
  [ "$status" -eq 1 ]
  assert_output_contains 'src/feature/dist/Feature.test.ts'
}

@test "structure check errors when the scan root is missing" {
  run "$(CHECK_SCRIPT)" "$BATS_TEST_TMPDIR/does-not-exist"
  [ "$status" -eq 2 ]
}

@test "Makefile exposes lint-test-structure wired to the script" {
  run grep -F 'lint-test-structure:' "$PROJECT_ROOT/Makefile"
  [ "$status" -eq 0 ]

  run grep -F 'scripts/check-test-structure.sh' "$PROJECT_ROOT/Makefile"
  [ "$status" -eq 0 ]

  run grep -E '^lint:.*lint-test-structure' "$PROJECT_ROOT/Makefile"
  [ "$status" -eq 0 ]
}

@test "a pull request workflow runs make lint-test-structure" {
  run grep -F 'make lint-test-structure' "$PROJECT_ROOT/.github/workflows/static-testing.yml"
  [ "$status" -eq 0 ]

  run grep -F 'pull_request:' "$PROJECT_ROOT/.github/workflows/static-testing.yml"
  [ "$status" -eq 0 ]
}

@test "the canonical test layout is documented in CONTRIBUTING" {
  run grep -F 'tests/unit' "$PROJECT_ROOT/CONTRIBUTING.md"
  [ "$status" -eq 0 ]

  run grep -F 'lint-test-structure' "$PROJECT_ROOT/CONTRIBUTING.md"
  [ "$status" -eq 0 ]
}
