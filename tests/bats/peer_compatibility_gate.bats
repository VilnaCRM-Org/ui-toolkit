#!/usr/bin/env bats

load './test_helper.bash'

MAKEFILE="$PROJECT_ROOT/Makefile"
WORKFLOW="$PROJECT_ROOT/.github/workflows/static-testing.yml"
GATE_SCRIPT="$PROJECT_ROOT/scripts/ci/check-peer-compatibility.ts"

setup() {
  setup_makefile_test_env
  rm -f "$STUB_BIN_DIR/bun"
}

write_manifest() {
  local dir="$1"
  local peer_range="$2"
  local dev_range="$3"
  mkdir -p "$dir"
  cat > "$dir/package.json" <<EOF
{
  "name": "peer-compatibility-fixture",
  "devDependencies": { "react": "$dev_range", "typescript": "^6.0.0" },
  "peerDependencies": { "react": "$peer_range" }
}
EOF
}

write_installed() {
  local dir="$1"
  local name="$2"
  local version="$3"
  mkdir -p "$dir/node_modules/$name"
  printf '{ "name": "%s", "version": "%s" }\n' "$name" "$version" > "$dir/node_modules/$name/package.json"
}

run_gate() {
  run bash -c "cd '$1' && bun '$GATE_SCRIPT'"
}

@test "lint-peer-ranges delegates to the gate script inside the bun container" {
  run_make_target lint-peer-ranges
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose run --rm bun bun scripts/ci/check-peer-compatibility.ts'
}

@test "lint-peer-ranges is declared in .PHONY" {
  awk '/^\.PHONY/{buf=""; flag=1} flag{buf=buf $0; if(/\\$/)next; if(buf ~ /lint-peer-ranges/ && flag){found=1; exit}} END{exit !found}' "$MAKEFILE"
}

@test "lint target chain includes lint-peer-ranges as a dependency" {
  grep -qE '^lint:.*lint-peer-ranges' "$MAKEFILE"
}

@test "the static testing workflow runs lint-peer-ranges" {
  grep -qE '^\s*run: make lint-peer-ranges$' "$WORKFLOW"
}

@test "the gate passes when the devDependency floor and the installed version satisfy the peer range" {
  local fixture="$BATS_TEST_TMPDIR/satisfied"
  write_manifest "$fixture" '^19.0.0' '^19.2.7'
  write_installed "$fixture" react 19.2.7

  run_gate "$fixture"
  [ "$status" -eq 0 ]
  assert_output_contains 'Every peerDependency (1) is satisfied'
}

@test "the gate accepts a scoped peer and a compound peer range" {
  local fixture="$BATS_TEST_TMPDIR/scoped"
  mkdir -p "$fixture"
  cat > "$fixture/package.json" <<'EOF'
{
  "devDependencies": { "@mui/material": "^9.0.1", "i18next": "^26.3.6" },
  "peerDependencies": { "@mui/material": "^9.0.0", "i18next": ">=23.0.0 <27.0.0" }
}
EOF
  write_installed "$fixture" @mui/material 9.0.1
  write_installed "$fixture" i18next 26.3.6

  run_gate "$fixture"
  [ "$status" -eq 0 ]
  assert_output_contains 'Every peerDependency (2) is satisfied'
}

@test "the gate fails when a devDependency bump leaves the peer range behind" {
  local fixture="$BATS_TEST_TMPDIR/dev-ahead"
  write_manifest "$fixture" '^19.0.0' '^20.0.0'
  write_installed "$fixture" react 20.0.0

  run_gate "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'starts at 20.0.0, outside the peer range "^19.0.0"'
  assert_output_contains 'installed 20.0.0 does not satisfy the peer range'
}

@test "the gate fails when the installed version drifts outside the peer range on its own" {
  local fixture="$BATS_TEST_TMPDIR/installed-drift"
  write_manifest "$fixture" '^19.0.0' '>=19.0.0'
  write_installed "$fixture" react 20.1.0

  run_gate "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'installed 20.1.0 does not satisfy the peer range "^19.0.0"'
}

@test "the gate fails when a peer has no devDependency mirror" {
  local fixture="$BATS_TEST_TMPDIR/no-mirror"
  mkdir -p "$fixture"
  cat > "$fixture/package.json" <<'EOF'
{
  "devDependencies": { "typescript": "^6.0.0" },
  "peerDependencies": { "react": "^19.0.0" }
}
EOF
  write_installed "$fixture" react 19.2.7

  run_gate "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'react: has no devDependency mirror'
}

@test "the gate fails when the peer is not installed" {
  local fixture="$BATS_TEST_TMPDIR/not-installed"
  write_manifest "$fixture" '^19.0.0' '^19.2.7'

  run_gate "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'react: is not installed'
}

@test "the gate fails on a peer range that is not semver" {
  local fixture="$BATS_TEST_TMPDIR/invalid-range"
  write_manifest "$fixture" 'latest-and-greatest' '^19.2.7'
  write_installed "$fixture" react 19.2.7

  run_gate "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'is not valid semver'
}

@test "a manifest with no peerDependencies exits 2 instead of passing vacuously" {
  local fixture="$BATS_TEST_TMPDIR/no-peers"
  mkdir -p "$fixture"
  printf '{ "devDependencies": { "react": "^19.2.7" } }\n' > "$fixture/package.json"

  run_gate "$fixture"
  [ "$status" -eq 2 ]
  assert_output_contains 'refusing to report a vacuous pass'
}

@test "an unreadable manifest exits 2" {
  local fixture="$BATS_TEST_TMPDIR/unreadable"
  mkdir -p "$fixture"
  printf '{ not json' > "$fixture/package.json"

  run_gate "$fixture"
  [ "$status" -eq 2 ]
  assert_output_contains 'Failed to read or parse'
}

@test "the repository's own manifest passes the gate" {
  run_gate "$PROJECT_ROOT"
  [ "$status" -eq 0 ]
}
