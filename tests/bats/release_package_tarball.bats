#!/usr/bin/env bats

# Covers the release-artifact guard: the tarball attached to a GitHub release must
# carry the built entry points that package.json promises, because a package whose
# `exports` point at missing files installs cleanly and only fails in the consumer.

load './test_helper.bash'

VERIFY_SCRIPT() {
  printf '%s' "$PROJECT_ROOT/scripts/ci/verify-package-tarball.sh"
}

# Write an npm-shaped tarball (every member under `package/`) holding exactly the
# given paths, so a test can express what the archive is missing.
make_tarball() {
  local destination="$1"
  shift

  local staging="$BATS_TEST_TMPDIR/staging"
  rm -rf "$staging"
  mkdir -p "$staging/package"

  local member
  for member in "$@"; do
    mkdir -p "$staging/package/$(dirname "$member")"
    echo 'fixture' > "$staging/package/$member"
  done

  tar -czf "$destination" -C "$staging" package
}

setup() {
  PACKAGE_DIR="$BATS_TEST_TMPDIR/dist"
  mkdir -p "$PACKAGE_DIR"
}

@test "the tarball verifier exists and is executable" {
  run test -x "$(VERIFY_SCRIPT)"
  [ "$status" -eq 0 ]
}

@test "verifier accepts a tarball carrying every published entry point" {
  make_tarball "$PACKAGE_DIR/ui-toolkit-1.0.0.tgz" \
    package.json build/index.mjs build/index.d.ts build/index.css

  run "$(VERIFY_SCRIPT)" "$PACKAGE_DIR"
  [ "$status" -eq 0 ]
  assert_output_contains 'verified'
}

@test "verifier rejects a tarball whose build output never made it in" {
  make_tarball "$PACKAGE_DIR/ui-toolkit-1.0.0.tgz" package.json

  run "$(VERIFY_SCRIPT)" "$PACKAGE_DIR"
  [ "$status" -eq 1 ]
  assert_output_contains 'is missing package/build/index.mjs'
}

@test "verifier rejects a tarball missing only the type declarations" {
  make_tarball "$PACKAGE_DIR/ui-toolkit-1.0.0.tgz" \
    package.json build/index.mjs build/index.css

  run "$(VERIFY_SCRIPT)" "$PACKAGE_DIR"
  [ "$status" -eq 1 ]
  assert_output_contains 'is missing package/build/index.d.ts'
}

@test "verifier rejects a tarball missing only the stylesheet" {
  make_tarball "$PACKAGE_DIR/ui-toolkit-1.0.0.tgz" \
    package.json build/index.mjs build/index.d.ts

  run "$(VERIFY_SCRIPT)" "$PACKAGE_DIR"
  [ "$status" -eq 1 ]
  assert_output_contains 'is missing package/build/index.css'
}

@test "verifier fails when the package directory holds no tarball" {
  run "$(VERIFY_SCRIPT)" "$PACKAGE_DIR"
  [ "$status" -eq 1 ]
  assert_output_contains 'no tarball found in'
}

@test "verifier refuses to guess when several tarballs are present" {
  make_tarball "$PACKAGE_DIR/ui-toolkit-1.0.0.tgz" \
    package.json build/index.mjs build/index.d.ts build/index.css
  make_tarball "$PACKAGE_DIR/ui-toolkit-1.1.0.tgz" \
    package.json build/index.mjs build/index.d.ts build/index.css

  run "$(VERIFY_SCRIPT)" "$PACKAGE_DIR"
  [ "$status" -eq 1 ]
  assert_output_contains 'expected exactly one tarball'
}

@test "verifier requires the package directory argument" {
  run "$(VERIFY_SCRIPT)"
  [ "$status" -ne 0 ]
  assert_output_contains 'usage: verify-package-tarball.sh'
}

@test "the release workflow packs the tarball and attaches it to the release" {
  local workflow="$PROJECT_ROOT/.github/workflows/autorelease.yml"

  run grep -F 'make package' "$workflow"
  [ "$status" -eq 0 ]

  run grep -F 'make start-bun' "$workflow"
  [ "$status" -eq 0 ]

  run grep -F 'dist/*.tgz' "$workflow"
  [ "$status" -eq 0 ]
}

@test "the packed tarball is never published from a tracked directory" {
  run grep -Fx 'dist/' "$PROJECT_ROOT/.gitignore"
  [ "$status" -eq 0 ]
}
