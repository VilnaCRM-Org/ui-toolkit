#!/usr/bin/env bash
set -euo pipefail

tag="${1:?usage: verify-release-asset.sh <tag> [dist-dir]}"
dist="${2:-dist}"

tarball="$(bash "$(dirname "$0")/write-release-checksum.sh" "$dist")"
name="$(basename "$tarball")"
expected="$(cut -d' ' -f1 "$tarball.sha256")"

release="$(gh api "repos/${GH_REPO:?}/releases/tags/$tag")"

published="$(printf '%s' "$release" | jq -r --arg n "$name" '.assets[] | select(.name == $n) | .digest // ""')"
if [ -z "$published" ]; then
  echo "::error::release $tag has no asset $name with a digest" >&2
  exit 1
fi
if [ "$published" != "sha256:$expected" ]; then
  echo "::error::release $tag asset $name digest $published does not match the re-pack sha256:$expected" >&2
  exit 1
fi

checksum_url="$(printf '%s' "$release" | jq -r --arg n "$name.sha256" '.assets[] | select(.name == $n) | .url')"
if [ -n "$checksum_url" ]; then
  listed="$(gh api -H 'Accept: application/octet-stream' "$checksum_url" | cut -d' ' -f1)"
  if [ "$listed" != "$expected" ]; then
    echo "::error::release $tag asset $name.sha256 lists $listed, the re-pack is $expected" >&2
    exit 1
  fi
fi

echo "release $tag asset $name matches the attested re-pack sha256:$expected"
