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
for required in \
  package/package.json \
  package/build/index.mjs \
  package/build/index.d.ts \
  package/build/index.css; do
  if ! printf '%s\n' "$contents" | grep -qxF -- "$required"; then
    echo "$tarball is missing $required" >&2
    exit 1
  fi
done

echo "verified $tarball"
