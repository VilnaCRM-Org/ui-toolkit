#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

dist="${1:-dist}"
tarballs=("$dist"/*.tgz)
if [ "${#tarballs[@]}" -ne 1 ]; then
  echo "::error::expected exactly one tarball in $dist/, found ${#tarballs[@]}" >&2
  exit 1
fi

tarball="${tarballs[0]}"
(cd "$(dirname "$tarball")" && sha256sum "$(basename "$tarball")") > "$tarball.sha256"
printf '%s\n' "$tarball"
