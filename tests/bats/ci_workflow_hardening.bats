#!/usr/bin/env bats

# Repository-wide contracts for the CI surface (issues #96, #82, #79).
#
# Each of these encodes a failure the repository actually suffered or was one
# rename away from: a gate that skipped itself into permanent green, a workflow
# inheriting a broad token, a job with no time limit, and an action reference
# that a tag retarget could swap for attacker-controlled code.

load './test_helper.bash'

WORKFLOW_DIR="$PROJECT_ROOT/.github/workflows"

workflow_files() {
  find "$WORKFLOW_DIR" -maxdepth 1 -type f \( -name '*.yml' -o -name '*.yaml' \) | sort
}

@test "there is a workflow directory with workflows in it" {
  [ -d "$WORKFLOW_DIR" ]
  [ "$(workflow_files | wc -l)" -gt 0 ]
}

@test "no workflow can skip its own gate into a green result" {
  local offenders=""

  while IFS= read -r workflow; do
    if grep -qE "present=(true|false)|outputs\.present|Skipping .* bootstrap" "$workflow"; then
      offenders="$offenders $(basename "$workflow")"
    fi
  done < <(workflow_files)

  if [ -n "$offenders" ]; then
    echo "Workflows with a bootstrap silent-skip branch:$offenders" >&2
    return 1
  fi
}

# The value matters as much as the presence: `permissions: write-all`, or any
# mapping, would satisfy a bare "has a permissions key" check while handing the
# default token broad access to every job added later. Grants belong at job
# level, where they are visible next to the step that needs them.
@test "every workflow denies the default token at the top level" {
  local offenders=""

  while IFS= read -r workflow; do
    grep -qxF 'permissions: {}' "$workflow" || offenders="$offenders $(basename "$workflow")"
  done < <(workflow_files)

  if [ -n "$offenders" ]; then
    echo "Workflows whose top-level permissions are not {}:$offenders" >&2
    return 1
  fi
}

# Walks the jobs mapping and pairs every job key with its own timeout, rather
# than comparing file-wide totals: a step-level `timeout-minutes` (legal YAML
# that bounds one step, not the job) or one in a comment could otherwise
# rebalance the count for a job that dropped its limit. Reports the job by name.
# Lists the job keys the walker can see. A reformat that moved job keys off the
# two-space indent would otherwise leave the walker finding nothing, and "no
# jobs" would read as "no jobs missing a timeout" - a fail-open of exactly the
# kind this file exists to prevent. The companion test asserts it stays honest.
jobs_in_workflow() {
  awk '
    /^jobs:[[:space:]]*$/ { in_jobs = 1; next }
    !in_jobs { next }
    /^[^[:space:]#]/ { in_jobs = 0; next }
    /^  [A-Za-z0-9_-]+:[[:space:]]*(#.*)?$/ { print substr($1, 1, length($1) - 1) }
  ' "$1"
}

@test "the job walker recognises the layout of every workflow" {
  local offenders=""

  while IFS= read -r workflow; do
    local seen
    seen="$(jobs_in_workflow "$workflow" | wc -l)"
    if [ "$seen" -lt 1 ]; then
      offenders="$offenders $(basename "$workflow")"
    fi
  done < <(workflow_files)

  if [ -n "$offenders" ]; then
    echo "Workflows whose jobs the timeout walker cannot see:$offenders" >&2
    return 1
  fi
}

jobs_without_timeout() {
  awk '
    /^jobs:[[:space:]]*$/ { in_jobs = 1; next }
    !in_jobs { next }
    /^[^[:space:]#]/ { if (job != "" && !timeout) print job; job = ""; in_jobs = 0; next }
    /^  [A-Za-z0-9_-]+:[[:space:]]*(#.*)?$/ {
      if (job != "" && !timeout) print job
      job = substr($1, 1, length($1) - 1)
      timeout = 0
      next
    }
    /^    timeout-minutes:[[:space:]]*[0-9]+[[:space:]]*$/ { timeout = 1 }
    END { if (job != "" && !timeout) print job }
  ' "$1"
}

@test "every job declares its own job-level timeout-minutes" {
  local offenders=""

  while IFS= read -r workflow; do
    local missing
    missing="$(jobs_without_timeout "$workflow" | tr '\n' ' ')"
    if [ -n "${missing// /}" ]; then
      offenders="$offenders $(basename "$workflow"):[${missing% }]"
    fi
  done < <(workflow_files)

  if [ -n "$offenders" ]; then
    echo "Jobs without a job-level timeout-minutes:$offenders" >&2
    return 1
  fi
}

@test "every action is pinned to a commit SHA with a version comment" {
  local offenders=""

  while IFS= read -r workflow; do
    while IFS= read -r reference; do
      [ -n "$reference" ] || continue
      if ! printf '%s\n' "$reference" | grep -qE '@[0-9a-f]{40} # v?[0-9]+\.[0-9]+(\.[0-9]+)?$'; then
        offenders="$offenders $(basename "$workflow"):$reference"
      fi
    done < <(grep -oE 'uses: .*$' "$workflow")
  done < <(workflow_files)

  if [ -n "$offenders" ]; then
    echo "Action references that are not SHA-pinned with a version comment:$offenders" >&2
    return 1
  fi
}

@test "dependabot watches npm, github-actions and docker" {
  local config="$PROJECT_ROOT/.github/dependabot.yml"
  [ -f "$config" ]

  local ecosystem
  for ecosystem in npm github-actions docker; do
    run grep -qE "package-ecosystem: '?${ecosystem}'?" "$config"
    [ "$status" -eq 0 ]
  done
}

@test "npm security updates are not folded into a grouped batch" {
  local config="$PROJECT_ROOT/.github/dependabot.yml"

  # Every group must opt in to version updates only; a group without
  # `applies-to` would swallow security advisories into the weekly batch.
  local groups applies
  groups="$(grep -cE '^      [a-z][a-z-]*:$' "$config")"
  applies="$(grep -cE '^        applies-to: version-updates$' "$config")"
  [ "$groups" -gt 0 ]
  [ "$groups" = "$applies" ]
}

@test "every Dockerfile base image is digest-pinned" {
  local offenders="" dockerfile

  while IFS= read -r dockerfile; do
    while IFS= read -r from; do
      [ -n "$from" ] || continue
      printf '%s\n' "$from" | grep -qE '@sha256:[0-9a-f]{64}' ||
        offenders="$offenders $(basename "$dockerfile"):$from"
    done < <(grep -E '^[[:space:]]*FROM[[:space:]]' "$dockerfile")
  done < <(find "$PROJECT_ROOT" -maxdepth 1 -type f -name 'Dockerfile*' | sort)

  if [ -n "$offenders" ]; then
    echo "Base images without an @sha256 digest:$offenders" >&2
    return 1
  fi
}
