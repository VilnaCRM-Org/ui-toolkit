#!/usr/bin/env bash
set -euo pipefail

image="${GITLEAKS_IMAGE:?GITLEAKS_IMAGE must be set (run through make lint-secrets)}"
mode="${SECRETS_MODE:-tree}"
config="${GITLEAKS_CONFIG:-.gitleaks.toml}"
log_opts="${SECRETS_LOG_OPTS:-}"
workspace="${SECRETS_WORKSPACE:-$PWD}"

case "$image" in
  *@sha256:*) ;;
  *)
    echo "scan-secrets: GITLEAKS_IMAGE '$image' is not digest-pinned (expected <image>@sha256:<64 hex>)" >&2
    exit 1
    ;;
esac
digest="${image##*@sha256:}"
if [ "${#digest}" -ne 64 ] || [ -n "${digest//[0-9a-f]/}" ]; then
  echo "scan-secrets: GITLEAKS_IMAGE digest '$digest' is not 64 lowercase hex characters" >&2
  exit 1
fi

if [ ! -f "$workspace/$config" ]; then
  echo "scan-secrets: config '$config' not found under '$workspace'" >&2
  exit 1
fi

scan_tree() {
  docker run --rm -v "$workspace:/repo:ro" -w /repo \
    "$image" dir --no-banner --redact --exit-code 1 --config "/repo/$config" /repo
}

scan_history() {
  if [ ! -d "$workspace/.git" ]; then
    echo "scan-secrets: SECRETS_MODE=history needs a git directory at '$workspace/.git'" >&2
    exit 1
  fi
  if [ "$(git -C "$workspace" rev-parse --is-shallow-repository 2>/dev/null)" != "false" ]; then
    echo "scan-secrets: '$workspace' is a shallow (or unreadable) git repository; check out with fetch-depth: 0" >&2
    exit 1
  fi
  local args=()
  if [ -n "$log_opts" ]; then
    args=(--log-opts "$log_opts")
  fi
  docker run --rm -v "$workspace:/repo:ro" -w /repo \
    -e GIT_CONFIG_COUNT=1 -e GIT_CONFIG_KEY_0=safe.directory -e GIT_CONFIG_VALUE_0=/repo \
    "$image" git --no-banner --redact --exit-code 1 --config "/repo/$config" "${args[@]}" /repo
}

probe=""
cleanup_probe() {
  if [ -n "$probe" ]; then
    rm -rf "$probe"
  fi
}
trap cleanup_probe EXIT

assert_scanner_detects() {
  local status
  probe="$(mktemp -d)"
  printf 'aws_access_key_id = AKIA%s\n' 'Q7Z3M2X4K6W5P3Y2' > "$probe/leak.txt"

  set +e
  docker run --rm -v "$probe:/probe" -v "$workspace/$config:/gitleaks.toml:ro" \
    "$image" dir --no-banner --exit-code 1 --config /gitleaks.toml \
    --report-format json --report-path /probe/report.json /probe > "$probe/stderr.txt" 2>&1
  status=$?
  set -e

  if [ "$status" -ne 1 ]; then
    echo "scan-secrets: the scanner exited $status on a seeded credential instead of reporting it" >&2
    cat "$probe/stderr.txt" >&2
    exit 1
  fi
  if ! grep -q '"RuleID"[[:space:]]*:[[:space:]]*"aws-access-token"' "$probe/report.json" 2>/dev/null; then
    echo "scan-secrets: the scanner objected but did not attribute it to the seeded aws-access-token" >&2
    cat "$probe/stderr.txt" >&2
    exit 1
  fi
  echo "scan-secrets: positive control passed (seeded credential detected)"
}

case "$mode" in
  tree)
    echo "scan-secrets: mode=tree config=$config"
    scan_tree
    ;;
  history)
    echo "scan-secrets: mode=history config=$config log-opts=${log_opts:-<all>}"
    scan_history
    ;;
  *)
    echo "scan-secrets: SECRETS_MODE must be 'tree' or 'history', got '$mode'" >&2
    exit 1
    ;;
esac

assert_scanner_detects
