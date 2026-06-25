#!/usr/bin/env bats

load './test_helper.bash'

SCRIPT="$PROJECT_ROOT/scripts/lint-metrics.sh"
POLICY="$PROJECT_ROOT/config/metrics-policy.json"
SCHEMA="$PROJECT_ROOT/config/metrics-policy.schema.json"

# Stub: returns no files (clean pass)
create_passing_stub() {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf '%s\n' "[]"
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
}

# Stub: returns a file with one function that exceeds cyclomatic_max (10)
create_cyclomatic_violation_stub() {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf '%s\n' '[{"name":"src/a.ts","metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5},"cyclomatic":{"sum":0},"cognitive":{"sum":0},"abc":{"magnitude":1},"nargs":{"functions_max":0,"closures_max":0},"nexits":{"average":0},"halstead":{"volume":10,"bugs":0.01},"nom":{"functions":1,"closures":0},"mi":{"mi_visual_studio":90},"wmc":{"classes_sum":null},"npm":{"classes":null,"interfaces":null,"classes_average":null},"npa":{"classes":null,"interfaces":null,"classes_average":null}},"spaces":[{"name":"bigFunc","kind":"function","start_line":5,"metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5},"cyclomatic":{"sum":99},"cognitive":{"sum":2},"abc":{"magnitude":2},"nargs":{"functions_max":1,"closures_max":0},"nexits":{"average":1},"halstead":{"volume":50,"bugs":0.01}},"spaces":[]}]}]'
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
}

# Stub: two files each with one violating function (multiple violations)
create_multi_violation_stub() {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf '%s\n' '[{"name":"src/a.ts","metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5},"cyclomatic":{"sum":0},"cognitive":{"sum":0},"abc":{"magnitude":1},"nargs":{"functions_max":0,"closures_max":0},"nexits":{"average":0},"halstead":{"volume":10,"bugs":0.01},"nom":{"functions":1,"closures":0},"mi":{"mi_visual_studio":90},"wmc":{"classes_sum":null},"npm":{"classes":null,"interfaces":null,"classes_average":null},"npa":{"classes":null,"interfaces":null,"classes_average":null}},"spaces":[{"name":"fa","kind":"function","start_line":1,"metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5},"cyclomatic":{"sum":99},"cognitive":{"sum":2},"abc":{"magnitude":2},"nargs":{"functions_max":1,"closures_max":0},"nexits":{"average":1},"halstead":{"volume":50,"bugs":0.01}},"spaces":[]},{"name":"fb","kind":"function","start_line":20,"metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5},"cyclomatic":{"sum":88},"cognitive":{"sum":2},"abc":{"magnitude":2},"nargs":{"functions_max":1,"closures_max":0},"nexits":{"average":1},"halstead":{"volume":50,"bugs":0.01}},"spaces":[]}]}]'
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
}

# Stub: returns a file where MI is below mi_visual_studio_min (20) — tests FAIL
create_mi_violation_stub() {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf '%s\n' '[{"name":"src/legacy.ts","metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5},"cyclomatic":{"sum":0},"cognitive":{"sum":0},"abc":{"magnitude":1},"nargs":{"functions_max":0,"closures_max":0},"nexits":{"average":0},"halstead":{"volume":10,"bugs":0.01},"nom":{"functions":1,"closures":0},"mi":{"mi_visual_studio":5,"mi_original":30,"mi_sei":30},"wmc":{"classes_sum":null},"npm":{"classes":null,"interfaces":null,"classes_average":null},"npa":{"classes":null,"interfaces":null,"classes_average":null}},"spaces":[]}]'
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
}

# Stub: file with only low MI for review metrics (not hard fail, review only)
create_review_only_stub() {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf '%s\n' '[{"name":"src/ok.ts","metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5,"cloc":1,"blank":1},"cyclomatic":{"sum":0},"cognitive":{"sum":0},"abc":{"magnitude":1},"nargs":{"functions_max":0,"closures_max":0},"nexits":{"average":0},"halstead":{"volume":10,"bugs":0.01},"nom":{"functions":1,"closures":0},"mi":{"mi_visual_studio":90,"mi_original":55,"mi_sei":55},"wmc":{"classes_sum":null},"npm":{"classes":null,"interfaces":null,"classes_average":null},"npa":{"classes":null,"interfaces":null,"classes_average":null}},"spaces":[]}]'
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
}

setup() {
  setup_stub_dir
  create_passing_stub
}

run_with_stub() {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$POLICY" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    sh "$SCRIPT"
}

run_with_stub_and_env() {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    RCA_BIN="$STUB_BIN_DIR/rca-stub" \
    METRICS_POLICY="$POLICY" \
    METRICS_POLICY_SCHEMA="$SCHEMA" \
    RCA_SCOPE="src/" \
    RCA_EXCLUDES="**/node_modules/**" \
    "$@" \
    sh "$SCRIPT"
}

# ---- violation path ---------------------------------------------------------

@test "gate exits non-zero when hard threshold is exceeded" {
  create_cyclomatic_violation_stub
  run_with_stub
  [ "$status" -eq 1 ]
}

@test "violation output does NOT print 'all hard checks pass'" {
  create_cyclomatic_violation_stub
  run_with_stub
  [ "$status" -eq 1 ]
  [[ "$output" != *"all hard checks pass"* ]]
}

@test "violation output contains findings table header" {
  create_cyclomatic_violation_stub
  run_with_stub
  assert_output_contains "METRIC"
  assert_output_contains "VALUE"
  assert_output_contains "LIMIT"
}

@test "violation output names the offending metric" {
  create_cyclomatic_violation_stub
  run_with_stub
  assert_output_contains "cyclomatic_max"
}

@test "violation output names the offending file" {
  create_cyclomatic_violation_stub
  run_with_stub
  assert_output_contains "src/a.ts"
}

@test "violation output includes the subject function name" {
  create_cyclomatic_violation_stub
  run_with_stub
  assert_output_contains "bigFunc"
}

@test "violation output includes the start line" {
  create_cyclomatic_violation_stub
  run_with_stub
  assert_output_contains "5"
}

@test "violation output includes measured value and limit" {
  create_cyclomatic_violation_stub
  run_with_stub
  assert_output_contains "99"
  assert_output_contains "10"
}

@test "all violations are collected — never fail-fast (two violations reported)" {
  create_multi_violation_stub
  run_with_stub
  # Both violating functions must appear in output
  assert_output_contains "fa"
  assert_output_contains "fb"
}

@test "mi_visual_studio_min violation exits non-zero" {
  create_mi_violation_stub
  run_with_stub
  [ "$status" -eq 1 ]
  assert_output_contains "mi_visual_studio_min"
}

# ---- passing path -----------------------------------------------------------

@test "gate exits 0 when no hard thresholds are exceeded" {
  run_with_stub
  [ "$status" -eq 0 ]
}

@test "passing output prints 'all hard checks pass'" {
  run_with_stub
  assert_output_contains "all hard checks pass"
}

@test "passing output includes scope line" {
  run_with_stub
  assert_output_contains "Scope: src/"
}

@test "passing output includes measured-metric summary table header" {
  run_with_stub
  assert_output_contains "| METRIC | VALUE | LIMIT |"
}

# ---- review-gate metrics non-blocking ---------------------------------------

@test "low mi_original (review metric) does not cause exit 1" {
  create_review_only_stub
  run_with_stub
  [ "$status" -eq 0 ]
}

@test "review metric names do not appear as FAIL rows in stdout" {
  create_review_only_stub
  run_with_stub
  [ "$status" -eq 0 ]
  [[ "$output" != *"mi_original_min"* ]]
  [[ "$output" != *"mi_sei_min"* ]]
  [[ "$output" != *"cloc_ratio"* ]]
  [[ "$output" != *"blank_ratio"* ]]
}

# Stub: hard cyclomatic violation AND low mi_original (review only)
create_mixed_violation_stub() {
  cat > "$STUB_BIN_DIR/rca-stub" <<'EOF'
#!/bin/sh
printf '%s\n' '[{"name":"src/mixed.ts","metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5,"cloc":0,"blank":0},"cyclomatic":{"sum":0},"cognitive":{"sum":0},"abc":{"magnitude":1},"nargs":{"functions_max":0,"closures_max":0},"nexits":{"average":0},"halstead":{"volume":10,"bugs":0.01},"nom":{"functions":1,"closures":0},"mi":{"mi_visual_studio":90,"mi_original":40,"mi_sei":40},"wmc":{"classes_sum":null},"npm":{"classes":null,"interfaces":null,"classes_average":null},"npa":{"classes":null,"interfaces":null,"classes_average":null}},"spaces":[{"name":"complicated","kind":"function","start_line":1,"metrics":{"loc":{"lloc":5,"ploc":5,"sloc":5},"cyclomatic":{"sum":99},"cognitive":{"sum":2},"abc":{"magnitude":2},"nargs":{"functions_max":1,"closures_max":0},"nexits":{"average":1},"halstead":{"volume":50,"bugs":0.01}},"spaces":[]}]}]'
EOF
  chmod +x "$STUB_BIN_DIR/rca-stub"
}

@test "mixed hard+review violations: stdout shows hard violation" {
  create_mixed_violation_stub
  run_with_stub
  [ "$status" -eq 1 ]
  assert_output_contains "cyclomatic_max"
}

@test "mixed hard+review violations: review metric excluded from stdout" {
  create_mixed_violation_stub
  run_with_stub
  [ "$status" -eq 1 ]
  [[ "$output" != *"mi_original_min"* ]]
  [[ "$output" != *"mi_sei_min"* ]]
}

@test "GITHUB_STEP_SUMMARY contains review advisory when review metric violated" {
  create_review_only_stub
  local summary="$BATS_TEST_TMPDIR/step-summary-review.md"
  touch "$summary"
  run_with_stub_and_env GITHUB_STEP_SUMMARY="$summary"
  [ "$status" -eq 0 ]
  grep -q "mi_original_min\|mi_sei_min\|Review\|advisory\|REVIEW" "$summary" || \
    { echo "GITHUB_STEP_SUMMARY contents:"; cat "$summary"; return 1; }
}

# ---- GITHUB_STEP_SUMMARY mirroring -----------------------------------------

@test "GITHUB_STEP_SUMMARY is written on passing run when set and writable" {
  local summary="$BATS_TEST_TMPDIR/step-summary.md"
  touch "$summary"
  run_with_stub_and_env GITHUB_STEP_SUMMARY="$summary"
  [ "$status" -eq 0 ]
  [ -s "$summary" ]
}

@test "GITHUB_STEP_SUMMARY contains passing message on clean run" {
  local summary="$BATS_TEST_TMPDIR/step-summary-pass.md"
  touch "$summary"
  run_with_stub_and_env GITHUB_STEP_SUMMARY="$summary"
  [ "$status" -eq 0 ]
  grep -q "all hard checks pass" "$summary"
}

@test "GITHUB_STEP_SUMMARY contains violation on failing run" {
  create_cyclomatic_violation_stub
  local summary="$BATS_TEST_TMPDIR/step-summary-fail.md"
  touch "$summary"
  run_with_stub_and_env GITHUB_STEP_SUMMARY="$summary"
  [ "$status" -eq 1 ]
  grep -q "cyclomatic_max" "$summary"
}
