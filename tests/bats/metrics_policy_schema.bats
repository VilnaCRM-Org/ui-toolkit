#!/usr/bin/env bats

load './test_helper.bash'

SCHEMA="$PROJECT_ROOT/config/metrics-policy.schema.json"
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

@test "config/metrics-policy.schema.json exists" {
  [ -f "$SCHEMA" ]
}

@test "config/metrics-policy.schema.json is valid JSON" {
  jq empty "$SCHEMA"
}

# --- top-level Draft-07 shape ------------------------------------------------

@test "schema declares JSON Schema Draft-07" {
  result=$(jq -r '."$schema"' "$SCHEMA")
  [[ "$result" == *"draft-07"* ]]
}

@test "schema has type: object" {
  result=$(jq -r '.type' "$SCHEMA")
  [ "$result" = "object" ]
}

@test "schema required contains exactly hard" {
  result=$(jq -c '.required | sort' "$SCHEMA")
  [ "$result" = '["hard"]' ]
}

@test "schema has additionalProperties: false at top level" {
  result=$(jq '.additionalProperties' "$SCHEMA")
  [ "$result" = "false" ]
}

# --- hard sub-schema ---------------------------------------------------------

@test "hard sub-schema has additionalProperties: false" {
  result=$(jq '.properties.hard.additionalProperties' "$SCHEMA")
  [ "$result" = "false" ]
}

@test "hard required list contains all 27 expected keys" {
  missing=$(jq -r --argjson keys "$(printf '%s\n' "${HARD_KEYS[@]}" | jq -R . | jq -s .)" \
    '.properties.hard.required as $r | $keys | map(select(. as $k | $r | index($k) | not)) | .[]' "$SCHEMA")
  [ -z "$missing" ]
}

@test "hard required list has exactly 27 keys" {
  count=$(jq '.properties.hard.required | length' "$SCHEMA")
  [ "$count" -eq 27 ]
}

@test "every hard property has type: number" {
  non_number=$(jq -r '.properties.hard.properties | to_entries[] | select(.value.type != "number") | .key' "$SCHEMA")
  [ -z "$non_number" ]
}

@test "mi_visual_studio_min is bounded maximum: 100" {
  result=$(jq '.properties.hard.properties.mi_visual_studio_min.maximum' "$SCHEMA")
  [ "$result" = "100" ]
}

@test "mi_visual_studio_min is bounded minimum: 0" {
  result=$(jq '.properties.hard.properties.mi_visual_studio_min.minimum' "$SCHEMA")
  [ "$result" = "0" ]
}

@test "class_coa_max is a ratio bounded 0 to 1" {
  min=$(jq '.properties.hard.properties.class_coa_max.minimum' "$SCHEMA")
  max=$(jq '.properties.hard.properties.class_coa_max.maximum' "$SCHEMA")
  [ "$min" = "0" ] && [ "$max" = "1" ]
}

@test "class_cda_max is a ratio bounded 0 to 1" {
  min=$(jq '.properties.hard.properties.class_cda_max.minimum' "$SCHEMA")
  max=$(jq '.properties.hard.properties.class_cda_max.maximum' "$SCHEMA")
  [ "$min" = "0" ] && [ "$max" = "1" ]
}

@test "Halstead *_max keys have minimum: 0 (no minimum: 1 constraint)" {
  for key in halstead_volume_function_max halstead_bugs_function_max halstead_volume_file_max halstead_bugs_file_max; do
    min=$(jq --arg k "$key" '.properties.hard.properties[$k].minimum' "$SCHEMA")
    [ "$min" = "0" ] || { echo "Expected $key minimum=0, got $min"; return 1; }
  done
}

@test "non-Halstead count/size *_max keys have minimum: 1" {
  for key in cyclomatic_max cognitive_max nargs_function_max nexits_max sloc_function_max sloc_file_max nom_total_file_max; do
    min=$(jq --arg k "$key" '.properties.hard.properties[$k].minimum' "$SCHEMA")
    [ "$min" = "1" ] || { echo "Expected $key minimum=1, got $min"; return 1; }
  done
}

# --- review sub-schema -------------------------------------------------------

@test "review property exists in the schema" {
  result=$(jq 'has("properties") and (.properties | has("review"))' "$SCHEMA")
  [ "$result" = "true" ]
}

@test "review sub-schema has additionalProperties: false" {
  result=$(jq '.properties.review.additionalProperties' "$SCHEMA")
  [ "$result" = "false" ]
}

@test "review sub-schema has no required list (entire block optional)" {
  result=$(jq '.properties.review | has("required")' "$SCHEMA")
  [ "$result" = "false" ]
}

# --- cross-check: policy validates against schema structurally ---------------

@test "committed policy has all keys declared in schema hard.properties" {
  schema_keys=$(jq -r '.properties.hard.properties | keys | .[]' "$SCHEMA" | sort)
  policy_keys=$(jq -r '.hard | keys | .[]' "$POLICY" | sort)
  [ "$schema_keys" = "$policy_keys" ]
}

@test "committed review keys are a subset of schema review.properties" {
  unknown=$(jq -r --slurpfile schema "$SCHEMA" \
    '.review | keys | map(select(. as $k | $schema[0].properties.review.properties | has($k) | not)) | .[]' \
    "$POLICY")
  [ -z "$unknown" ]
}
