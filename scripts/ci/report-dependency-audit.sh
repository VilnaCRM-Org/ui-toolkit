#!/usr/bin/env bash
set -euo pipefail

image="${TRIVY_IMAGE:?TRIVY_IMAGE must be set (run through make report-dependency-audit)}"
severity="${TRIVY_SEVERITY:-HIGH,CRITICAL}"
cache_dir="${TRIVY_CACHE_DIR:-$PWD/.trivy-cache}"
report_dir="${TRIVY_REPORT_DIR:-reports/trivy}"
workspace="${SCAN_WORKSPACE:-$PWD}"
label="${AUDIT_LABEL:-dependency-audit}"
title="${AUDIT_TITLE:-Dependency audit: fixable HIGH/CRITICAL advisories in the full lockfile}"
run_url="${AUDIT_RUN_URL:-}"

case "$image" in
  *@sha256:*) ;;
  *)
    echo "report-dependency-audit: TRIVY_IMAGE '$image' is not digest-pinned (expected <image>@sha256:<64 hex>)" >&2
    exit 1
    ;;
esac

mkdir -p "$cache_dir" "$workspace/$report_dir"
json="$workspace/$report_dir/dependency-audit.json"
body="$workspace/$report_dir/dependency-audit.md"

docker run --rm --user "$(id -u):$(id -g)" \
  -e TRIVY_CACHE_DIR=/cache -v "$cache_dir:/cache" \
  -v "$workspace:/repo:ro" -v "$workspace/$report_dir:/reports" -w /repo \
  "$image" fs --scanners vuln --severity "$severity" --ignore-unfixed --no-progress \
  --include-dev-deps --format json --exit-code 0 --output /reports/dependency-audit.json bun.lock

if ! jq -e '.Results | type == "array"' "$json" > /dev/null 2>&1; then
  echo "report-dependency-audit: $json is not a trivy report; refusing to report a clean audit" >&2
  exit 1
fi

findings="$(jq -r '[.Results[]?.Vulnerabilities[]? | {p: .PkgName, v: .InstalledVersion, f: .FixedVersion, id: .VulnerabilityID, s: .Severity}]
  | unique | sort_by(.p, .v, .id)
  | .[] | "| \(.p) | \(.v) | \(.f) | \(.id) | \(.s) |"' "$json")"
total="$(printf '%s\n' "$findings" | grep -c '^|' || true)"
marker="$(printf '%s\n' "$findings" | sha256sum | cut -c1-16)"

open_issues() {
  gh issue list --label "$label" --state open --search "$title in:title" --json number --jq '.[].number'
}

if [ "$total" -eq 0 ]; then
  echo "report-dependency-audit: no fixable $severity advisory in the full lockfile"
  for number in $(open_issues); do
    gh issue close "$number" --comment "The weekly audit found no fixable $severity advisory in the full lockfile; closing."
    echo "report-dependency-audit: closed #$number"
  done
  exit 0
fi

{
  printf '## Dependency audit\n\n'
  printf 'Total: %s fixable %s advisories across the full `bun.lock`, dev tooling included.\n\n' "$total" "$severity"
  printf 'Every entry has a fixed version; upgrade the direct dependency that pulls it in (`bun why <package>`).\n\n'
  printf '| Package | Installed | Fixed | Advisory | Severity |\n| --- | --- | --- | --- | --- |\n'
  printf '%s\n' "$findings"
  if [ -n "$run_url" ]; then
    printf '\nAudit run: %s\n' "$run_url"
  fi
  printf '\n<!-- dependency-audit:%s -->\n' "$marker"
} > "$body"

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  cat "$body" >> "$GITHUB_STEP_SUMMARY"
fi

gh label create "$label" --color B60205 --description "Fixable HIGH/CRITICAL advisories in the full dependency tree" 2>/dev/null || true

existing="$(open_issues | head -n 1)"
if [ -z "$existing" ]; then
  gh issue create --label "$label" --title "$title" --body-file "$body"
  echo "report-dependency-audit: filed a tracking issue with $total findings"
  exit 0
fi

if gh issue view "$existing" --json body --jq '.body' | grep -qF "dependency-audit:$marker"; then
  echo "report-dependency-audit: #$existing already tracks these $total findings"
  exit 0
fi

gh issue edit "$existing" --body-file "$body"
gh issue comment "$existing" --body "The advisory set changed: $total fixable $severity findings across the full lockfile. See the updated body."
echo "report-dependency-audit: refreshed #$existing with $total findings"
