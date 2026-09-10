#!/usr/bin/env bats
#
# Coverage for scripts/ci/check-release-version.sh -- the preflight that stops
# the release workflow before TriPSs/conventional-changelog-action computes a
# version whose tag already exists.
#
# The guard only ever fires on pushes to main, where a false negative costs a
# half-written release and a false positive blocks every release, so pin the
# happy path, every failure path, and the equal/one-below/one-above boundaries
# around the highest existing tag.
#
# `git` is STUBBED rather than driven for real: `make test-bats` runs this suite
# inside the bun service, whose Alpine image installs no git (Dockerfile's apk
# list), so a test that shelled out to a real `git init` would fail there for a
# reason that has nothing to do with the script. The stub is not a weakening --
# the logic under test is version parsing, tag filtering and `sort -V` ordering,
# not git itself -- and it additionally pins the script's git contract: any
# invocation other than `git -C <dir> tag --list` makes the stub fail the test.

load './test_helper.bash'

SCRIPT_REL='scripts/ci/check-release-version.sh'

create_git_stub() {
  cat > "$STUB_BIN_DIR/git" <<'EOF'
#!/usr/bin/env bash
printf 'git %s\n' "$*" >> "${COMMAND_LOG:?}"

if [ "${FAKE_GIT_TAG_LIST_FAILS:-0}" = "1" ]; then
  echo 'fatal: not a git repository (or any of the parent directories): .git' >&2
  exit 128
fi

# The script must ask for exactly this, scoped to the directory it was given.
# Anything else is a contract change the tests should see rather than absorb.
if [ "$1" = "-C" ] && [ "$3" = "tag" ] && [ "$4" = "--list" ]; then
  if [ -n "${FAKE_GIT_TAGS:-}" ]; then
    printf '%s\n' "$FAKE_GIT_TAGS"
  fi
  exit 0
fi

echo "unexpected git invocation: $*" >&2
exit 1
EOF

  chmod +x "$STUB_BIN_DIR/git"
}

setup() {
  setup_stub_dir
  create_git_stub

  REPO="$BATS_TEST_TMPDIR/repo"
  mkdir -p "$REPO"
  export FAKE_GIT_TAGS=''
  export FAKE_GIT_TAG_LIST_FAILS=0
}

# Each test states its own version-vs-tags relationship inline: a package.json at
# $1 and, as the remaining arguments, the tags `git tag --list` will report.
seed_repo() {
  local version="$1"
  shift

  printf '{\n  "name": "@vilnacrm/ui-toolkit",\n  "version": "%s"\n}\n' "$version" >"$REPO/package.json"
  FAKE_GIT_TAGS="$(printf '%s\n' "$@")"
  export FAKE_GIT_TAGS
}

run_guard() {
  run bash "$PROJECT_ROOT/$SCRIPT_REL" "$REPO"
}

# --- Positive ------------------------------------------------------------------

@test "passes when the version matches the highest tag" {
  seed_repo '1.6.0' v1.0.0 v1.5.1 v1.6.0

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains 'release-version: OK'
  assert_output_contains '1.6.0 >= highest tag v1.6.0'
}

@test "passes when the version is ahead of every tag" {
  seed_repo '1.7.0' v1.6.0

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains 'release-version: OK'
}

@test "compares versions numerically, not lexicographically" {
  # Plain string ordering puts "1.9.0" above "1.10.0"; semver does not.
  seed_repo '1.10.0' v1.9.0

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains 'highest tag v1.9.0'
}

@test "ignores tags that are not plain semver" {
  seed_repo '1.6.0' v1.6.0 v2.0.0-rc.1 archive/test-coverage nightly

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains 'highest tag v1.6.0'
}

@test "accepts tags written without the v prefix" {
  seed_repo '1.6.0' 0.1.0 v1.6.0

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains 'highest tag v1.6.0'
}

@test "ignores a zero-padded tag instead of letting it block the release" {
  # The mirror of "rejects zero-padded components", on the tag side. `v01.999.0`
  # is not semver, so the changelog action can never compute it and nothing can
  # collide with it -- but `sort -V` compares components numerically, so a loose
  # filter would elect it as the highest tag and block every release below 999.
  seed_repo '1.500.0' v1.6.0 v01.999.0

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains 'highest tag v1.6.0'
}

@test "a zero-padded tag is not treated as the highest even when it is the only one" {
  seed_repo '1.0.0' v01.2.3

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains 'no release tags yet'
}

@test "passes on an untagged repository" {
  seed_repo '0.1.0'

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains 'no release tags yet'
}

@test "passes on the state this repository is in once the orphaned tags are gone" {
  # v0.3.0 is the only real release; v0.2.0 and v0.4.0 were orphaned by the
  # non-atomic push and are deleted alongside this guard landing.
  seed_repo '0.3.0' v0.3.0

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains '0.3.0 >= highest tag v0.3.0'
}

# --- Negative ------------------------------------------------------------------

@test "reproduces the real breakage: 0.3.0 against the orphaned v0.4.0 tag" {
  # The exact state on main that failed every release run from 2026-08-24.
  seed_repo '0.3.0' v0.2.0 v0.3.0 v0.4.0

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains '::error::release-version:'
  assert_output_contains 'package.json is at 0.3.0'
  assert_output_contains 'tag v0.4.0 already exists'
  assert_output_contains 'delete the stray tag'
}

@test "fails when package.json is missing" {
  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'missing'
  assert_output_contains 'package.json'
}

@test "fails when package.json has no version field" {
  printf '{\n  "name": "@vilnacrm/ui-toolkit"\n}\n' >"$REPO/package.json"

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'no "version" field'
}

@test "fails when package.json is not valid JSON" {
  printf '{ not json' >"$REPO/package.json"

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'could not parse'
}

@test "fails when the version is not MAJOR.MINOR.PATCH semver" {
  seed_repo '1.6' v1.5.0

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'not a MAJOR.MINOR.PATCH semver'
}

@test "rejects a prerelease suffix rather than comparing it against plain tags" {
  # Tag discovery keeps only plain MAJOR.MINOR.PATCH, so a prerelease version
  # would be compared against a set it can never match and sail through.
  seed_repo '1.6.0-rc.1' v1.6.0 v1.7.0

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'not a MAJOR.MINOR.PATCH semver'
}

@test "rejects a version with a fourth component" {
  seed_repo '1.2.3.4' v1.6.0

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'not a MAJOR.MINOR.PATCH semver'
}

@test "rejects a version with non-numeric components" {
  seed_repo '1a.2b.3c' v1.6.0

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'not a MAJOR.MINOR.PATCH semver'
}

@test "rejects a build-metadata suffix" {
  seed_repo '1.6.0+build.5' v1.6.0

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'not a MAJOR.MINOR.PATCH semver'
}

@test "rejects zero-padded components" {
  # "01.2.3" is not valid semver, and `sort -V` orders it differently from the
  # "1.2.3" tag it is meant to match.
  seed_repo '01.2.3' v1.6.0

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'not a MAJOR.MINOR.PATCH semver'
}

@test "still accepts legitimate zero components" {
  # The leading-zero rule must not reject 0.x.y or a plain zero component.
  seed_repo '0.4.0' v0.4.0

  run_guard
  [ "$status" -eq 0 ]
  assert_output_contains 'release-version: OK'
}

@test "fails closed when the tags cannot be listed at all" {
  # Treating a failed `git tag --list` as "no tags" would pass the guard exactly
  # when it can no longer see the thing it exists to check.
  seed_repo '0.3.0' v0.4.0
  export FAKE_GIT_TAG_LIST_FAILS=1

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'could not list git tags'
}

# --- Boundary ------------------------------------------------------------------

@test "fails when the version is one patch below the highest tag" {
  seed_repo '1.6.0' v1.6.1

  run_guard
  [ "$status" -eq 1 ]
  assert_output_contains 'tag v1.6.1 already exists'
}

@test "passes when the version is one patch above the highest tag" {
  seed_repo '1.6.1' v1.6.0

  run_guard
  [ "$status" -eq 0 ]
}

# --- Contract ------------------------------------------------------------------

@test "asks git only for the tag list, scoped to the directory it was given" {
  seed_repo '1.6.0' v1.6.0

  run_guard
  [ "$status" -eq 0 ]
  assert_log_contains "git -C $REPO tag --list"
  [ "$(wc -l < "$COMMAND_LOG")" -eq 1 ]
}

@test "defaults to the current directory when no argument is given" {
  seed_repo '1.6.0' v1.6.0

  run bash -c 'cd "$1" && bash "$2"' _ "$REPO" "$PROJECT_ROOT/$SCRIPT_REL"
  [ "$status" -eq 0 ]
  assert_output_contains 'release-version: OK'
  assert_log_contains 'git -C . tag --list'
}
