#!/usr/bin/env bats

load './test_helper.bash'

FIXTURE_DIR="$PROJECT_ROOT/src/__font_token_fixture__"

setup() {
  mkdir -p "$FIXTURE_DIR"
}

teardown() {
  rm -rf "$FIXTURE_DIR"
}

write_hardcoded_fixture() {
  local file="$1"
  {
    printf "export const a = { fontFamily: 'Inter' };\n"
    printf "export const b = { fontFamily: 'Golos Text' };\n"
    printf "export const c = { fontFamily: \"'Golos Text'\" };\n"
    printf "export const d = { fontFamily: 'Inter, sans-serif' };\n"
    printf 'export const e = { fontFamily: `Golos Text` };\n'
    printf "export const f = { typography: { fontFamily: 'Inter' } };\n"
  } > "$file"
}

write_tokenised_fixture() {
  local file="$1"
  {
    printf "import { fontFamilies } from '@/utils/font-tokens';\n\n"
    printf "export const a = { fontFamily: fontFamilies.inter };\n"
    printf "export const b = { fontFamily: fontFamilies.golos };\n"
    printf "export const c = { fontFamily: 'var(--ui-toolkit-font-inter, Inter)' };\n"
    printf "export const d = { label: 'Inter' };\n"
    printf "// fontFamily: 'Golos Text'\n"
    printf "export const e = { fontFamily: 'monospace' };\n"
  } > "$file"
}

run_eslint_json() {
  run bun x eslint --format json --no-warn-ignored "$@"
}

messages_for() {
  local file="$1"
  printf '%s' "$output" | bun -e '
    const reports = JSON.parse(await Bun.stdin.text());
    const report = reports.find(r => r.filePath === process.argv[1]);
    for (const m of report?.messages ?? []) console.log(`${m.line}\t${m.ruleId}\t${m.message}`);
  ' "$file"
}

source_gate_selectors() {
  local config="$1"
  bun -e "
    const blocks = (await import('$config')).default;
    const block = blocks.find(
      b =>
        Array.isArray(b.files) &&
        b.files.includes('src/**/*.ts') &&
        Array.isArray(b.ignores) &&
        b.ignores.includes('**/*.stories.*')
    );
    const rule = block?.rules?.['no-restricted-syntax'] ?? [];
    for (const entry of rule.slice(1)) console.log(entry.selector + '\t' + entry.message);
  "
}

@test "the src-only no-restricted-syntax block carries both font-family selectors" {
  local selectors
  selectors="$(source_gate_selectors "$PROJECT_ROOT/eslint.config.mjs")"
  [[ "$selectors" == *"Property[key.name='fontFamily'] > Literal["* ]]
  [[ "$selectors" == *"Property[key.name='fontFamily'] > TemplateLiteral > TemplateElement["* ]]
  [[ "$selectors" == *"JSXAttribute[name.name='data-testid']"* ]]
  [ "$(printf '%s\n' "$selectors" | grep -c 'fontFamilies.inter / fontFamilies.golos')" -eq 2 ]
}

@test "every bare Inter / Golos Text fontFamily literal under src/ fails ESLint" {
  local fixture="$FIXTURE_DIR/hardcoded.ts"
  write_hardcoded_fixture "$fixture"

  cd "$PROJECT_ROOT"
  run_eslint_json "$fixture"
  [ "$status" -eq 1 ]

  local messages
  messages="$(messages_for "$fixture")"
  [ "$(printf '%s\n' "$messages" | wc -l)" -eq 6 ]
  [ "$(printf '%s\n' "$messages" | cut -f2 | sort -u)" = "no-restricted-syntax" ]
  [ "$(printf '%s\n' "$messages" | cut -f1 | tr '\n' ' ')" = "1 2 3 4 5 6 " ]
  [ "$(printf '%s\n' "$messages" | grep -c 'fontFamilies.inter / fontFamilies.golos')" -eq 6 ]
}

@test "the token, the raw var() string, a comment and an unrelated key pass the gate" {
  local fixture="$FIXTURE_DIR/tokenised.ts"
  write_tokenised_fixture "$fixture"

  cd "$PROJECT_ROOT"
  run_eslint_json "$fixture"
  [ "$status" -eq 0 ]
  [ -z "$(messages_for "$fixture")" ]
}
