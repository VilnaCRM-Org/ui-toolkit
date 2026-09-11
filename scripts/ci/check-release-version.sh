#!/usr/bin/env bash
# Guard the automated release against version/tag collisions.
#
# `.github/workflows/autorelease.yml` bumps the version in package.json with
# TriPSs/conventional-changelog-action, then has that action run
# `git tag -a v<next>`. If a tag already sits at the version the bump lands on,
# `git tag` aborts with exit code 128 -- but only AFTER the changelog has been
# written and committed, so the job dies half-way through a release with an
# opaque "The process '/usr/bin/git' failed with exit code 128".
#
# That is exactly how releases stopped here. The action's push was not atomic:
# `git push origin main --follow-tags` sends the tag ref and the branch ref
# separately, so when branch protection rejected the branch ref (GH006 -- the
# release App is not a bypass actor on this repository's main ruleset, so the
# pull-request requirement declines the push even with a valid App token) the tag
# still landed. v0.2.0 and v0.4.0 were stranded that way while package.json
# stayed at 0.3.0, and every later push to main recomputed 0.3.0 -> 0.4.0 and
# died on the tag, from 2026-08-24 onwards. autorelease.yml now runs the action
# with `git-push: false` and pushes the branch ref before the tag ref, so a
# rejected push leaves nothing behind (issue #160).
#
# The two stray tags differ in what the remedy below is for them. v0.2.0 was
# orphaned outright and was deleted. v0.4.0 was not: a GitHub release was later
# published on it, carrying the vilnacrm-ui-toolkit-0.4.0.tgz asset, so deleting
# the tag would unpublish a real release. package.json was raised to 0.4.0
# instead -- the second remedy the failure message offers.
#
# The invariant that makes any bump safe is simple and total: package.json's
# version must be at least as high as every existing tag. Then the next
# version -- patch, minor or major -- necessarily lands above every tag.
# This runs BEFORE the changelog action so a collision fails fast, loudly, and
# with a remedy, instead of corrupting a release mid-flight.
set -euo pipefail

repo_dir="${1:-.}"
pkg="${repo_dir}/package.json"

fail() {
  echo "::error::release-version: $1"
  exit 1
}

[ -f "${pkg}" ] || fail "missing ${pkg}"

version="$(
  node -pe 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).version || ""' \
    "${pkg}" 2>/dev/null
)" || fail "could not parse ${pkg}"

# Anchored on purpose. A glob like [0-9]*.[0-9]*.[0-9]* also accepts "1.6.0-rc.1"
# and "1.2.3.4", and tag discovery below keeps only plain MAJOR.MINOR.PATCH -- so a
# malformed version would be compared against a set it can never match and sail
# through the guard. Leading zeros are rejected too: "01.2.3" is not valid semver,
# and `sort -V` would order it differently from the "1.2.3" tag it means to match.
if [ -z "${version}" ]; then
  fail "${pkg} has no \"version\" field"
fi
if [[ ! "${version}" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]; then
  fail "${pkg} version '${version}' is not a MAJOR.MINOR.PATCH semver"
fi

# Release tags are written as `v<semver>` by the changelog action. Pre-release and
# non-version tags may exist too (this repository carries `archive/test-coverage`);
# normalise the prefix and keep only plain semver, because only those can collide
# with a computed release tag.
#
# The filter is the SAME strict regex the version check above uses, leading zeros
# included. A stray `v01.999.0` is not semver, so the changelog action can never
# compute it as a release tag and it cannot collide with anything -- but `sort -V`
# compares components numerically, so it would still be picked as the highest tag
# and would block every release below 999. Filtering it out here is what keeps the
# comparison set to tags a release can actually collide with.
#
# `git tag --list` is captured on its own so its failure is fatal. Folding it into
# the pipeline below would let `|| true` swallow a broken or missing repository as
# "no tags yet" -- the guard would pass precisely when it can no longer see the
# tags it exists to check. Only grep's no-match exit is tolerated.
raw_tags="$(git -C "${repo_dir}" tag --list)" ||
  fail "could not list git tags in ${repo_dir}"

tags="$(
  printf '%s\n' "${raw_tags}" |
    sed 's/^v//' |
    grep -E '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$' || true
)"

if [ -z "${tags}" ]; then
  echo "release-version: OK (${version}; no release tags yet)"
  exit 0
fi

highest="$(printf '%s\n' "${tags}" | sort -V | tail -n 1)"

# `sort -V` orders both operands; the version is high enough exactly when it
# sorts last (ties included, since an equal string sorts to itself).
if [ "$(printf '%s\n%s\n' "${version}" "${highest}" | sort -V | tail -n 1)" != "${version}" ]; then
  fail "$(
    cat <<MSG
package.json is at ${version} but tag v${highest} already exists, so the next release would try to re-create an existing tag and abort mid-release.
Fix: delete the stray tag when it is orphaned (not an ancestor of main and carrying no GitHub release), or set package.json's "version" to ${highest} so the next bump lands above every tag. Do not weaken this check.
MSG
  )"
fi

echo "release-version: OK (package.json ${version} >= highest tag v${highest})"
