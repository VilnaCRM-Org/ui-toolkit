#!/usr/bin/env bats

load './test_helper.bash'

MAKEFILE="$PROJECT_ROOT/Makefile"
SCANNER="$PROJECT_ROOT/scripts/ci/scan-secrets.sh"
WORKFLOW="$PROJECT_ROOT/.github/workflows/secret-scanning.yml"
PINNED_IMAGE='ghcr.io/gitleaks/gitleaks:v8.30.1@sha256:c00b6bd0aeb3071cbcb79009cb16a60dd9e0a7c60e2be9ab65d25e6bc8abbb7f'

setup() {
  setup_makefile_test_env
  create_gitleaks_docker_stub
  create_git_stub
  export WORKSPACE="$BATS_TEST_TMPDIR/workspace"
  mkdir -p "$WORKSPACE"
  cp "$PROJECT_ROOT/.gitleaks.toml" "$WORKSPACE/.gitleaks.toml"
}

create_gitleaks_docker_stub() {
  cat > "$STUB_BIN_DIR/docker" <<'EOF'
#!/usr/bin/env bash
printf 'docker %s\n' "$*" >> "${COMMAND_LOG:?}"

host_probe=""
for arg in "$@"; do
  case "$arg" in
    *:/probe) host_probe="${arg%:/probe}" ;;
    *:/package:ro) find "${arg%:/package:ro}" -type f | sed 's|^.*/package/|mounted package/|' >> "${COMMAND_LOG:?}" ;;
  esac
done

if [ -n "$host_probe" ]; then
  if [ "${FAKE_PROBE_DETECTED:-1}" = "1" ]; then
    printf '[{"RuleID": "aws-access-token"}]\n' > "$host_probe/report.json"
    exit 1
  fi
  exit 0
fi

exit "${FAKE_SCAN_EXIT:-0}"
EOF
  chmod +x "$STUB_BIN_DIR/docker"
}

create_git_stub() {
  cat > "$STUB_BIN_DIR/git" <<'EOF'
#!/usr/bin/env bash
printf 'git %s\n' "$*" >> "${COMMAND_LOG:?}"
if [ "${1:-}" = "-C" ] && [ "${3:-}" = "rev-parse" ] && [ "${4:-}" = "--is-shallow-repository" ]; then
  printf '%s\n' "${FAKE_SHALLOW:-false}"
fi
exit 0
EOF
  chmod +x "$STUB_BIN_DIR/git"
}

run_scanner() {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    COMMAND_LOG="$COMMAND_LOG" \
    GITLEAKS_IMAGE="${GITLEAKS_IMAGE-$PINNED_IMAGE}" \
    SECRETS_WORKSPACE="$WORKSPACE" \
    "$@" \
    bash "$SCANNER"
}

@test "Makefile pins the gitleaks image by digest" {
  grep -qE '^GITLEAKS_IMAGE\s*=\s*ghcr\.io/gitleaks/gitleaks:v[0-9.]+@sha256:[0-9a-f]{64}$' "$MAKEFILE"
}

@test "lint-secrets runs the scanner in tree mode with the pinned image" {
  grep -A 2 '^lint-secrets:' "$MAKEFILE" | grep -q 'SECRETS_MODE=tree'
  grep -A 2 '^lint-secrets:' "$MAKEFILE" | grep -q 'GITLEAKS_IMAGE="$(GITLEAKS_IMAGE)"'
  grep -A 2 '^lint-secrets:' "$MAKEFILE" | grep -q 'bash $(SECRETS_SCANNER)'
}

@test "scan-secrets-history runs the scanner in history mode and forwards SECRETS_LOG_OPTS" {
  grep -A 2 '^scan-secrets-history:' "$MAKEFILE" | grep -q 'SECRETS_MODE=history'
  grep -A 2 '^scan-secrets-history:' "$MAKEFILE" | grep -q 'SECRETS_LOG_OPTS="$(SECRETS_LOG_OPTS)"'
}

@test "both secret scans are verify gates and declared phony" {
  grep -A 1 '^VERIFY_EXTRA_GATES' "$MAKEFILE" | grep -q 'lint-secrets scan-secrets-history'
  awk '/^\.PHONY/{buf=""; flag=1} flag{buf=buf $0; if(/\\$/)next; if(buf ~ /lint-secrets/ && buf ~ /scan-secrets-history/){found=1; exit}} END{exit !found}' "$MAKEFILE"
}

@test "the scanner refuses an image that is not digest-pinned" {
  GITLEAKS_IMAGE='ghcr.io/gitleaks/gitleaks:v8.30.1' run_scanner
  [ "$status" -eq 1 ]
  assert_output_contains 'is not digest-pinned'
  assert_log_not_contains 'docker'
}

@test "the scanner refuses a truncated digest" {
  GITLEAKS_IMAGE='ghcr.io/gitleaks/gitleaks:v8.30.1@sha256:c00b6bd0' run_scanner
  [ "$status" -eq 1 ]
  assert_output_contains 'is not 64 lowercase hex characters'
  assert_log_not_contains 'docker'
}

@test "the scanner refuses to run without the committed policy" {
  rm "$WORKSPACE/.gitleaks.toml"
  run_scanner
  [ "$status" -eq 1 ]
  assert_output_contains "config '.gitleaks.toml' not found"
  assert_log_not_contains 'docker'
}

@test "the scanner refuses an unknown mode" {
  run_scanner SECRETS_MODE=diff
  [ "$status" -eq 1 ]
  assert_output_contains "SECRETS_MODE must be 'tree', 'history' or 'package'"
  assert_log_not_contains 'docker'
}

@test "tree mode scans the mounted workspace read-only with the committed policy" {
  run_scanner SECRETS_MODE=tree
  [ "$status" -eq 0 ]
  assert_log_contains "docker run --rm -v $WORKSPACE:/repo:ro -w /repo $PINNED_IMAGE dir --no-banner --redact --exit-code 1 --config /repo/.gitleaks.toml /repo"
  assert_output_contains 'positive control passed'
}

@test "tree mode fails when the scanner reports a leak" {
  FAKE_SCAN_EXIT=1 run_scanner SECRETS_MODE=tree
  [ "$status" -eq 1 ]
  assert_log_not_contains ':/probe'
}

@test "history mode refuses a workspace without a git directory" {
  run_scanner SECRETS_MODE=history
  [ "$status" -eq 1 ]
  assert_output_contains 'needs a git directory'
  assert_log_not_contains 'docker'
}

@test "history mode refuses a shallow clone" {
  mkdir -p "$WORKSPACE/.git"
  FAKE_SHALLOW=true run_scanner SECRETS_MODE=history
  [ "$status" -eq 1 ]
  assert_output_contains 'shallow'
  assert_log_not_contains 'docker'
}

@test "history mode walks the whole log with the safe.directory exemption" {
  mkdir -p "$WORKSPACE/.git"
  run_scanner SECRETS_MODE=history
  [ "$status" -eq 0 ]
  assert_log_contains "-e GIT_CONFIG_COUNT=1 -e GIT_CONFIG_KEY_0=safe.directory -e GIT_CONFIG_VALUE_0=/repo $PINNED_IMAGE git --no-banner --redact --exit-code 1 --config /repo/.gitleaks.toml /repo"
  assert_log_not_contains '--log-opts'
}

@test "history mode narrows the walk to SECRETS_LOG_OPTS when given" {
  mkdir -p "$WORKSPACE/.git"
  run_scanner SECRETS_MODE=history SECRETS_LOG_OPTS='origin/main..HEAD'
  [ "$status" -eq 0 ]
  assert_log_contains '--log-opts origin/main..HEAD /repo'
}

write_package_tarball() {
  local staging="$BATS_TEST_TMPDIR/staging"
  mkdir -p "$staging/package/build" "$WORKSPACE/dist"
  printf 'export const a = 1;\n' > "$staging/package/build/index.mjs"
  tar -czf "$WORKSPACE/dist/${1:-fixture-1.0.0}.tgz" -C "$staging" package
}

@test "package mode scans the unpacked tarball read-only with the committed policy" {
  write_package_tarball
  run_scanner SECRETS_MODE=package
  [ "$status" -eq 0 ]
  assert_log_contains ":/package:ro -v $WORKSPACE/.gitleaks.toml:/gitleaks.toml:ro $PINNED_IMAGE dir --no-banner --redact --exit-code 1 --config /gitleaks.toml /package"
  assert_log_contains 'mounted package/build/index.mjs'
  assert_output_contains 'positive control passed'
}

@test "package mode reads the directory SECRETS_PACKAGE_DIR names" {
  write_package_tarball
  mv "$WORKSPACE/dist" "$WORKSPACE/release"
  run_scanner SECRETS_MODE=package SECRETS_PACKAGE_DIR=release
  [ "$status" -eq 0 ]
  assert_log_contains 'mounted package/build/index.mjs'
}

@test "package mode fails when the scanner reports a leak in the tarball" {
  write_package_tarball
  FAKE_SCAN_EXIT=1 run_scanner SECRETS_MODE=package
  [ "$status" -eq 1 ]
  assert_log_not_contains ':/probe'
}

@test "package mode refuses a package directory without a tarball" {
  run_scanner SECRETS_MODE=package
  [ "$status" -eq 1 ]
  assert_output_contains 'needs exactly one tarball'
  assert_log_not_contains 'docker'
}

@test "package mode refuses to guess between two tarballs" {
  write_package_tarball fixture-1.0.0
  write_package_tarball fixture-1.1.0
  run_scanner SECRETS_MODE=package
  [ "$status" -eq 1 ]
  assert_output_contains 'needs exactly one tarball'
  assert_log_not_contains 'docker'
}

@test "the run fails closed when the scanner lets the seeded credential through" {
  FAKE_PROBE_DETECTED=0 run_scanner SECRETS_MODE=tree
  [ "$status" -eq 1 ]
  assert_output_contains 'exited 0 on a seeded credential instead of reporting it'
}

@test "the seeded credential never appears literally in the repository" {
  ! grep -rqF "AKIA"'Q7Z3M2X4K6W5P3Y2' "$PROJECT_ROOT/scripts" "$PROJECT_ROOT/tests" "$PROJECT_ROOT/Makefile"
}

@test "the policy extends the gitleaks defaults" {
  grep -qxF 'useDefault = true' "$PROJECT_ROOT/.gitleaks.toml"
}

@test "every allowlisted path is gitignored build output, so a CI checkout never contains it" {
  local entry name count=0
  while IFS= read -r entry; do
    name="$(printf '%s' "$entry" | sed -E "s|^ *'''\^\(/repo/\)\?||; s|/''',?$||; s|\\\\||g")"
    [ -n "$name" ]
    grep -qE "^${name//./\\.}/?$" "$PROJECT_ROOT/.gitignore"
    count=$((count + 1))
  done < <(grep -E "^  '''" "$PROJECT_ROOT/.gitleaks.toml")
  [ "$count" -gt 0 ]
}

@test "the workflow gates pull requests on the tree scan and the pull request's own commits" {
  grep -qF 'run: make lint-secrets' "$WORKFLOW"
  grep -qF 'run: make scan-secrets-history SECRETS_LOG_OPTS="$BASE_REF..HEAD"' "$WORKFLOW"
  grep -qF 'BASE_REF: origin/${{ github.base_ref }}' "$WORKFLOW"
}

@test "the workflow walks the full history on pushes to main and on a weekly schedule" {
  grep -qF 'run: make scan-secrets-history' "$WORKFLOW"
  grep -qE '^\s+- cron:' "$WORKFLOW"
  [ "$(grep -c 'fetch-depth: 0' "$WORKFLOW")" -eq 2 ]
}
