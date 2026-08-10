#!/usr/bin/env bats

# The release version is derived from commit headers by autorelease.yml, so the wiring that
# validates those headers -- the husky commit-msg hook and the commitlint workflow -- is a
# release contract. These tests lock the wiring itself; commit_message_policy.test.ts locks
# which headers the rule accepts.

load './test_helper.bash'

HOOK="$PROJECT_ROOT/.husky/commit-msg"
WORKFLOW="$PROJECT_ROOT/.github/workflows/commitlint.yml"
CONFIG="$PROJECT_ROOT/commitlint.config.js"

@test "the commit-msg hook is committed and runs commitlint against the edited message" {
  [ -f "$HOOK" ]

  run grep -F 'commitlint --edit "$1"' "$HOOK"
  [ "$status" -eq 0 ]
}

@test "the commit-msg hook carries no husky 8 bootstrap lines" {
  # Husky 9 sources its own shim from .husky/_; these two lines are deprecated and fail in v10.
  run grep -F 'husky.sh' "$HOOK"
  [ "$status" -ne 0 ]

  run grep -F '#!/usr/bin/env sh' "$HOOK"
  [ "$status" -ne 0 ]
}

@test "package.json installs the hook through husky 9's prepare lifecycle" {
  run jq -er '.scripts.prepare' "$PROJECT_ROOT/package.json"
  [ "$status" -eq 0 ]
  [ "$output" = "husky" ]

  run jq -er '.devDependencies.husky' "$PROJECT_ROOT/package.json"
  [ "$status" -eq 0 ]
}

@test "the husky-generated shim directory keeps itself out of version control" {
  # `husky` regenerates .husky/_ on every install and writes a `*` .gitignore into it. If that
  # ever stops happening the generated shims would start landing in commits.
  if [ -d "$PROJECT_ROOT/.husky/_" ]; then
    run cat "$PROJECT_ROOT/.husky/_/.gitignore"
    [ "$status" -eq 0 ]
    [ "$output" = "*" ]
  fi
}

@test "the commitlint workflow lints both the commit range and the pull request title" {
  [ -f "$WORKFLOW" ]

  # Squash-merge lands the pull request title on main whenever the branch has more than one
  # commit, so the title is release-driving input and has to be linted alongside the commits.
  run grep -F 'commitlint --from' "$WORKFLOW"
  [ "$status" -eq 0 ]

  run grep -F 'PR_TITLE' "$WORKFLOW"
  [ "$status" -eq 0 ]
}

@test "the commitlint workflow re-runs when a pull request is retitled" {
  run grep -E '^\s+- edited$' "$WORKFLOW"
  [ "$status" -eq 0 ]
}

@test "the commitlint workflow is not restricted to pull requests targeting main" {
  # Pull requests here are stacked onto each other's feature branches. A `branches: [main]`
  # filter would skip every one of them.
  run grep -E '^\s+branches:' "$WORKFLOW"
  [ "$status" -ne 0 ]
}

@test "the commitlint workflow fetches enough history to resolve the merge base" {
  run grep -F 'fetch-depth: 0' "$WORKFLOW"
  [ "$status" -eq 0 ]

  run grep -F 'git merge-base' "$WORKFLOW"
  [ "$status" -eq 0 ]
}

@test "the commitlint workflow pins every action to an immutable commit SHA" {
  local total pinned

  total="$(grep -cE '^[[:space:]]+uses:' "$WORKFLOW")"
  pinned="$(grep -cE '^[[:space:]]+uses: [^@]+@[0-9a-f]{40}( #.*)?$' "$WORKFLOW")"

  [ "$total" -gt 0 ]
  [ "$total" -eq "$pinned" ]
}

@test "the commitlint workflow runs read-only under a job timeout" {
  run grep -F 'permissions: {}' "$WORKFLOW"
  [ "$status" -eq 0 ]

  run grep -F 'contents: read' "$WORKFLOW"
  [ "$status" -eq 0 ]

  run grep -F 'contents: write' "$WORKFLOW"
  [ "$status" -ne 0 ]

  run grep -E '^\s+timeout-minutes: [0-9]+$' "$WORKFLOW"
  [ "$status" -eq 0 ]
}

@test "the commitlint workflow passes untrusted pull request input through env, not run" {
  # A pull request title expanded straight into a run block is a script-injection sink: the
  # title is attacker-controlled. It has to reach the shell as an environment variable.
  run grep -F 'github.event.pull_request.title' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [[ "$output" == *"PR_TITLE:"* ]]

  run grep -F '"$PR_TITLE"' "$WORKFLOW"
  [ "$status" -eq 0 ]
}

@test "commitlint keeps the conventional-commits ruleset and the task-number rule at error level" {
  run grep -F "extends: ['@commitlint/config-conventional']" "$CONFIG"
  [ "$status" -eq 0 ]

  run grep -F "'check-task-number-rule': [2, 'always']" "$CONFIG"
  [ "$status" -eq 0 ]
}

@test "the Makefile git-hooks target matches husky 9 semantics" {
  run grep -A 1 '^git-hooks-install:' "$PROJECT_ROOT/Makefile"
  [ "$status" -eq 0 ]
  [[ "$output" == *"bun x husky"* ]]
  [[ "$output" != *"husky install"* ]]
}

@test "CONTRIBUTING documents the commit header format and its semver linkage" {
  run grep -F 'commitlint' "$PROJECT_ROOT/CONTRIBUTING.md"
  [ "$status" -eq 0 ]

  run grep -F 'git-hooks-install' "$PROJECT_ROOT/CONTRIBUTING.md"
  [ "$status" -eq 0 ]
}
