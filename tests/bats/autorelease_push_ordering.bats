#!/usr/bin/env bats

# Contract for the release push (issue #160).
#
# The changelog action's own push is `git push origin <branch> --follow-tags`,
# which sends the tag ref and the branch ref in one command but not in one
# transaction. Branch protection rejected the branch ref (GH006) while the tag
# landed anyway, stranding v0.2.0 and v0.4.0 and wedging every later release
# behind the version preflight. These tests pin the shape that cannot strand a
# tag: the action does not push at all, and the workflow sends the branch ref
# before the tag ref.
#
# Every assertion below reads EXECUTABLE lines only. The workflow documents the
# banned command in a comment -- quoting the failure it exists to prevent -- so a
# check run over the raw file would match that prose and fail the very shape it
# is asking for. `workflow_code` strips comment lines while keeping the original
# line numbers, so the ordering assertions still compare real positions.

load './test_helper.bash'

WORKFLOW() {
  printf '%s' "$PROJECT_ROOT/.github/workflows/autorelease.yml"
}

workflow_code() {
  grep -n '' "$(WORKFLOW)" | grep -vE '^[0-9]+:[[:space:]]*#'
}

# First matching executable line number, or empty when the pattern is only prose.
code_line() {
  workflow_code | grep -E "$1" | head -n 1 | cut -d: -f1
}

# The executable lines of ONE step: its `- name:` line through the line before
# the next step's. Three later steps carry the same skip condition as the push
# step, so an assertion read over the whole workflow still passes when the push
# step alone loses its `if` -- the condition has to be read inside this block.
step_code() {
  workflow_code | awk -v name="$1" '
    $0 ~ ("^[0-9]+: +- name: " name "$") { inside = 1; print; next }
    inside && /^[0-9]+: +- name: / { exit }
    inside { print }
  '
}

@test "the autorelease workflow exists" {
  run test -f "$(WORKFLOW)"
  [ "$status" -eq 0 ]
}

@test "the changelog action is told not to push" {
  [ -n "$(code_line '^[0-9]+: +git-push: false$')" ]
}

@test "no executable step pushes a branch and its tags in one --follow-tags command" {
  [ -z "$(code_line -- '--follow-tags')" ]
}

@test "the comment filter reads code, not prose (fail-open guard)" {
  # Without the filter every assertion here is vacuous, because the workflow's
  # own comment quotes `--follow-tags`. Prove both directions on fixtures.
  local commented="$BATS_TEST_TMPDIR/commented.yml"
  local executed="$BATS_TEST_TMPDIR/executed.yml"

  printf '  # git push origin main --follow-tags\n' > "$commented"
  printf '  run: git push origin main --follow-tags\n' > "$executed"

  run bash -c "grep -n '' '$commented' | grep -vE '^[0-9]+:[[:space:]]*#' | grep -- --follow-tags"
  [ "$status" -ne 0 ]

  run bash -c "grep -n '' '$executed' | grep -vE '^[0-9]+:[[:space:]]*#' | grep -- --follow-tags"
  [ "$status" -eq 0 ]
}

@test "the branch ref is pushed before the tag ref" {
  local branch_line tag_line

  branch_line="$(code_line 'git push .*HEAD:')"
  tag_line="$(code_line 'git push .*refs/tags/')"

  [ -n "$branch_line" ]
  [ -n "$tag_line" ]
  [ "$branch_line" -lt "$tag_line" ]
}

@test "the tag is pushed as a fully qualified ref, not a bare name" {
  [ -n "$(code_line 'git push .*"refs/tags/\$\{RELEASE_TAG\}"')" ]
}

@test "the push step is skipped when the changelog action produced no release" {
  local step
  step="$(step_code 'Push the release commit, then its tag')"

  [ -n "$step" ]
  printf '%s\n' "$step" | grep -qE "^[0-9]+: +if: \\\$\{\{ steps\.changelog\.outputs\.skipped == 'false' \}\}$"
}

@test "step_code stops at the next step, so the scoping above is real (fail-open guard)" {
  local step
  step="$(step_code 'Push the release commit, then its tag')"

  # Its own body is in range ...
  printf '%s\n' "$step" | grep -qE 'git push .*refs/tags/'
  # ... and the next step's name and body are not, which is the whole point: the
  # following steps repeat this step's skip condition verbatim.
  run grep -E 'Start docker build environment|make start-bun' <<< "$step"
  [ "$status" -ne 0 ]
}

@test "the version preflight still runs before the changelog action" {
  local preflight_line changelog_line

  preflight_line="$(code_line 'check-release-version\.sh')"
  changelog_line="$(code_line 'conventional-changelog-action@')"

  [ -n "$preflight_line" ]
  [ -n "$changelog_line" ]
  [ "$preflight_line" -lt "$changelog_line" ]
}

# Belt-and-braces only, and honest about it. The gate that actually protects a
# release is the preflight STEP in autorelease.yml, which runs against a full
# checkout with fetch-depth: 0. This assertion re-runs it against the working
# tree so a bump that raises a tag without raising package.json is caught on a
# developer machine, before it reaches main.
#
# It cannot gate CI: Dockerfile copies explicit paths and never `.git`, so inside
# the bats image the script fails closed on `could not list git tags` -- the
# repository is not a git repository there at all. Skipping is reported rather
# than silently passing, and the sibling suite check_release_version.bats covers
# the script's logic on purpose-built fixture repositories in every environment.
@test "package.json is at or above every release tag, so the next bump cannot collide" {
  if ! git -C "$PROJECT_ROOT" rev-parse --git-dir > /dev/null 2>&1; then
    skip "no .git in the build context; the release-time preflight covers this"
  fi

  run bash "$PROJECT_ROOT/scripts/ci/check-release-version.sh" "$PROJECT_ROOT"
  [ "$status" -eq 0 ]
}
