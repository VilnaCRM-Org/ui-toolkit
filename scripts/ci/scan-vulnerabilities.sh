#!/usr/bin/env bash
set -euo pipefail

image="${TRIVY_IMAGE:?TRIVY_IMAGE must be set (run through make lint-vulns or make scan-image-<service>)}"
severity="${TRIVY_SEVERITY:-HIGH,CRITICAL}"
cache_dir="${TRIVY_CACHE_DIR:-$PWD/.trivy-cache}"
report_dir="${TRIVY_REPORT_DIR:-reports/trivy}"
target="${SCAN_TARGET:?SCAN_TARGET must be 'lockfile' or 'image'}"
service="${SCAN_SERVICE:-}"
workspace="${SCAN_WORKSPACE:-$PWD}"

case "$image" in
  *@sha256:*) ;;
  *)
    echo "scan-vulnerabilities: TRIVY_IMAGE '$image' is not digest-pinned (expected <image>@sha256:<64 hex>)" >&2
    exit 1
    ;;
esac
digest="${image##*@sha256:}"
if [ "${#digest}" -ne 64 ] || [ -n "${digest//[0-9a-f]/}" ]; then
  echo "scan-vulnerabilities: TRIVY_IMAGE digest '$digest' is not 64 lowercase hex characters" >&2
  exit 1
fi

mkdir -p "$cache_dir" "$workspace/$report_dir"

trivy() {
  docker run --rm --user "$(id -u):$(id -g)" \
    -e TRIVY_CACHE_DIR=/cache -v "$cache_dir:/cache" \
    -v "$workspace:/repo:ro" -v "$workspace/$report_dir:/reports" -w /repo \
    "$@"
}

scan() {
  local name="$1"
  shift
  trivy "$image" "$@" --format sarif --output "/reports/$name.sarif" --exit-code 0
  trivy "$image" "$@" --format table --exit-code 1
}

common=(--scanners vuln --severity "$severity" --ignore-unfixed --no-progress)

case "$target" in
  lockfile)
    echo "scan-vulnerabilities: bun.lock production closure, severity $severity"
    scan bun-lock fs "${common[@]}" bun.lock
    ;;
  image)
    case "$service" in
      bun) dockerfile=Dockerfile ;;
      playwright) dockerfile=Dockerfile.playwright ;;
      rca) dockerfile=Dockerfile.rca ;;
      *)
        echo "scan-vulnerabilities: SCAN_SERVICE must be 'bun', 'playwright' or 'rca', got '$service'" >&2
        exit 1
        ;;
    esac
    tag="ui-toolkit-scan-$service"
    tarball="$workspace/$report_dir/$tag.tar"
    trap 'rm -f "$tarball"' EXIT
    echo "scan-vulnerabilities: $dockerfile image OS packages, severity $severity"
    docker build -f "$workspace/$dockerfile" -t "$tag" "$workspace"
    docker save -o "$tarball" "$tag"
    scan "$tag" image "${common[@]}" --pkg-types os --input "/reports/$tag.tar"
    ;;
  *)
    echo "scan-vulnerabilities: SCAN_TARGET must be 'lockfile' or 'image', got '$target'" >&2
    exit 1
    ;;
esac
