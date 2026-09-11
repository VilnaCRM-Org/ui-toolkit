#!/usr/bin/env sh

# Guards the release artifact against a silently empty build.
#
# `npm pack` succeeds even when build/ holds nothing: `files` simply matches no
# paths and the tarball ships with only package.json and the docs. Such a package
# installs cleanly, and every consumer then fails at import time because each
# entry point in `exports` resolves to a file that is not there. Assert the paths
# the manifest promises are really inside the archive before it is attached to a
# GitHub release.

set -eu

package_dir="${1:?usage: verify-package-tarball.sh <package-dir>}"

tarball=''
for candidate in "$package_dir"/*.tgz; do
  [ -f "$candidate" ] || continue
  if [ -n "$tarball" ]; then
    echo "expected exactly one tarball in $package_dir, found $tarball and $candidate" >&2
    exit 1
  fi
  tarball="$candidate"
done

if [ -z "$tarball" ]; then
  echo "no tarball found in $package_dir" >&2
  exit 1
fi

contents="$(tar -tzf "$tarball")"

# npm prefixes every archive member with `package/`.
# The per-component subpath entries are checked through one representative
# component: the build derives them from the public barrel, so either every
# component entry is emitted or none is. A tarball carrying only the index
# entries means the split build silently degraded back to one bundle, which
# resolves fine for `@vilnacrm/ui-toolkit` and 404s for every subpath import.
for required in \
  package/package.json \
  package/build/index.mjs \
  package/build/index.d.ts \
  package/build/index.css \
  package/build/ui-button.mjs \
  package/build/ui-button.d.ts; do
  if ! printf '%s\n' "$contents" | grep -qxF -- "$required"; then
    echo "$tarball is missing $required" >&2
    exit 1
  fi
done

echo "verified $tarball"
