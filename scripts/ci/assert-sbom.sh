#!/usr/bin/env bash
# Fail-closed assertion for the SBOM gate (issue #82).
#
# `syft` exits 0 when it finds nothing to inventory, so a misconfigured source
# would otherwise publish an empty CycloneDX document as a green artifact. This
# check makes "the SBOM was generated" mean "the SBOM has contents".
set -euo pipefail

sbom_path="${1:-}"

if [ -z "$sbom_path" ]; then
  echo "::error::usage: assert-sbom.sh <cyclonedx-json-path>" >&2
  exit 2
fi

if [ ! -f "$sbom_path" ]; then
  echo "::error::SBOM was not generated at ${sbom_path}." >&2
  exit 1
fi

component_count="$(jq '(.components // []) | length' "$sbom_path")"

if [ "$component_count" -lt 1 ]; then
  echo "::error::${sbom_path} inventoried 0 components; the SBOM is empty." >&2
  exit 1
fi

echo "${sbom_path}: ${component_count} components inventoried."
