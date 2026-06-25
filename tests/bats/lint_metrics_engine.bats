#!/usr/bin/env bats

load './test_helper.bash'

SCRIPT="$PROJECT_ROOT/scripts/lint-metrics.sh"
POLICY="$PROJECT_ROOT/config/metrics-policy.json"
SCHEMA="$PROJECT_ROOT/config/metrics-policy.schema.json"

# Stub: returns an empty JSON array (no files — passing run)
create_rca_stub() {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf '%s\n' "[]"
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
}

# Stub: records invocation args to COMMAND_LOG then returns empty array
create_rca_recording_stub() {
  cat > "$STUB_BIN_DIR/rca-stub" <<'STUB'
#!/bin/sh
printf 'rca %s\n' "$*" >> "${COMMAND_LOG:?}"
printf '%s\n' "[]"
STUB
  chmod +x "$STUB_BIN_DIR/rca-stub"
}

setup() {
  setup_stub_dir
  create_rca_stub
}

# Helper: run script with valid environment defaults
run_script_defaults() {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$POLICY" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
}

# --- file existence and POSIX header -----------------------------------------

@test "scripts/lint-metrics.sh exists" {
  [ -f "$SCRIPT" ]
}

@test "script is POSIX sh (has set -eu in header)" {
  grep -q 'set -eu' "$SCRIPT"
}

@test "script shebang is /bin/sh" {
  head -1 "$SCRIPT" | grep -q '^#!/bin/sh'
}

# --- precondition: jq absent --------------------------------------------------

@test "script fails when jq is not in PATH" {
  local empty_path="$BATS_TEST_TMPDIR/empty-path"
  mkdir -p "$empty_path"
  run env \
    PATH="$empty_path" \
    /bin/sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"jq"* ]]
}

# --- precondition: RCA_BIN ---------------------------------------------------

@test "script fails when RCA_BIN is unset" {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    METRICS_POLICY="$POLICY" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"RCA_BIN"* ]]
}

@test "script fails when RCA_BIN is not executable" {
  local non_exec="$BATS_TEST_TMPDIR/rca-not-exec"
  touch "$non_exec"
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$non_exec" \
    METRICS_POLICY="$POLICY" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"not executable"* ]]
}

# --- precondition: METRICS_POLICY --------------------------------------------

@test "script fails when METRICS_POLICY is unset" {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"METRICS_POLICY"* ]]
}

@test "script fails when METRICS_POLICY file is missing" {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$BATS_TEST_TMPDIR/nonexistent.json" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"not found"* ]]
}

@test "script fails when METRICS_POLICY is invalid JSON" {
  local bad_policy="$BATS_TEST_TMPDIR/bad-policy.json"
  printf 'not json' > "$bad_policy"
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$bad_policy" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"not valid JSON"* ]]
}

# --- precondition: METRICS_POLICY_SCHEMA -------------------------------------

@test "script fails when METRICS_POLICY_SCHEMA is missing" {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$POLICY" \
    METRICS_POLICY_SCHEMA="$BATS_TEST_TMPDIR/no-schema.json" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"not found"* ]]
}

# --- precondition: scope/excludes --------------------------------------------

@test "script fails when RCA_SCOPE is unset" {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$POLICY" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"RCA_SCOPE"* ]]
}

@test "script fails when RCA_EXCLUDES is unset" {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$POLICY" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"RCA_EXCLUDES"* ]]
}

# --- schema self-validation --------------------------------------------------

@test "script fails with schema error when policy hard block is not an object" {
  local bad_policy="$BATS_TEST_TMPDIR/hard-not-object.json"
  printf '{"hard": 42, "review": {}}' > "$bad_policy"
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$bad_policy" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"non-object section: hard: got number"* ]]
}

@test "script fails with schema error when policy has unknown top-level key" {
  local bad_policy="$BATS_TEST_TMPDIR/extra-key.json"
  jq '. + {"extra": {}}' "$POLICY" > "$bad_policy"
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$bad_policy" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"unknown top-level key"* ]]
}

# --- analyzer invocation and output guards -----------------------------------

@test "script invokes RCA_BIN with -m -O json -p flags" {
  create_rca_recording_stub
  run_script_defaults
  assert_log_contains "rca -m -O json -p src/"
}

@test "script passes each RCA_EXCLUDES glob as a -X flag" {
  create_rca_recording_stub
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$POLICY" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/** **/build/**" \
    sh "$SCRIPT"
  assert_log_contains "-X **/node_modules/**"
  assert_log_contains "-X **/build/**"
}

@test "script fails when analyzer produces no output" {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf ''
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
  run_script_defaults
  [ "$status" -eq 1 ]
  [[ "$output" == *"no output"* ]]
}

@test "script fails when analyzer output is not valid JSON" {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf 'not json output'
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
  run_script_defaults
  [ "$status" -eq 1 ]
  [[ "$output" == *"not valid JSON"* ]]
}

# --- happy path: empty scope passes ------------------------------------------

@test "script passes (exit 0) when analyzer returns empty array (no files)" {
  run_script_defaults
  [ "$status" -eq 0 ]
}

@test "script prints scope line on passing run" {
  run_script_defaults
  [ "$status" -eq 0 ]
  assert_output_contains "Scope: src/"
}

# --- metric evaluation robustness --------------------------------------------

@test "script passes when cognitive metric is an object with sum field" {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf '%s\n' '[{"name":"src/a.ts","metrics":{"loc":{"lloc":1,"ploc":1,"sloc":1},"cyclomatic":{"sum":1},"cognitive":{"sum":5},"abc":{"magnitude":1},"nargs":{"functions_max":1,"closures_max":0},"nexits":{"average":1},"halstead":{"volume":10,"bugs":0.01},"nom":{"functions":1,"closures":0},"mi":{"mi_visual_studio":90},"wmc":{"classes_sum":null},"npm":{"classes":null,"interfaces":null,"classes_average":null},"npa":{"classes":null,"interfaces":null,"classes_average":null},"maintanability_index":null},"spaces":[]}]'
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
  run_script_defaults
  [ "$status" -eq 0 ]
}

@test "script fails when a function exceeds cyclomatic_max threshold" {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf '%s\n' '[{"name":"src/complex.ts","metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5},"cyclomatic":{"sum":0},"cognitive":{"sum":0},"abc":{"magnitude":1},"nargs":{"functions_max":0,"closures_max":0},"nexits":{"average":0},"halstead":{"volume":10,"bugs":0.01},"nom":{"functions":0,"closures":0},"mi":{"mi_visual_studio":90},"wmc":{"classes_sum":null},"npm":{"classes":null,"interfaces":null,"classes_average":null},"npa":{"classes":null,"interfaces":null,"classes_average":null}},"spaces":[{"name":"complexFunc","kind":"function","start_line":1,"metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5},"cyclomatic":{"sum":99},"cognitive":{"sum":2},"abc":{"magnitude":2},"nargs":{"functions_max":1,"closures_max":0},"nexits":{"average":1},"halstead":{"volume":50,"bugs":0.01}},"spaces":[]}]}]'
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
  run_script_defaults
  [ "$status" -eq 1 ]
  assert_output_contains "cyclomatic_max"
}
