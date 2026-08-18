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

@test "every workflow declares a top-level permissions block" {
  local offenders=""

  while IFS= read -r workflow; do
    grep -qE '^permissions:' "$workflow" || offenders="$offenders $(basename "$workflow")"
  done < <(workflow_files)

  if [ -n "$offenders" ]; then
    echo "Workflows without a top-level permissions block:$offenders" >&2
    return 1
  fi
}

@test "every job declares timeout-minutes" {
  local offenders=""

  while IFS= read -r workflow; do
    local jobs timeouts
    jobs="$(grep -cE '^[[:space:]]+runs-on:' "$workflow")"
    timeouts="$(grep -cE '^[[:space:]]+timeout-minutes:' "$workflow")"
    if [ "$jobs" != "$timeouts" ]; then
      offenders="$offenders $(basename "$workflow")($timeouts/$jobs)"
    fi
  done < <(workflow_files)

  if [ -n "$offenders" ]; then
    echo "Workflows whose jobs are missing timeout-minutes:$offenders" >&2
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
