#!/usr/bin/env bats

load './test_helper.bash'

MAKEFILE="$PROJECT_ROOT/Makefile"
DOCKERFILE_RCA="$PROJECT_ROOT/Dockerfile.rca"
WORKFLOW="$PROJECT_ROOT/.github/workflows/rust-code-analysis.yml"
POLICY="$PROJECT_ROOT/config/metrics-policy.json"

# ---- no suppression / baseline file -----------------------------------------

@test "no rca-baseline suppression file exists in the repository" {
  run find "$PROJECT_ROOT" \
    \( -path "$PROJECT_ROOT/.git" -o -path "$PROJECT_ROOT/node_modules" \) -prune -o \
    \( -name '.rca-baseline' -o -name 'rca-baseline.json' \
       -o -name '.rca-suppress' -o -name '.rca-ignore' \
       -o -name 'rca-suppressions*' \) -print
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

# ---- version pinning parity --------------------------------------------------

@test "RCA_VERSION in Makefile and Dockerfile.rca are identical" {
  makefile_ver=$(grep -oE 'RCA_VERSION\s*=\s*[0-9]+\.[0-9]+\.[0-9]+' "$MAKEFILE" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
  dockerfile_ver=$(grep -oE 'RCA_VERSION=[0-9]+\.[0-9]+\.[0-9]+' "$DOCKERFILE_RCA" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
  [ -n "$makefile_ver" ]
  [ -n "$dockerfile_ver" ]
  [ "$makefile_ver" = "$dockerfile_ver" ]
}

@test "RCA_VERSION is pinned to a concrete semver (not a range or latest)" {
  ver=$(grep -oE 'RCA_VERSION\s*=\s*[0-9]+\.[0-9]+\.[0-9]+' "$MAKEFILE" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
  [[ "$ver" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

# ---- local / CI policy parity ------------------------------------------------

@test "METRICS_POLICY_PATH in Makefile points to config/metrics-policy.json" {
  grep -qE 'METRICS_POLICY_PATH\s*=\s*config/metrics-policy\.json' "$MAKEFILE"
}

@test "workflow detection condition checks the same config/metrics-policy.json" {
  grep -q 'config/metrics-policy.json' "$WORKFLOW"
}

@test "committed policy file exists at the path both Makefile and workflow reference" {
  [ -f "$POLICY" ]
}

@test "RCA_SCOPE in Makefile matches the scope the workflow governs (src/)" {
  grep -qE 'RCA_SCOPE\s*=\s*src/' "$MAKEFILE"
}

# ---- workflow job name for required status check ----------------------------

@test "workflow job key is rust-code-analysis (required check exact match)" {
  grep -qE '^  rust-code-analysis:' "$WORKFLOW"
}

@test "workflow name is rust-code-analysis (forms the full check context)" {
  grep -qE '^name:\s*rust-code-analysis' "$WORKFLOW"
}
