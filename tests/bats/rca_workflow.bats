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

@test "workflow pins actions/checkout to an immutable SHA with a version comment" {
  grep -qE 'actions/checkout@[0-9a-f]{40} # v[0-9]+\.[0-9]+\.[0-9]+' "$WORKFLOW"
}

# Rejects every reference that is not a 40-character commit SHA carrying a
# version comment, rather than denying a list of known-mutable refs: a ref such
# as `@release` is just as retargetable as `@v4`.
@test "workflow pins every action to a SHA, never a mutable ref" {
  local reference
  while IFS= read -r reference; do
    [ -n "$reference" ] || continue
    printf '%s\n' "$reference" | grep -qE '@[0-9a-f]{40} # v[0-9]+\.[0-9]+\.[0-9]+$'
  done < <(grep -oE 'uses: .*$' "$WORKFLOW")
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

# ---- lint-metrics step -------------------------------------------------------

@test "workflow runs make lint-metrics" {
  grep -q 'make lint-metrics' "$WORKFLOW"
}

# ---- fail-closed contract (issue #96) ----------------------------------------
#
# The metrics gate used to be wrapped in a "bootstrap PR" detection step that
# turned any missing input into a permanently green skip. The gate now runs
# unconditionally: a missing input has to make the job red.

@test "the metrics gate runs unconditionally, with no step condition at all" {
  # Not just the removed `present` flag: any step-level `if:` can restore a
  # green skip, so the workflow must carry none.
  run grep -nE '^[[:space:]]+if:' "$WORKFLOW"
  [ "$status" -ne 0 ]
}

@test "workflow keeps no bootstrap skip branch" {
  run grep -nE 'present=(true|false)|Skipping ' "$WORKFLOW"
  [ "$status" -ne 0 ]
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
