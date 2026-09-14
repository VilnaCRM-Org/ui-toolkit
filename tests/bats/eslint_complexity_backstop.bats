#!/usr/bin/env bats

load './test_helper.bash'

FIXTURE_DIR="$PROJECT_ROOT/src/__eslint_backstop_fixture__"

setup() {
  mkdir -p "$FIXTURE_DIR"
}

teardown() {
  rm -rf "$FIXTURE_DIR"
}

write_oversized_fixture() {
  local file="$1"
  {
    printf 'export function eightyLines(): number {\n  let total = 0;\n'
    for _ in $(seq 1 80); do printf '  total += 1;\n'; done
    printf '  return total;\n}\n\n'
    printf 'export function fourParams(a: number, b: number, c: number, d: number): number {\n'
    printf '  return a + b + c + d;\n}\n\n'
    printf 'export function fiveDeep(n: number): number {\n'
    printf '  if (n > 0) {\n    if (n > 1) {\n      if (n > 2) {\n        if (n > 3) {\n'
    printf '          if (n > 4) {\n            return 5;\n          }\n        }\n      }\n    }\n  }\n'
    printf '  return 0;\n}\n\n'
    printf 'export function thirteenBranches(n: number): number {\n'
    for i in $(seq 1 12); do printf '  if (n === %s) return %s;\n' "$i" "$i"; done
    printf '  return 0;\n}\n'
  } > "$file"
}

write_oversized_file_fixture() {
  local file="$1"
  {
    for i in $(seq 1 401); do printf 'export const value%s = %s;\n' "$i" "$i"; done
  } > "$file"
}

run_eslint_json() {
  run bun x eslint --format json --no-warn-ignored "$@"
}

rule_ids() {
  printf '%s' "$output" | bun -e '
    const reports = JSON.parse(await Bun.stdin.text());
    const ids = new Set(reports.flatMap(r => r.messages.map(m => m.ruleId)));
    console.log([...ids].sort().join("\n"));
  '
}

rule_ids_for() {
  local file="$1"
  printf '%s' "$output" | bun -e '
    const reports = JSON.parse(await Bun.stdin.text());
    const report = reports.find(r => r.filePath === process.argv[1]);
    const ids = new Set((report?.messages ?? []).map(m => m.ruleId));
    console.log([...ids].sort().join("\n"));
  ' "$file"
}

backstop_threshold() {
  local config="$1"
  local rule="$2"
  bun -e "
    const blocks = (await import('$config')).default;
    const block = blocks.find(b => b.rules && b.rules['$rule'] !== undefined);
    console.log(block.rules['$rule'][1]);
  "
}

@test "oversized fixtures under src/ fail ESLint on every backstop rule" {
  local fixture="$FIXTURE_DIR/oversized.ts"
  local file_fixture="$FIXTURE_DIR/oversized-file.ts"
  write_oversized_fixture "$fixture"
  write_oversized_file_fixture "$file_fixture"

  cd "$PROJECT_ROOT"
  run_eslint_json "$fixture" "$file_fixture"
  [ "$status" -eq 1 ]

  local ids
  ids="$(rule_ids)"
  [[ "$ids" == *"max-lines-per-function"* ]]
  [[ "$ids" == *"max-params"* ]]
  [[ "$ids" == *"max-depth"* ]]
  [[ "$ids" == *"complexity"* ]]
  [[ "$(rule_ids_for "$file_fixture")" == "max-lines" ]]
}

@test "a function inside the RCA hard policy passes the backstop" {
  local fixture="$FIXTURE_DIR/within-policy.ts"
  printf 'export function small(a: number, b: number): number {\n  return a + b;\n}\n' > "$fixture"

  cd "$PROJECT_ROOT"
  run_eslint_json "$fixture"
  [ "$status" -eq 0 ]
}

@test "the backstop thresholds sit above the RCA hard policy so both gates agree" {
  local policy="$PROJECT_ROOT/config/metrics-policy.json"
  local config="$PROJECT_ROOT/eslint.config.mjs"

  local rca_cyclomatic rca_nargs
  rca_cyclomatic="$(bun -e "console.log(require('$policy').hard.cyclomatic_max)")"
  rca_nargs="$(bun -e "console.log(require('$policy').hard.nargs_function_max)")"

  local eslint_complexity eslint_params
  eslint_complexity="$(backstop_threshold "$config" complexity)"
  eslint_params="$(backstop_threshold "$config" max-params)"

  [ -n "$eslint_complexity" ] && [ "$eslint_complexity" -ge "$rca_cyclomatic" ]
  [ -n "$eslint_params" ] && [ "$eslint_params" -ge "$rca_nargs" ]
}
