#!/usr/bin/env bats

load './test_helper.bash'

WORKFLOW="$PROJECT_ROOT/.github/workflows/rust-code-analysis.yml"

# ---- file existence ----------------------------------------------------------

@test "rust-code-analysis workflow file exists" {
  [ -f "$WORKFLOW" ]
}

@test "workflow is valid YAML (parseable with grep heuristic)" {
  [ -f "$WORKFLOW" ]
  # Must have 'name:' and 'on:' top-level keys
  grep -q '^name:' "$WORKFLOW"
  grep -q '^on:' "$WORKFLOW"
}

# ---- trigger -----------------------------------------------------------------

@test "workflow triggers on pull_request targeting main" {
  grep -q 'pull_request:' "$WORKFLOW"
  grep -A 5 'pull_request:' "$WORKFLOW" | grep -q 'main'
}

# ---- permissions -------------------------------------------------------------

@test "workflow has top-level permissions: {}" {
  grep -q 'permissions: {}' "$WORKFLOW"
}

@test "job has contents: read permission" {
  grep -q 'contents: read' "$WORKFLOW"
}

# ---- job identity ------------------------------------------------------------

@test "job is named rust-code-analysis" {
  grep -q 'rust-code-analysis:' "$WORKFLOW"
}

@test "job runs on ubuntu-latest" {
  grep -q 'ubuntu-latest' "$WORKFLOW"
}

# ---- checkout step -----------------------------------------------------------

@test "workflow pins actions/checkout to the repo-standard immutable SHA" {
  grep -qE 'actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683' "$WORKFLOW"
}

@test "checkout step sets persist-credentials: false" {
  grep -q 'persist-credentials: false' "$WORKFLOW"
}

@test "workflow sets a job timeout-minutes guardrail" {
  grep -qE '^[[:space:]]*timeout-minutes:[[:space:]]*[0-9]+' "$WORKFLOW"
}

@test "workflow declares a concurrency group with cancel-in-progress" {
  grep -qE '^concurrency:' "$WORKFLOW"
  grep -qE 'cancel-in-progress:[[:space:]]*true' "$WORKFLOW"
}

@test "workflow does not include a setup-node step" {
  run grep -i 'setup-node\|actions/setup-node' "$WORKFLOW"
  [ "$status" -ne 0 ]
}

# ---- file detection step -----------------------------------------------------

@test "workflow has a 'Detect runtime project files' step" {
  grep -qi 'Detect runtime project files' "$WORKFLOW"
}

@test "detection step checks for config/metrics-policy.json" {
  grep -q 'config/metrics-policy.json' "$WORKFLOW"
}

@test "detection step writes a flag to GITHUB_OUTPUT" {
  grep -q 'GITHUB_OUTPUT' "$WORKFLOW"
}

# ---- lint-metrics step -------------------------------------------------------

@test "workflow runs make lint-metrics" {
  grep -q 'make lint-metrics' "$WORKFLOW"
}

@test "make lint-metrics step is gated on the detection flag" {
  grep -B 3 'make lint-metrics' "$WORKFLOW" | grep -q "steps\\.project\\.outputs\\.present"
}

# ---- skip / bootstrap guard --------------------------------------------------

@test "workflow has a skip step for bootstrap PRs" {
  grep -qi 'skip\|Skipping' "$WORKFLOW"
}

# ---- no manual docker lifecycle ----------------------------------------------

@test "workflow does not call make start" {
  run grep 'make start' "$WORKFLOW"
  [ "$status" -ne 0 ]
}

@test "workflow does not call make down" {
  run grep 'make down' "$WORKFLOW"
  [ "$status" -ne 0 ]
}
