#!/usr/bin/env bats

load './test_helper.bash'

MAKEFILE="$PROJECT_ROOT/Makefile"
CHECKER="$PROJECT_ROOT/scripts/ci/check-licenses.ts"
PR_WORKFLOW="$PROJECT_ROOT/.github/workflows/license-compliance.yml"
RELEASE_WORKFLOW="$PROJECT_ROOT/.github/workflows/autorelease.yml"
FIXTURE_FONT="$PROJECT_ROOT/src/assets/fonts/Inter/Inter-Regular.ttf"

setup() {
  setup_makefile_test_env
  rm -f "$STUB_BIN_DIR/bun"
  export FIXTURE="$BATS_TEST_TMPDIR/fixture"
  export PACKAGE="$FIXTURE/staging/package"
  write_compliant_fixture
}

create_scanner_stub() {
  mkdir -p "$MAKEFILE_SANDBOX/scripts/ci"
  cat > "$MAKEFILE_SANDBOX/scripts/ci/scan-secrets.sh" <<'EOF'
printf 'scan-secrets image=%s mode=%s package-dir=%s\n' \
  "$GITLEAKS_IMAGE" "$SECRETS_MODE" "$SECRETS_PACKAGE_DIR" >> "${COMMAND_LOG:?}"
EOF
}

write_installed_package() {
  local name="$1" license="$2" dependencies="${3:-}"
  mkdir -p "$FIXTURE/node_modules/$name"
  printf '{ "name": "%s", "version": "1.0.0", "license": "%s"%s }\n' \
    "$name" "$license" "$dependencies" > "$FIXTURE/node_modules/$name/package.json"
  printf 'Copyright (c) the %s authors\n' "$name" > "$FIXTURE/node_modules/$name/LICENSE"
}

write_manifest() {
  printf '{ "name": "@fixture/kit", "version": "1.0.0", "license": "%s"%s }\n' \
    "$1" "${2:-}" > "$PACKAGE/package.json"
}

write_compliant_fixture() {
  mkdir -p "$PACKAGE/build" "$FIXTURE/dist"
  write_installed_package bundled-lib MIT
  write_manifest CC0-1.0
  printf 'Creative Commons Legal Code\n\nCC0 1.0 Universal\n' > "$PACKAGE/LICENSE"
  printf 'const confidential_text = "t";export{confidential_text};\n' > "$PACKAGE/build/index.mjs"
  printf '{"version":3,"sources":["../node_modules/bundled-lib/index.js","../src/index.ts"]}\n' \
    > "$PACKAGE/build/index.mjs.map"
  printf 'bundled-lib@1.0.0 (MIT)\n\nCopyright (c) the bundled-lib authors\n' \
    > "$PACKAGE/build/THIRD-PARTY-NOTICES.txt"
}

pack_fixture() {
  rm -f "$FIXTURE/dist"/*.tgz
  tar -czf "$FIXTURE/dist/fixture-kit-1.0.0.tgz" -C "$FIXTURE/staging" package
}

run_checker() {
  pack_fixture
  run bash -c "cd '$FIXTURE' && bun '$CHECKER' ${1-dist}"
}

makefile_variable() {
  local printer="$BATS_TEST_TMPDIR/print.mk"
  printf 'print-%%:\n\t@printf "%%s\\n" "$($*)"\n' > "$printer"
  make --no-print-directory -C "$PROJECT_ROOT" -f Makefile -f "$printer" "print-$1"
}

executable_lines() {
  grep -n '' "$1" | grep -vE '^[0-9]+:[[:space:]]*#'
}

line_of() {
  executable_lines "$1" | grep -E "$2" | head -n 1 | cut -d: -f1
}

@test "lint-licenses fails clearly when the bun service is not running" {
  run_make_target lint-licenses
  [ "$status" -ne 0 ]
  assert_output_contains "run 'make start-bun' and 'make package' first"
  assert_log_not_contains 'check-licenses.ts'
}

@test "lint-licenses scans the tarball in the bun container, then secret-scans it on the host" {
  create_scanner_stub
  run_make_target_with_env lint-licenses FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose exec -T bun bun scripts/ci/check-licenses.ts dist'
  assert_log_contains 'scan-secrets image=ghcr.io/gitleaks/gitleaks:v8.30.1@sha256:'
  assert_log_contains 'mode=package package-dir=dist'
}

@test "lint-licenses never secret-scans a tarball the licence checker rejected" {
  create_scanner_stub
  run_make_target_with_env lint-licenses \
    FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id \
    FAKE_DOCKER_FAILING_COMMAND='check-licenses.ts'
  [ "$status" -ne 0 ]
  assert_log_not_contains 'scan-secrets'
}

@test "lint-licenses is declared phony and runs in make verify after the tarball is packed" {
  local gates package_index licenses_index index=0 gate
  awk '/^\.PHONY/{buf=""; flag=1} flag{buf=buf $0; if(/\\$/)next; if(buf ~ /lint-licenses/){found=1; exit}} END{exit !found}' "$MAKEFILE"
  gates="$(makefile_variable VERIFY_GATES)"
  for gate in $gates; do
    index=$((index + 1))
    case "$gate" in
      package) package_index=$index ;;
      lint-licenses) licenses_index=$index ;;
    esac
  done
  [ -n "$package_index" ]
  [ -n "$licenses_index" ]
  [ "$package_index" -lt "$licenses_index" ]
}

@test "the pull-request workflow packs the tarball and then runs the licence gate" {
  local start package licenses
  grep -qF 'pull_request:' "$PR_WORKFLOW"
  grep -qF 'contents: read' "$PR_WORKFLOW"
  start="$(line_of "$PR_WORKFLOW" 'run: make start-bun$')"
  package="$(line_of "$PR_WORKFLOW" 'run: make package$')"
  licenses="$(line_of "$PR_WORKFLOW" 'run: make lint-licenses$')"
  [ -n "$start" ]
  [ -n "$package" ]
  [ -n "$licenses" ]
  [ "$start" -lt "$package" ]
  [ "$package" -lt "$licenses" ]
}

@test "the release fails on the licence gate before it pushes a commit, a tag or a release" {
  local package licenses push release
  package="$(line_of "$RELEASE_WORKFLOW" 'run: make package$')"
  licenses="$(line_of "$RELEASE_WORKFLOW" 'run: make lint-licenses$')"
  push="$(line_of "$RELEASE_WORKFLOW" 'git push .*HEAD:')"
  release="$(line_of "$RELEASE_WORKFLOW" 'gh release create')"
  [ -n "$package" ]
  [ -n "$licenses" ]
  [ -n "$push" ]
  [ -n "$release" ]
  [ "$package" -lt "$licenses" ]
  [ "$licenses" -lt "$push" ]
  [ "$licenses" -lt "$release" ]
}

@test "the release licence step runs whenever the changelog action cut a release" {
  executable_lines "$RELEASE_WORKFLOW" \
    | grep -B 1 'run: make lint-licenses$' \
    | grep -qF "if: \${{ steps.changelog.outputs.skipped == 'false' }}"
}

@test "the build writes the third-party notices the checker reads" {
  grep -qF "import { writeThirdPartyNotices } from './scripts/ci/third-party-notices.mjs';" \
    "$PROJECT_ROOT/build.config.mjs"
  grep -qF 'writeThirdPartyNotices({' "$PROJECT_ROOT/build.config.mjs"
}

@test "the checker passes a compliant tarball and ignores a lower-case i18n key" {
  run_checker
  [ "$status" -eq 0 ]
  assert_output_contains 'passes the licence and publish-surface policy'
}

@test "the checker passes a shipped font whose embedded licence is OFL-1.1" {
  cp "$FIXTURE_FONT" "$PACKAGE/build/Inter-Regular-FIXTURE.ttf"
  run_checker
  [ "$status" -eq 0 ]
}

@test "the checker rejects a bundled package outside the licence allow-list" {
  write_installed_package bundled-lib GPL-3.0-only
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'bundled-lib is licensed GPL-3.0-only, which the allow-list does not permit'
}

@test "the checker rejects a bundled package with no third-party notice" {
  printf 'nothing bundled\n' > "$PACKAGE/build/THIRD-PARTY-NOTICES.txt"
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'bundled-lib@1.0.0 is bundled without an entry in THIRD-PARTY-NOTICES.txt'
}

@test "the checker rejects a bundled package that is not installed" {
  rm -rf "$FIXTURE/node_modules/bundled-lib"
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'node_modules/bundled-lib is bundled but not installed'
}

@test "the checker rejects a production dependency outside the licence allow-list" {
  write_manifest CC0-1.0 ', "dependencies": { "runtime-lib": "^1.0.0" }'
  write_installed_package runtime-lib MIT ', "dependencies": { "deep-lib": "^1.0.0" }'
  write_installed_package deep-lib UNLICENSED
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'deep-lib is licensed UNLICENSED'
}

@test "the checker skips an optional production dependency that is not installed" {
  write_manifest CC0-1.0 ', "optionalDependencies": { "platform-lib": "^1.0.0" }'
  run_checker
  [ "$status" -eq 0 ]
  assert_output_contains 'passes the licence and publish-surface policy'
}

@test "the checker still rejects a required production dependency that is not installed" {
  write_manifest CC0-1.0 ', "dependencies": { "absent-lib": "^1.0.0" }'
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'production dependency absent-lib is not installed'
}

@test "the checker checks the nested install a dependency resolves, not the hoisted copy" {
  write_manifest CC0-1.0 ', "dependencies": { "runtime-lib": "^1.0.0" }'
  write_installed_package runtime-lib MIT ', "dependencies": { "dup-lib": "^2.0.0" }'
  write_installed_package dup-lib MIT
  mkdir -p "$FIXTURE/node_modules/runtime-lib/node_modules/dup-lib"
  printf '{ "name": "dup-lib", "version": "2.0.0", "license": "GPL-3.0-only" }\n' \
    > "$FIXTURE/node_modules/runtime-lib/node_modules/dup-lib/package.json"
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'dup-lib is licensed GPL-3.0-only'
}

@test "the checker rejects a manifest that is not CC0-1.0" {
  write_manifest MIT
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'package.json declares MIT, not CC0-1.0'
}

@test "the checker rejects a LICENSE that is not the CC0 text" {
  printf 'All rights reserved.\n' > "$PACKAGE/LICENSE"
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'LICENSE is not the CC0-1.0 text'
}

@test "the checker rejects a tarball that ships no LICENSE" {
  rm "$PACKAGE/LICENSE"
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'the package ships no LICENSE file'
}

@test "the checker rejects an internal-only URL in the shipped code" {
  printf 'fetch("http://api.crm.internal/v1");\n' >> "$PACKAGE/build/index.mjs"
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'build/index.mjs: internal-url "http://api.crm.internal"'
}

@test "the checker rejects a localhost URL in the shipped README" {
  printf 'Open http://localhost:6006 to browse.\n' > "$PACKAGE/README.md"
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'README.md: internal-url "http://localhost"'
}

@test "the checker rejects a proprietary marker in the shipped code" {
  printf '/* CONFIDENTIAL - internal use only */\n' >> "$PACKAGE/build/index.mjs"
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'build/index.mjs: proprietary-marker "CONFIDENTIAL"'
  assert_output_contains 'build/index.mjs: proprietary-marker "internal use only"'
}

@test "the checker rejects a font whose licence metadata it cannot read" {
  printf 'wOF2 not a readable sfnt' > "$PACKAGE/build/face.woff2"
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'build/face.woff2 carries no readable licence metadata'
}

@test "the checker rejects a runtime module that ships without a source map" {
  printf 'export const b = 2;\n' > "$PACKAGE/build/extra.mjs"
  run_checker
  [ "$status" -eq 1 ]
  assert_output_contains 'build/extra.mjs ships without a source map'
}

@test "the checker refuses a package directory without a tarball" {
  run bash -c "cd '$FIXTURE' && bun '$CHECKER' dist"
  [ "$status" -eq 2 ]
  assert_output_contains 'expected exactly one tarball'
}

@test "the checker refuses to run without a package directory" {
  run_checker ''
  [ "$status" -eq 2 ]
  assert_output_contains 'usage: check-licenses.ts <package-dir>'
}
