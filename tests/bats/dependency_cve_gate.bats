#!/usr/bin/env bats

load './test_helper.bash'

MAKEFILE="$PROJECT_ROOT/Makefile"
SCANNER="$PROJECT_ROOT/scripts/ci/scan-vulnerabilities.sh"
REPORTER="$PROJECT_ROOT/scripts/ci/report-dependency-audit.sh"
WORKFLOW="$PROJECT_ROOT/.github/workflows/dependency-cve-scanning.yml"
PINNED_IMAGE='aquasec/trivy:0.74.0@sha256:62b1e65e8869bc4b4c6aa4fa2b21595256c7c2f6018a9d9ad61caf87187c1969'
CLEAN_REPORT='{"SchemaVersion":2,"ArtifactName":"bun.lock","Results":[{"Target":"bun.lock","Class":"lang-pkgs","Type":"bun"}]}'
EMPTY_REPORT='{"SchemaVersion":2,"ArtifactName":"bun.lock"}'
DIRTY_REPORT='{"SchemaVersion":2,"ArtifactName":"bun.lock","Results":[{"Target":"bun.lock","Vulnerabilities":[{"PkgName":"nanoid","InstalledVersion":"3.3.11","FixedVersion":"3.3.16","VulnerabilityID":"GHSA-28wg-ghj8-5hjv","Severity":"HIGH"},{"PkgName":"basic-ftp","InstalledVersion":"5.2.0","FixedVersion":"5.2.1","VulnerabilityID":"CVE-2026-39983","Severity":"HIGH"}]}]}'

setup() {
  setup_makefile_test_env
  create_trivy_docker_stub
  create_gh_stub
  export WORKSPACE="$BATS_TEST_TMPDIR/workspace"
  export CACHE_DIR="$BATS_TEST_TMPDIR/trivy-cache"
  mkdir -p "$WORKSPACE"
  printf '{}\n' > "$WORKSPACE/bun.lock"
  for dockerfile in Dockerfile Dockerfile.playwright Dockerfile.rca; do
    printf 'FROM scratch\n' > "$WORKSPACE/$dockerfile"
  done
}

create_trivy_docker_stub() {
  cat > "$STUB_BIN_DIR/docker" <<'EOF'
#!/usr/bin/env bash
printf 'docker %s\n' "$*" >> "${COMMAND_LOG:?}"

if [ "$1" = "save" ]; then
  : > "$3"
  exit 0
fi

host_reports=""
output=""
format=""
previous=""
for arg in "$@"; do
  case "$arg" in
    *:/reports) host_reports="${arg%:/reports}" ;;
  esac
  case "$previous" in
    --output) output="$arg" ;;
    --format) format="$arg" ;;
  esac
  previous="$arg"
done

if [ -n "$output" ] && [ -n "$host_reports" ]; then
  case "$format" in
    json) printf '%s\n' "${FAKE_TRIVY_JSON:-}" > "$host_reports/${output#/reports/}" ;;
    *) printf '{"version":"2.1.0","runs":[]}\n' > "$host_reports/${output#/reports/}" ;;
  esac
  exit 0
fi

if [ "$format" = "table" ]; then
  exit "${FAKE_GATE_EXIT:-0}"
fi

exit 0
EOF
  chmod +x "$STUB_BIN_DIR/docker"
}

create_gh_stub() {
  cat > "$STUB_BIN_DIR/gh" <<'EOF'
#!/usr/bin/env bash
printf 'gh %s\n' "$*" >> "${COMMAND_LOG:?}"
case "$1 $2" in
  "issue list") printf '%s\n' "${FAKE_OPEN_ISSUES:-}" ;;
  "issue view") printf '%s\n' "${FAKE_ISSUE_BODY:-}" ;;
esac
exit 0
EOF
  chmod +x "$STUB_BIN_DIR/gh"
}

run_scanner() {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    COMMAND_LOG="$COMMAND_LOG" \
    TRIVY_IMAGE="${TRIVY_IMAGE-$PINNED_IMAGE}" \
    TRIVY_CACHE_DIR="$CACHE_DIR" \
    SCAN_WORKSPACE="$WORKSPACE" \
    "$@" \
    bash "$SCANNER"
}

run_reporter() {
  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    COMMAND_LOG="$COMMAND_LOG" \
    TRIVY_IMAGE="${TRIVY_IMAGE-$PINNED_IMAGE}" \
    TRIVY_CACHE_DIR="$CACHE_DIR" \
    SCAN_WORKSPACE="$WORKSPACE" \
    "$@" \
    bash "$REPORTER"
}

@test "Makefile pins the trivy image by digest" {
  grep -qE '^TRIVY_IMAGE\s*=\s*aquasec/trivy:[0-9.]+@sha256:[0-9a-f]{64}$' "$MAKEFILE"
}

@test "lint-vulns scans the lockfile through the vulnerability scanner" {
  grep -A 2 '^lint-vulns:' "$MAKEFILE" | grep -q 'SCAN_TARGET=lockfile bash $(VULNERABILITY_SCANNER)'
  grep -A 2 '^lint-vulns:' "$MAKEFILE" | grep -q '$(TRIVY_ENV)'
}

@test "each CI image has its own scan target naming its compose service" {
  local service
  for service in bun playwright rca; do
    grep -A 2 "^scan-image-$service:" "$MAKEFILE" | grep -q "SCAN_TARGET=image SCAN_SERVICE=$service bash \$(VULNERABILITY_SCANNER)"
  done
}

@test "report-dependency-audit runs the audit reporter with the trivy environment" {
  grep -A 2 '^report-dependency-audit:' "$MAKEFILE" | grep -q '$(TRIVY_ENV) bash $(DEPENDENCY_AUDIT_REPORTER)'
}

@test "the lockfile and image scans are verify gates" {
  local gate
  for gate in lint-vulns scan-image-bun scan-image-playwright scan-image-rca; do
    grep -A 1 '^VERIFY_EXTRA_GATES' "$MAKEFILE" | grep -q -- "$gate"
  done
}

@test "the scanner refuses an image that is not digest-pinned" {
  TRIVY_IMAGE='aquasec/trivy:0.74.0' run_scanner SCAN_TARGET=lockfile
  [ "$status" -eq 1 ]
  assert_output_contains 'is not digest-pinned'
  assert_log_not_contains 'docker'
}

@test "the scanner refuses an unknown target" {
  run_scanner SCAN_TARGET=sbom
  [ "$status" -eq 1 ]
  assert_output_contains "SCAN_TARGET must be 'lockfile' or 'image'"
  assert_log_not_contains 'docker'
}

@test "the scanner refuses an unknown image service" {
  run_scanner SCAN_TARGET=image SCAN_SERVICE=storybook
  [ "$status" -eq 1 ]
  assert_output_contains "SCAN_SERVICE must be 'bun', 'playwright' or 'rca'"
  assert_log_not_contains 'docker'
}

@test "the lockfile scan writes SARIF first, then gates on the production closure" {
  run_scanner SCAN_TARGET=lockfile
  [ "$status" -eq 0 ]
  assert_log_contains "$PINNED_IMAGE fs --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed --no-progress bun.lock --format sarif --output /reports/bun-lock.sarif --exit-code 0"
  assert_log_contains "$PINNED_IMAGE fs --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed --no-progress bun.lock --format table --exit-code 1"
  [ -f "$WORKSPACE/reports/trivy/bun-lock.sarif" ]
  assert_log_not_contains '--include-dev-deps'
}

@test "the lockfile scan runs trivy as the invoking user with a read-only workspace" {
  run_scanner SCAN_TARGET=lockfile
  [ "$status" -eq 0 ]
  assert_log_contains "--user $(id -u):$(id -g) -e TRIVY_CACHE_DIR=/cache -v $CACHE_DIR:/cache -v $WORKSPACE:/repo:ro -v $WORKSPACE/reports/trivy:/reports -w /repo"
}

@test "the lockfile scan fails when the gating run reports a finding, keeping the SARIF" {
  FAKE_GATE_EXIT=1 run_scanner SCAN_TARGET=lockfile
  [ "$status" -eq 1 ]
  [ -f "$WORKSPACE/reports/trivy/bun-lock.sarif" ]
}

@test "the image scan builds the service's Dockerfile, saves it, and gates on OS packages only" {
  run_scanner SCAN_TARGET=image SCAN_SERVICE=rca
  [ "$status" -eq 0 ]
  assert_log_contains "docker build -f $WORKSPACE/Dockerfile.rca -t ui-toolkit-scan-rca $WORKSPACE"
  assert_log_contains "docker save -o $WORKSPACE/reports/trivy/ui-toolkit-scan-rca.tar ui-toolkit-scan-rca"
  assert_log_contains "$PINNED_IMAGE image --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed --no-progress --pkg-types os --input /reports/ui-toolkit-scan-rca.tar --format table --exit-code 1"
  [ -f "$WORKSPACE/reports/trivy/ui-toolkit-scan-rca.sarif" ]
  [ ! -f "$WORKSPACE/reports/trivy/ui-toolkit-scan-rca.tar" ]
}

@test "the bun and playwright services map to their own Dockerfiles" {
  run_scanner SCAN_TARGET=image SCAN_SERVICE=bun
  [ "$status" -eq 0 ]
  assert_log_contains "docker build -f $WORKSPACE/Dockerfile -t ui-toolkit-scan-bun"

  reset_command_log
  run_scanner SCAN_TARGET=image SCAN_SERVICE=playwright
  [ "$status" -eq 0 ]
  assert_log_contains "docker build -f $WORKSPACE/Dockerfile.playwright -t ui-toolkit-scan-playwright"
}

@test "the image scan fails when the gating run reports a finding" {
  FAKE_GATE_EXIT=1 run_scanner SCAN_TARGET=image SCAN_SERVICE=bun
  [ "$status" -eq 1 ]
}

@test "the audit scans the whole lockfile, dev dependencies included, without failing" {
  FAKE_TRIVY_JSON="$CLEAN_REPORT" run_reporter
  [ "$status" -eq 0 ]
  assert_log_contains "$PINNED_IMAGE fs --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed --no-progress --include-dev-deps --format json --exit-code 0 --output /reports/dependency-audit.json bun.lock"
}

@test "a clean audit closes the open tracking issues and files nothing" {
  FAKE_TRIVY_JSON="$CLEAN_REPORT" FAKE_OPEN_ISSUES=$'41\n42' run_reporter
  [ "$status" -eq 0 ]
  assert_output_contains 'no fixable HIGH,CRITICAL advisory'
  assert_log_contains 'gh issue close 41 --comment'
  assert_log_contains 'gh issue close 42 --comment'
  assert_log_not_contains 'gh issue create'
}

@test "findings file a labelled tracking issue with one row per advisory" {
  FAKE_TRIVY_JSON="$DIRTY_REPORT" AUDIT_RUN_URL='https://example.test/run/7' run_reporter
  [ "$status" -eq 0 ]
  assert_log_contains 'gh label create dependency-audit'
  assert_log_contains "gh issue create --label dependency-audit --title Dependency audit: fixable HIGH/CRITICAL advisories in the full lockfile --body-file $WORKSPACE/reports/trivy/dependency-audit.md"
  grep -qF 'Total: 2 fixable HIGH,CRITICAL advisories' "$WORKSPACE/reports/trivy/dependency-audit.md"
  grep -qF '| basic-ftp | 5.2.0 | 5.2.1 | CVE-2026-39983 | HIGH |' "$WORKSPACE/reports/trivy/dependency-audit.md"
  grep -qF '| nanoid | 3.3.11 | 3.3.16 | GHSA-28wg-ghj8-5hjv | HIGH |' "$WORKSPACE/reports/trivy/dependency-audit.md"
  grep -qF 'Audit run: https://example.test/run/7' "$WORKSPACE/reports/trivy/dependency-audit.md"
  grep -qE '<!-- dependency-audit:[0-9a-f]{16} -->' "$WORKSPACE/reports/trivy/dependency-audit.md"
}

@test "an unchanged advisory set leaves the existing tracking issue alone" {
  FAKE_TRIVY_JSON="$DIRTY_REPORT" run_reporter
  [ "$status" -eq 0 ]
  local marker
  marker="$(grep -oE 'dependency-audit:[0-9a-f]{16}' "$WORKSPACE/reports/trivy/dependency-audit.md")"

  reset_command_log
  FAKE_TRIVY_JSON="$DIRTY_REPORT" FAKE_OPEN_ISSUES=58 FAKE_ISSUE_BODY="<!-- $marker -->" run_reporter
  [ "$status" -eq 0 ]
  assert_output_contains '#58 already tracks these 2 findings'
  assert_log_not_contains 'gh issue edit'
  assert_log_not_contains 'gh issue comment'
  assert_log_not_contains 'gh issue create'
}

@test "a changed advisory set refreshes the existing tracking issue and says so" {
  FAKE_TRIVY_JSON="$DIRTY_REPORT" FAKE_OPEN_ISSUES=58 FAKE_ISSUE_BODY='<!-- dependency-audit:0000000000000000 -->' run_reporter
  [ "$status" -eq 0 ]
  assert_log_contains "gh issue edit 58 --body-file $WORKSPACE/reports/trivy/dependency-audit.md"
  assert_log_contains 'gh issue comment 58 --body The advisory set changed: 2 fixable HIGH,CRITICAL findings'
  assert_log_not_contains 'gh issue create'
}

@test "a report with no results section at all still counts as clean" {
  FAKE_TRIVY_JSON="$EMPTY_REPORT" FAKE_OPEN_ISSUES=58 run_reporter
  [ "$status" -eq 0 ]
  assert_log_contains 'gh issue close 58 --comment'
}

@test "the audit refuses to report a clean tree from something that is not a trivy report" {
  local shape
  for shape in '{}' '{"Results":[]}' 'null' ''; do
    reset_command_log
    FAKE_TRIVY_JSON="$shape" FAKE_OPEN_ISSUES=58 run_reporter
    [ "$status" -eq 1 ]
    assert_output_contains 'is not a trivy report'
    assert_log_not_contains 'gh issue close'
  done
}

@test "the workflow gates pull requests on the lockfile and every image, uploading SARIF" {
  grep -qF 'run: make lint-vulns' "$WORKFLOW"
  grep -qF 'run: make scan-image-${{ matrix.service }}' "$WORKFLOW"
  grep -qF 'service: [bun, playwright, rca]' "$WORKFLOW"
  [ "$(grep -c 'github/codeql-action/upload-sarif@' "$WORKFLOW")" -eq 2 ]
  [ "$(grep -B 1 'github/codeql-action/upload-sarif@' "$WORKFLOW" | grep -c 'if: always()')" -eq 2 ]
  grep -qF 'sarif_file: reports/trivy/bun-lock.sarif' "$WORKFLOW"
  grep -qF 'sarif_file: reports/trivy/ui-toolkit-scan-${{ matrix.service }}.sarif' "$WORKFLOW"
}

@test "the workflow runs the full audit on a weekly schedule, never on pull requests" {
  grep -qE '^\s+- cron:' "$WORKFLOW"
  grep -qF "if: github.event_name != 'pull_request'" "$WORKFLOW"
  grep -qF 'run: make report-dependency-audit' "$WORKFLOW"
}
