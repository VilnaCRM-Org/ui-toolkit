#!/usr/bin/env bats

load './test_helper.bash'

POLICY="$PROJECT_ROOT/config/metrics-policy.json"

HARD_KEYS=(
  cyclomatic_max cognitive_max abc_magnitude_max
  nargs_function_max nargs_closure_max nexits_max
  lloc_function_max ploc_function_max sloc_function_max
  halstead_volume_function_max halstead_bugs_function_max
  nom_functions_file_max nom_closures_file_max nom_total_file_max
  lloc_file_max ploc_file_max sloc_file_max
  halstead_volume_file_max halstead_bugs_file_max
  mi_visual_studio_min
  class_wmc_max class_npm_max class_npa_max class_coa_max class_cda_max
  interface_npm_max interface_npa_max
)

# --- file existence and JSON validity ----------------------------------------

@test "config/metrics-policy.json exists" {
  [ -f "$POLICY" ]
}

@test "config/metrics-policy.json is valid JSON" {
  jq empty "$POLICY"
}

# --- required hard block and all 27 keys -------------------------------------

@test "config/metrics-policy.json has a required hard block" {
  result=$(jq 'has("hard")' "$POLICY")
  [ "$result" = "true" ]
}

@test "hard block contains all 27 required metric keys with numeric values" {
  missing=$(jq -r --argjson keys "$(printf '%s\n' "${HARD_KEYS[@]}" | jq -R . | jq -s .)" \
    '.hard as $h | $keys | map(select($h[.] | type != "number")) | .[]' "$POLICY")
  [ -z "$missing" ]
}

@test "hard block has no extra unknown keys (exactly 27 keys)" {
  count=$(jq '.hard | keys | length' "$POLICY")
  [ "$count" -eq 27 ]
}

# --- spot-check key threshold values (CRM parity baseline) -------------------

@test "cyclomatic_max is 10" {
  result=$(jq '.hard.cyclomatic_max' "$POLICY")
  [ "$result" = "10" ]
}

@test "cognitive_max is 15" {
  result=$(jq '.hard.cognitive_max' "$POLICY")
  [ "$result" = "15" ]
}

@test "mi_visual_studio_min is 20" {
  result=$(jq '.hard.mi_visual_studio_min' "$POLICY")
  [ "$result" = "20" ]
}

@test "sloc_function_max is 45" {
  result=$(jq '.hard.sloc_function_max' "$POLICY")
  [ "$result" = "45" ]
}

@test "sloc_file_max is 350" {
  result=$(jq '.hard.sloc_file_max' "$POLICY")
  [ "$result" = "350" ]
}

@test "nom_total_file_max is 15" {
  result=$(jq '.hard.nom_total_file_max' "$POLICY")
  [ "$result" = "15" ]
}

# --- optional review block ---------------------------------------------------

@test "review block is present and is an object" {
  result=$(jq '.review | type' "$POLICY")
  [ "$result" = '"object"' ]
}

@test "review block contains mi_original_min and mi_sei_min" {
  result=$(jq '(.review | has("mi_original_min")) and (.review | has("mi_sei_min"))' "$POLICY")
  [ "$result" = "true" ]
}

# --- review min/max range ordering -------------------------------------------

@test "review cloc_ratio_min is strictly less than cloc_ratio_max" {
  min=$(jq '.review.cloc_ratio_min' "$POLICY")
  max=$(jq '.review.cloc_ratio_max' "$POLICY")
  [ -n "$min" ] && [ -n "$max" ]
  result=$(jq -n --argjson min "$min" --argjson max "$max" '$min < $max')
  [ "$result" = "true" ]
}

@test "review blank_ratio_min is strictly less than blank_ratio_max" {
  min=$(jq '.review.blank_ratio_min' "$POLICY")
  max=$(jq '.review.blank_ratio_max' "$POLICY")
  [ -n "$min" ] && [ -n "$max" ]
  result=$(jq -n --argjson min "$min" --argjson max "$max" '$min < $max')
  [ "$result" = "true" ]
}

# --- no suppression file -----------------------------------------------------

@test "no rca suppression or baseline file exists alongside the policy" {
  for f in \
    rca-baseline.json \
    .rca-baseline.json \
    config/metrics-baseline.json \
    config/rca-baseline.json \
    config/.rca-baseline.json; do
    [ ! -f "$PROJECT_ROOT/$f" ]
  done
}
