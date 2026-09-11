#!/usr/bin/env bash
# Fail-closed assertion for the SBOM gate (issue #82).
#
# `syft` exits 0 when it finds nothing to inventory, so a misconfigured source
# would otherwise publish an empty CycloneDX document as a green artifact. This
# check makes "the SBOM was generated" mean "the SBOM has contents".
#
# Usage: assert-sbom.sh <cyclonedx-json-path> [minimum-npm-components]
#
# The optional npm floor exists because a total-component count is too weak for
# the package SBOM: syft also catalogues the repository's GitHub Actions, so a
# document with zero npm packages in it still clears a "more than nothing" bar.
set -euo pipefail

sbom_path="${1:-}"
minimum_npm="${2:-0}"

if [[ -z "$sbom_path" ]]; then
  echo "::error::usage: assert-sbom.sh <cyclonedx-json-path> [minimum-npm-components]" >&2
  exit 2
fi

# Bounded to nine digits: bash arithmetic is 64-bit and wraps silently, so an
# absurd floor would otherwise compare as negative and accept any SBOM.
if [[ ! "$minimum_npm" =~ ^[0-9]{1,9}$ ]]; then
  echo "::error::minimum-npm-components must be an integer of at most 9 digits," \
    "got '${minimum_npm}'." >&2
  exit 2
fi

if [[ ! -f "$sbom_path" ]]; then
  echo "::error::SBOM was not generated at ${sbom_path}." >&2
  exit 1
fi

# `.components` must be an array: jq reports a positive length for an object
# too, so a malformed document would otherwise clear the count below. A missing
# or wrongly typed array yields -1 and is reported as such.
components='(.components | if type == "array" then . else null end)'

# jq's own exit status is captured rather than left to `set -e`, so unparseable
# input reaches this script's message instead of aborting on a raw jq error.
if ! component_count="$(jq "${components} | if . == null then -1 else length end" "$sbom_path")" ||
  ! npm_count="$(jq "[${components} // [] | .[] | select((.purl? // \"\") | \
    startswith(\"pkg:npm/\"))] | length" "$sbom_path")"; then
  echo "::error::${sbom_path} is not parseable as JSON." >&2
  exit 1
fi

# jq prints nothing (and still exits 0) for empty input, and one line per
# document for a concatenated file. Either would make the comparisons below
# error out and, as `if` conditions, read as false — passing the very case this
# script exists to catch. Require a plain integer first.
for count in "$component_count" "$npm_count"; do
  if [[ ! "$count" =~ ^-?[0-9]+$ ]]; then
    echo "::error::${sbom_path} is not a single well-formed CycloneDX document." >&2
    exit 1
  fi
done

if [[ "$component_count" -lt 0 ]]; then
  echo "::error::${sbom_path} has no CycloneDX components array." >&2
  exit 1
fi

if [[ "$component_count" -lt 1 ]]; then
  echo "::error::${sbom_path} inventoried 0 components; the SBOM is empty." >&2
  exit 1
fi

if (( 10#$npm_count < 10#$minimum_npm )); then
  echo "::error::${sbom_path} inventoried ${npm_count} npm components, expected at least" \
    "${minimum_npm}; the dependency tree was not parsed." >&2
  exit 1
fi

echo "${sbom_path}: ${component_count} components inventoried (${npm_count} npm)."
