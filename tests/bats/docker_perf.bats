#!/usr/bin/env bats
#
# Unit coverage for the pure subcommands of scripts/ci/docker_perf.sh plus the
# repo contract for the Dockerfile performance gate wiring.
#
# Scope note: the `run` orchestration subcommand is intentionally not unit-
# tested here because it invokes real `docker buildx`, `dive`, and `hadolint`.

load './test_helper.bash'

SCRIPT="$BATS_TEST_DIRNAME/../../scripts/ci/docker_perf.sh"

readonly MIB=1048576

# ---------------------------------------------------------------------------
# evaluate
# ---------------------------------------------------------------------------

@test "evaluate: PASS exit 0 when under budget and all gates clean (positive)" {
  run env CURRENT_BYTES=$((10 * MIB)) BUDGET_MB=100 TOLERANCE_PCT=0 \
    DIVE_STATUS=0 HADOLINT_STATUS=0 EXCEPTION_REASON="" \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 0 ]
  [[ "$output" == PASS* ]]
  [[ "$output" == *"all gates within budget"* ]]
}

@test "evaluate: FAIL exit 1 when size exceeds budget and no exception (negative)" {
  run env CURRENT_BYTES=$((200 * MIB)) BUDGET_MB=100 TOLERANCE_PCT=0 \
    DIVE_STATUS=0 HADOLINT_STATUS=0 EXCEPTION_REASON="" \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 1 ]
  [[ "$output" == FAIL* ]]
  [[ "$output" == *"exceeds limit"* ]]
  [[ "$output" == *"a documented exception is required"* ]]
}

@test "evaluate: EXCEPTION exit 0 when over budget but a documented exception applies (negative-waived)" {
  run env CURRENT_BYTES=$((200 * MIB)) BUDGET_MB=100 TOLERANCE_PCT=0 \
    DIVE_STATUS=0 HADOLINT_STATUS=0 EXCEPTION_REASON="glibc baseline only" \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 0 ]
  [[ "$output" == EXCEPTION* ]]
  [[ "$output" == *"glibc baseline only"* ]]
  [[ "$output" == *"(waived)"* ]]
  [[ "$output" == *"exceeds limit"* ]]
}

@test "evaluate: EXCEPTION when a scoped size exception covers the only failing gate (negative-waived)" {
  run env CURRENT_BYTES=$((200 * MIB)) BUDGET_MB=100 TOLERANCE_PCT=0 \
    DIVE_STATUS=0 HADOLINT_STATUS=0 EXCEPTION_SCOPE="size" \
    EXCEPTION_REASON="glibc baseline only" bash "$SCRIPT" evaluate
  [ "$status" -eq 0 ]
  [[ "$output" == EXCEPTION* ]]
  [[ "$output" == *"glibc baseline only"* ]]
  [[ "$output" == *"(waived) size"* ]]
  [[ "$output" == *"exceeds limit"* ]]
}

@test "evaluate: FAIL when a scoped size exception does not waive a dive failure (negative)" {
  run env CURRENT_BYTES=$((200 * MIB)) BUDGET_MB=100 TOLERANCE_PCT=0 \
    DIVE_STATUS=1 HADOLINT_STATUS=0 EXCEPTION_SCOPE="size" \
    EXCEPTION_REASON="glibc baseline only" bash "$SCRIPT" evaluate
  [ "$status" -eq 1 ]
  [[ "$output" == FAIL* ]]
  [[ "$output" == *"dive layer-efficiency gate failed"* ]]
  [[ "$output" != *"hadolint"* ]]
  [[ "$output" != *"exceeds limit"* ]]
}

@test "evaluate: PASS when size is exactly at the limit (boundary)" {
  run env CURRENT_BYTES=$((100 * MIB)) BUDGET_MB=100 TOLERANCE_PCT=0 \
    DIVE_STATUS=0 HADOLINT_STATUS=0 EXCEPTION_REASON="" \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 0 ]
  [[ "$output" == PASS* ]]
}

@test "evaluate: FAIL when size is one byte over the limit (boundary)" {
  run env CURRENT_BYTES=$((100 * MIB + 1)) BUDGET_MB=100 TOLERANCE_PCT=0 \
    DIVE_STATUS=0 HADOLINT_STATUS=0 EXCEPTION_REASON="" \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 1 ]
  [[ "$output" == FAIL* ]]
  [[ "$output" == *"exceeds limit"* ]]
}

@test "evaluate: FAIL when only the dive gate fails (negative)" {
  run env CURRENT_BYTES=$((10 * MIB)) BUDGET_MB=100 TOLERANCE_PCT=0 \
    DIVE_STATUS=1 HADOLINT_STATUS=0 EXCEPTION_REASON="" \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 1 ]
  [[ "$output" == FAIL* ]]
  [[ "$output" == *"dive layer-efficiency gate failed"* ]]
  [[ "$output" != *"hadolint"* ]]
  [[ "$output" != *"exceeds limit"* ]]
}

@test "evaluate: FAIL when only the hadolint gate fails (negative)" {
  run env CURRENT_BYTES=$((10 * MIB)) BUDGET_MB=100 TOLERANCE_PCT=0 \
    DIVE_STATUS=0 HADOLINT_STATUS=1 EXCEPTION_REASON="" \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 1 ]
  [[ "$output" == FAIL* ]]
  [[ "$output" == *"hadolint best-practice gate failed"* ]]
  [[ "$output" != *"dive"* ]]
}

@test "evaluate: tolerance widens the limit so just-over-budget passes (boundary)" {
  run env CURRENT_BYTES=$((MIB + 1)) BUDGET_MB=1 TOLERANCE_PCT=10 \
    DIVE_STATUS=0 HADOLINT_STATUS=0 EXCEPTION_REASON="" \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 0 ]
  [[ "$output" == PASS* ]]
}

@test "evaluate: at the tolerance-widened limit passes, one byte beyond fails (boundary)" {
  local limit=$(( MIB * 110 / 100 ))

  run env CURRENT_BYTES="$limit" BUDGET_MB=1 TOLERANCE_PCT=10 \
    DIVE_STATUS=0 HADOLINT_STATUS=0 EXCEPTION_REASON="" \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 0 ]
  [[ "$output" == PASS* ]]

  run env CURRENT_BYTES="$((limit + 1))" BUDGET_MB=1 TOLERANCE_PCT=10 \
    DIVE_STATUS=0 HADOLINT_STATUS=0 EXCEPTION_REASON="" \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 1 ]
  [[ "$output" == FAIL* ]]
}

# ---------------------------------------------------------------------------
# detect-exception
# ---------------------------------------------------------------------------

@test "detect-exception-scope: extracts a scoped inline marker (positive)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.scope"
  cat > "$df" <<'EOF'
FROM alpine
# perf-exception:size: large base image is required for native deps
RUN true
EOF

  run bash "$SCRIPT" detect-exception-scope "$df"
  [ "$status" -eq 0 ]
  [ "$output" = "size" ]
}

@test "detect-exception-scope: extracts a multi-gate inline marker (positive)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.multiscope"
  cat > "$df" <<'EOF'
FROM alpine
# perf-exception:size,dive: huge vendor base trips size and dive
RUN true
EOF

  run env -u PERF_EXCEPTION_LABEL -u PERF_EXCEPTION_IMAGE_LABEL bash "$SCRIPT" detect-exception-scope "$df"
  [ "$status" -eq 0 ]
  [ "$output" = "size,dive" ]
}

@test "detect-exception-scope: a PR label widens a narrowly-scoped inline marker (edge)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.widen"
  cat > "$df" <<'EOF'
FROM alpine
# perf-exception:size: glibc only
RUN true
EOF

  run env PERF_EXCEPTION_LABEL=true bash "$SCRIPT" detect-exception-scope "$df"
  [ "$status" -eq 0 ]
  [ "$output" = "all" ]

  run env PERF_EXCEPTION_IMAGE_LABEL=true bash "$SCRIPT" detect-exception-scope "$df"
  [ "$status" -eq 0 ]
  [ "$output" = "all" ]
}

@test "detect-exception-scope: plain markers and PR labels remain blanket waivers (positive)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.plain-scope"
  cat > "$df" <<'EOF'
FROM alpine
# perf-exception: inline wins
EOF

  run bash "$SCRIPT" detect-exception-scope "$df"
  [ "$status" -eq 0 ]
  [ "$output" = "all" ]

  run env PERF_EXCEPTION_LABEL=true bash "$SCRIPT" detect-exception-scope "$BATS_TEST_TMPDIR/does-not-exist"
  [ "$status" -eq 0 ]
  [ "$output" = "all" ]
}

@test "detect-exception: extracts the inline marker reason verbatim (positive)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.marker"
  cat > "$df" <<'EOF'
FROM alpine
# perf-exception: large base image is required for native deps
RUN true
EOF

  run bash "$SCRIPT" detect-exception "$df"
  [ "$status" -eq 0 ]
  [ "$output" = "large base image is required for native deps" ]
}

@test "detect-exception: scoped inline markers strip the gate prefix from the reason (positive)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.scoped-reason"
  cat > "$df" <<'EOF'
FROM alpine
# perf-exception:size: glibc only
EOF

  run bash "$SCRIPT" detect-exception "$df"
  [ "$status" -eq 0 ]
  [ "$output" = "glibc only" ]
}

@test "detect-exception: empty output when no marker and no label (negative)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.plain"
  cat > "$df" <<'EOF'
FROM alpine
RUN true
EOF

  run env -u PERF_EXCEPTION_LABEL -u PERF_EXCEPTION_IMAGE_LABEL -u NAME bash "$SCRIPT" detect-exception "$df"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

@test "detect-exception: falls back to PR-label reason when no marker present (positive)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.label"
  cat > "$df" <<'EOF'
FROM alpine
RUN true
EOF

  run env -u PERF_EXCEPTION_LABEL_NAME PERF_EXCEPTION_LABEL=true bash "$SCRIPT" detect-exception "$df"
  [ "$status" -eq 0 ]
  [[ "$output" == *"PR label 'docker-perf-exception' applied"* ]]
}

@test "detect-exception: label reason honors a custom label name (positive)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.label2"
  cat > "$df" <<'EOF'
FROM alpine
EOF

  run env PERF_EXCEPTION_LABEL=true PERF_EXCEPTION_LABEL_NAME=size-waiver \
    bash "$SCRIPT" detect-exception "$df"
  [ "$status" -eq 0 ]
  [[ "$output" == *"PR label 'size-waiver' applied"* ]]
}

@test "detect-exception: marker takes precedence over the label (edge)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.both"
  cat > "$df" <<'EOF'
FROM alpine
# perf-exception: inline wins
EOF

  run env PERF_EXCEPTION_LABEL=true bash "$SCRIPT" detect-exception "$df"
  [ "$status" -eq 0 ]
  [ "$output" = "inline wins" ]
}

@test "detect-exception: marker match is case-insensitive and trims whitespace (edge)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.case"
  cat > "$df" <<'EOF'
FROM alpine
#   Perf-Exception:  glibc only
EOF

  run bash "$SCRIPT" detect-exception "$df"
  [ "$status" -eq 0 ]
  [ "$output" = "glibc only" ]
}

@test "detect-exception: a marker-like string inside a RUN command is not a waiver (edge)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.instring"
  cat > "$df" <<'EOF'
FROM alpine
RUN echo "documenting the # perf-exception: policy"
EOF

  run env -u PERF_EXCEPTION_LABEL -u PERF_EXCEPTION_IMAGE_LABEL -u NAME bash "$SCRIPT" detect-exception "$df"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

@test "detect-exception: scoped image label waives only the named image (positive)" {
  local df="$BATS_TEST_TMPDIR/Dockerfile.scoped"
  cat > "$df" <<'EOF'
FROM alpine
EOF

  run env -u PERF_EXCEPTION_LABEL -u PERF_EXCEPTION_LABEL_NAME \
    PERF_EXCEPTION_IMAGE_LABEL=true NAME=production \
    bash "$SCRIPT" detect-exception "$df"
  [ "$status" -eq 0 ]
  [ "$output" = "PR label 'docker-perf-exception:production' applied" ]
}

@test "detect-exception: missing/nonexistent file path yields empty output, exit 0 (edge)" {
  run env -u PERF_EXCEPTION_LABEL -u PERF_EXCEPTION_IMAGE_LABEL -u NAME bash "$SCRIPT" detect-exception "$BATS_TEST_TMPDIR/does-not-exist"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

# ---------------------------------------------------------------------------
# render-report
# ---------------------------------------------------------------------------

@test "render-report: passing image with a base shows name, pass cell and signed delta (positive)" {
  local json="$BATS_TEST_TMPDIR/pass.json"
  cat > "$json" <<'EOF'
{
  "name": "web-prod",
  "dockerfile": "Dockerfile",
  "current_bytes": 104857600,
  "base_bytes": 94371840,
  "build_ms": 42000,
  "base_build_ms": 40000,
  "budget_mb": 150,
  "tolerance_pct": 10,
  "dive_status": 0,
  "hadolint_status": 0,
  "verdict": "pass",
  "exception": ""
}
EOF

  run bash "$SCRIPT" render-report "$json"
  [ "$status" -eq 0 ]
  [[ "$output" == *"web-prod"* ]]
  [[ "$output" == *"| pass |"* ]]
  [[ "$output" == *"+10 MiB"* ]]
  [[ "$output" == *"150 MiB +10%"* ]]
}

@test "render-report: base_bytes of 0 renders the delta cell as n/a (boundary)" {
  local json="$BATS_TEST_TMPDIR/nobase.json"
  cat > "$json" <<'EOF'
{
  "name": "web-prod",
  "dockerfile": "Dockerfile",
  "current_bytes": 104857600,
  "base_bytes": 0,
  "build_ms": 42000,
  "base_build_ms": 0,
  "budget_mb": 150,
  "tolerance_pct": 0,
  "dive_status": 0,
  "hadolint_status": 0,
  "verdict": "pass",
  "exception": ""
}
EOF

  run bash "$SCRIPT" render-report "$json"
  [ "$status" -eq 0 ]
  local delta
  delta="$(printf '%s\n' "$output" | awk -F'|' '{gsub(/^[[:space:]]+|[[:space:]]+$/, "", $5); print $5}')"
  [ "$delta" = "n/a" ]
}

@test "render-report: failing verdict renders the fail status cell (negative)" {
  local json="$BATS_TEST_TMPDIR/fail.json"
  cat > "$json" <<'EOF'
{
  "name": "web-prod",
  "dockerfile": "Dockerfile",
  "current_bytes": 314572800,
  "base_bytes": 94371840,
  "build_ms": 42000,
  "base_build_ms": 40000,
  "budget_mb": 150,
  "tolerance_pct": 0,
  "dive_status": 1,
  "hadolint_status": 0,
  "verdict": "fail",
  "exception": ""
}
EOF

  run bash "$SCRIPT" render-report "$json"
  [ "$status" -eq 0 ]
  [[ "$output" == *"| fail |"* ]]
}

@test "render-report: exception verdict shows the exception cell with its reason (negative-waived)" {
  local json="$BATS_TEST_TMPDIR/exc.json"
  cat > "$json" <<'EOF'
{
  "name": "web-prod",
  "dockerfile": "Dockerfile",
  "current_bytes": 314572800,
  "base_bytes": 94371840,
  "build_ms": 42000,
  "base_build_ms": 40000,
  "budget_mb": 150,
  "tolerance_pct": 0,
  "dive_status": 0,
  "hadolint_status": 0,
  "verdict": "exception",
  "exception": "PR label 'docker-perf-exception' applied"
}
EOF

  run bash "$SCRIPT" render-report "$json"
  [ "$status" -eq 0 ]
  [[ "$output" == *"| exception - PR label 'docker-perf-exception' applied |"* ]]
  [[ "$output" == *"PR label 'docker-perf-exception' applied"* ]]
}

@test "render-report: negative delta when the image shrank vs base (edge)" {
  local json="$BATS_TEST_TMPDIR/shrink.json"
  cat > "$json" <<'EOF'
{
  "name": "web-prod",
  "dockerfile": "Dockerfile",
  "current_bytes": 94371840,
  "base_bytes": 104857600,
  "build_ms": 42000,
  "base_build_ms": 40000,
  "budget_mb": 150,
  "tolerance_pct": 0,
  "dive_status": 0,
  "hadolint_status": 0,
  "verdict": "pass",
  "exception": ""
}
EOF

  run bash "$SCRIPT" render-report "$json"
  [ "$status" -eq 0 ]
  [[ "$output" == *"-10 MiB"* ]]
  [[ "$output" != *"+10 MiB"* ]]
}

# ---------------------------------------------------------------------------
# Repo contract
# ---------------------------------------------------------------------------

@test "repo contract: workflow exists and keeps least-privilege permissions" {
  local workflow="$PROJECT_ROOT/.github/workflows/dockerfile-performance.yml"

  [ -f "$workflow" ]

  run grep -F 'permissions: {}' "$workflow"
  [ "$status" -eq 0 ]

  run grep -F 'contents: read' "$workflow"
  [ "$status" -eq 0 ]

  run grep -F 'pull-requests: write' "$workflow"
  [ "$status" -eq 0 ]
}

@test "repo contract: workflow triggers on the Dockerfiles and gate files used here" {
  local workflow="$PROJECT_ROOT/.github/workflows/dockerfile-performance.yml"

  [ -f "$workflow" ]

  # Accept any YAML quoting style ('x', "x", or bare x): all are equivalent
  # for a path trigger, so the contract checks the path, not its formatting.
  run grep -E "^[[:space:]]*-[[:space:]]*['\"]?Dockerfile['\"]?[[:space:]]*$" "$workflow"
  [ "$status" -eq 0 ]

  run grep -E "^[[:space:]]*-[[:space:]]*['\"]?Dockerfile\\.playwright['\"]?[[:space:]]*$" "$workflow"
  [ "$status" -eq 0 ]

  run grep -F ".github/dockerfile-perf.json" "$workflow"
  [ "$status" -eq 0 ]

  run grep -F "scripts/ci/docker_perf.sh" "$workflow"
  [ "$status" -eq 0 ]
}

@test "repo contract: workflow writes PR-report artifacts from a non-hidden directory" {
  local workflow="$PROJECT_ROOT/.github/workflows/dockerfile-performance.yml"

  [ -f "$workflow" ]

  run grep -F "OUT_DIR: docker-perf" "$workflow"
  [ "$status" -eq 0 ]

  run grep -F "path: docker-perf/" "$workflow"
  [ "$status" -eq 0 ]
}

@test "repo contract: docker perf config covers the current image matrix" {
  local config="$PROJECT_ROOT/.github/dockerfile-perf.json"

  [ -f "$config" ]

  run grep -F '"dockerfile": "Dockerfile"' "$config"
  [ "$status" -eq 0 ]

  run grep -F '"dockerfile": "Dockerfile.playwright"' "$config"
  [ "$status" -eq 0 ]
}

@test "repo contract: CONTRIBUTING explains the policy and the Playwright exception path" {
  run grep -F 'Dockerfile.playwright' "$PROJECT_ROOT/CONTRIBUTING.md"
  [ "$status" -eq 0 ]

  run grep -F '# perf-exception:' "$PROJECT_ROOT/CONTRIBUTING.md"
  [ "$status" -eq 0 ]

  run grep -F 'toolkit' "$PROJECT_ROOT/CONTRIBUTING.md"
  [ "$status" -eq 0 ]

  run grep -F 'playwright' "$PROJECT_ROOT/CONTRIBUTING.md"
  [ "$status" -eq 0 ]
}

@test "repo contract: .dockerignore excludes the CI base checkout" {
  run grep -Fx 'base' "$PROJECT_ROOT/.dockerignore"
  [ "$status" -eq 0 ]
}

@test "repo contract: Playwright Dockerfile documents its perf exception inline" {
  run grep -F '# perf-exception:size,dive:' "$PROJECT_ROOT/Dockerfile.playwright"
  [ "$status" -eq 0 ]
}
