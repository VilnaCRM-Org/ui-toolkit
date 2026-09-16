#!/usr/bin/env bats

load './test_helper.bash'

MAKEFILE="$PROJECT_ROOT/Makefile"
WORKFLOW="$PROJECT_ROOT/.github/workflows/static-testing.yml"
GATE_SCRIPT="$PROJECT_ROOT/scripts/ci/check-i18n-keys.ts"

setup() {
  setup_makefile_test_env
  rm -f "$STUB_BIN_DIR/bun"
}

write_resources() {
  local dir="$1"
  mkdir -p "$dir/i18n"
  cat > "$dir/i18n/localization.json" <<'EOF'
{
  "en": { "translation": { "footer": { "copyright": "Copyright", "privacy": "Privacy" } } },
  "uk": { "translation": { "footer": { "copyright": "Avtorske pravo", "privacy": "Konfidentsiinist" } } }
}
EOF
}

write_source() {
  local dir="$1"
  local file="$2"
  mkdir -p "$dir/src/$(dirname "$file")"
  cat > "$dir/src/$file"
}

run_gate() {
  run bash -c "cd '$1' && bun '$GATE_SCRIPT'"
}

@test "lint-i18n-keys delegates to the gate script inside the bun container" {
  run_make_target lint-i18n-keys
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose run --rm bun bun scripts/ci/check-i18n-keys.ts'
}

@test "lint-i18n-keys is declared in .PHONY" {
  awk '/^\.PHONY/{buf=""; flag=1} flag{buf=buf $0; if(/\\$/)next; if(buf ~ /lint-i18n-keys/ && flag){found=1; exit}} END{exit !found}' "$MAKEFILE"
}

@test "lint target chain includes lint-i18n-keys as a dependency" {
  grep -qE '^lint:.*lint-i18n-keys' "$MAKEFILE"
}

@test "the static testing workflow runs lint-i18n-keys" {
  grep -qE '^\s*run: make lint-i18n-keys$' "$WORKFLOW"
}

@test "the gate passes when every literal key resolves in the reference locale" {
  local fixture="$BATS_TEST_TMPDIR/resolved"
  write_resources "$fixture"
  write_source "$fixture" 'footer.tsx' <<'EOF'
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import i18n from 'i18next';

export default function Footer(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <footer>
      {t('footer.copyright')}
      {t("footer.privacy")}
      {t(`footer.copyright`)}
      {i18n.t('footer.privacy')}
      <Trans i18nKey="footer.copyright" />
      <Trans i18nKey='footer.privacy' />
      <Trans i18nKey={'footer.copyright'} />
      <Trans i18nKey={"footer.privacy"} />
      <Trans i18nKey={`footer.copyright`} />
    </footer>
  );
}
EOF

  run_gate "$fixture"
  [ "$status" -eq 0 ]
  assert_output_contains '9 reference(s)'
}

@test "the gate fails on a t() literal with no reference-locale translation" {
  local fixture="$BATS_TEST_TMPDIR/missing-call"
  write_resources "$fixture"
  write_source "$fixture" 'footer.ts' <<'EOF'
import i18n from 'i18next';

export const label: string = i18n.t('footer.copyright');
export const missing: string = i18n.t('footer.terms');
EOF

  run_gate "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'src/footer.ts:4: "footer.terms"'
}

@test "the gate fails on a Trans i18nKey literal with no reference-locale translation" {
  local fixture="$BATS_TEST_TMPDIR/missing-attribute"
  write_resources "$fixture"
  write_source "$fixture" 'nested/card.tsx' <<'EOF'
import React from 'react';
import { Trans } from 'react-i18next';

export default function Card(): React.ReactElement {
  return <Trans i18nKey={'cards.missing.title'} />;
}
EOF

  run_gate "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains 'src/nested/card.tsx:5: "cards.missing.title"'
}

@test "a key that names a namespace rather than a leaf string is reported as missing" {
  local fixture="$BATS_TEST_TMPDIR/namespace"
  write_resources "$fixture"
  write_source "$fixture" 'footer.ts' <<'EOF'
import i18n from 'i18next';

export const block: string = i18n.t('footer');
EOF

  run_gate "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains '"footer"'
}

@test "commented-out and quoted spellings of a missing key do not fail the gate" {
  local fixture="$BATS_TEST_TMPDIR/not-code"
  write_resources "$fixture"
  write_source "$fixture" 'footer.ts' <<'EOF'
import i18n from 'i18next';

// i18n.t('footer.removed')
/* <Trans i18nKey="footer.removed" /> */
export const hint: string = "call t('footer.removed') here";
export const label: string = i18n.t('footer.copyright');
EOF

  run_gate "$fixture"
  [ "$status" -eq 0 ]
  assert_output_contains '1 reference(s)'
}

@test "a key held in a variable or backed by a defaultValue is not a literal reference" {
  local fixture="$BATS_TEST_TMPDIR/dynamic"
  write_resources "$fixture"
  write_source "$fixture" 'footer.ts' <<'EOF'
import i18n from 'i18next';

const FALLBACK_KEY: string = 'error_boundary.default_message';
export const dynamic: string = i18n.t(FALLBACK_KEY);
export const defaulted: string = i18n.t('footer.removed', { defaultValue: 'Removed' });
export const quoted: string = i18n.t('footer.removed', { 'defaultValue': 'Removed' });
export const computed: string = i18n.t('footer.removed', { ['defaultValue']: 'Removed' });
const defaultValue: string = 'Removed';
export const shorthand: string = i18n.t('footer.removed', { defaultValue });
export const label: string = i18n.t('footer.copyright');
EOF

  run_gate "$fixture"
  [ "$status" -eq 0 ]
  assert_output_contains '1 reference(s)'
}

@test "an options object without defaultValue does not exempt the key" {
  local fixture="$BATS_TEST_TMPDIR/other-options"
  write_resources "$fixture"
  write_source "$fixture" 'footer.ts' <<'EOF'
import i18n from 'i18next';

declare const someKey: string;
export const counted: string = i18n.t('footer.removed', { count: 2 });
export const dynamicName: string = i18n.t('footer.gone', { [someKey]: 'Removed' });
EOF

  run_gate "$fixture"
  [ "$status" -eq 1 ]
  assert_output_contains '"footer.removed"'
  assert_output_contains '"footer.gone"'
}

@test "stories and declaration files are outside the scanned source set" {
  local fixture="$BATS_TEST_TMPDIR/excluded"
  write_resources "$fixture"
  write_source "$fixture" 'footer.stories.tsx' <<'EOF'
export const key: string = t('footer.removed');
EOF
  write_source "$fixture" 'globals.d.ts' <<'EOF'
export const key: string = t('footer.removed');
EOF
  write_source "$fixture" 'footer.ts' <<'EOF'
import i18n from 'i18next';

export const label: string = i18n.t('footer.copyright');
EOF

  run_gate "$fixture"
  [ "$status" -eq 0 ]
  assert_output_contains '1 reference(s)'
}

@test "symbolic links under src are skipped, so a link loop cannot recurse forever" {
  local fixture="$BATS_TEST_TMPDIR/symlinks"
  write_resources "$fixture"
  write_source "$fixture" 'footer.ts' <<'EOF'
import i18n from 'i18next';

export const label: string = i18n.t('footer.copyright');
EOF
  write_source "$fixture" 'outside.ts' <<'EOF'
import i18n from 'i18next';

export const gone: string = i18n.t('footer.removed');
EOF
  mv "$fixture/src/outside.ts" "$fixture/outside.ts"
  ln -s . "$fixture/src/loop"
  ln -s ../outside.ts "$fixture/src/linked.ts"

  run_gate "$fixture"
  [ "$status" -eq 0 ]
  assert_output_contains '1 reference(s)'
}

@test "a source tree with no literal key reference exits 2" {
  local fixture="$BATS_TEST_TMPDIR/no-references"
  write_resources "$fixture"
  write_source "$fixture" 'plain.ts' <<'EOF'
export const answer: number = 42;
EOF

  run_gate "$fixture"
  [ "$status" -eq 2 ]
  assert_output_contains 'refusing to report a vacuous pass'
}

@test "a missing reference locale exits 2" {
  local fixture="$BATS_TEST_TMPDIR/no-locale"
  mkdir -p "$fixture/i18n"
  printf '{ "uk": { "translation": { "footer": { "copyright": "x" } } } }\n' > "$fixture/i18n/localization.json"
  write_source "$fixture" 'footer.ts' <<'EOF'
import i18n from 'i18next';

export const label: string = i18n.t('footer.copyright');
EOF

  run_gate "$fixture"
  [ "$status" -eq 2 ]
  assert_output_contains 'no "en.translation" object'
}

@test "a missing src directory exits 2" {
  local fixture="$BATS_TEST_TMPDIR/no-src"
  write_resources "$fixture"

  run_gate "$fixture"
  [ "$status" -eq 2 ]
  assert_output_contains 'Failed to scan'
}
