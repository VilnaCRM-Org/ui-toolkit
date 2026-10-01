#!/usr/bin/env bats

load './test_helper.bash'

DRY_RUN="$PROJECT_ROOT/.github/workflows/release-dry-run.yml"
RELEASE="$PROJECT_ROOT/.github/workflows/autorelease.yml"

workflow_code() {
  grep -vE '^[[:space:]]*#' "$1"
}

release_commands() {
  workflow_code "$1" | grep -oE 'make [a-z-]+|bash scripts/ci/[a-z-]+\.sh'
}

changelog_inputs() {
  workflow_code "$1" | grep -E '^ +(uses: TriPSs/|output-file:|version-file:|git-push:)'
}

@test "the dry run runs the release's commands in the release's order" {
  run diff <(release_commands "$RELEASE") <(release_commands "$DRY_RUN")
  [ "$status" -eq 0 ]
  [ -n "$(release_commands "$DRY_RUN")" ]
}

@test "the dry run drives the same changelog action with the same inputs" {
  run diff <(changelog_inputs "$RELEASE") <(changelog_inputs "$DRY_RUN")
  [ "$status" -eq 0 ]
  [ "$(changelog_inputs "$DRY_RUN" | wc -l)" -eq 4 ]
}

@test "the dry run cannot push, tag the remote or publish a release" {
  run workflow_code "$DRY_RUN"
  assert_output_contains 'contents: read'
  [[ "$output" != *'contents: write'* ]]
  [[ "$output" != *'secrets.'* ]]
  [[ "$output" != *'git push'* ]]
  [[ "$output" != *'gh release'* ]]
}

@test "the dry run gates every pull request to main and re-checks main daily" {
  run workflow_code "$DRY_RUN"
  assert_output_contains 'pull_request:'
  assert_output_contains '- cron:'
  [[ "$output" != *'paths:'* ]]
  [[ "$output" != *'paths-ignore:'* ]]
}

@test "no dry-run step is skipped except the teardown" {
  run grep -E '^ +if:' "$DRY_RUN"
  [ "$status" -eq 0 ]
  [ "${#lines[@]}" -eq 1 ]
  [[ "${lines[0]}" =~ ^\ +if:\ always\(\)$ ]]
}
