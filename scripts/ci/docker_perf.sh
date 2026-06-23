#!/bin/bash
#
# docker_perf.sh - measure and gate Dockerfile build performance.
#
# The script keeps the decision logic in small, side-effect-free subcommands so
# it can be unit-tested with Bats (no Docker required), while the `run`
# subcommand wires those decisions to real `docker buildx`, `dive`, and
# `hadolint` invocations in CI.
#
# Subcommands:
#   run               build head (+ base) image, measure, gate, emit report
#   evaluate          decide pass/fail from measured metrics (reads env)
#   detect-exception  resolve a documented perf exception (marker or PR label)
#   render-report     render one Markdown table row from a metrics JSON file
#
# Exit codes: 0 = within budget (or waived by a documented exception),
#             1 = a gate failed and no exception applies, 2 = usage error.
#
set -euo pipefail

readonly MIB=$((1024 * 1024))
readonly PERF_EXCEPTION_PATTERN='^[[:space:]]*#[[:space:]]*[Pp][Ee][Rr][Ff]-[Ee][Xx][Cc][Ee][Pp][Tt][Ii][Oo][Nn](:([[:alnum:]_,-]+))?:'

log() { printf '%s\n' "$*" >&2; }

inline_exception_marker() {
  local dockerfile="${1:-}"

  if [[ -n "$dockerfile" && -f "$dockerfile" ]]; then
    grep -iE '^[[:space:]]*#[[:space:]]*perf-exception(:[[:alnum:]_,-]+)?:' "$dockerfile" 2>/dev/null \
      | head -n1 \
      | tr -d '\r' \
      | sed -E 's/[[:space:]]+$//' || true
  fi
}

detect_exception_scope() {
  local dockerfile="${1:-}"
  local marker=""
  local scope=""

  # A PR label is a blanket waiver and must take precedence so it can widen a
  # narrowly-scoped inline marker: an emergency label has to be able to waive
  # every gate even when the Dockerfile only documents a narrow (e.g. size)
  # exception. Checked before the marker so the label is never silently ignored.
  if [[ "${PERF_EXCEPTION_LABEL:-false}" == "true" ]] || [[ "${PERF_EXCEPTION_IMAGE_LABEL:-false}" == "true" ]]; then
    printf 'all'
    return 0
  fi

  marker="$(inline_exception_marker "$dockerfile")"
  if [[ -n "$marker" ]]; then
    if [[ "$marker" =~ $PERF_EXCEPTION_PATTERN ]]; then
      scope="${BASH_REMATCH[2]:-}"
    fi
    if [[ -n "$scope" ]]; then
      printf '%s' "${scope,,}"
    else
      printf 'all'
    fi
    return 0
  fi
}

detect_exception() {
  local dockerfile="${1:-}"
  local reason=""
  local marker=""

  marker="$(inline_exception_marker "$dockerfile")"
  if [[ -n "$marker" ]]; then
    reason="$(printf '%s' "$marker" \
      | sed -E 's/^[[:space:]]*#[[:space:]]*[Pp][Ee][Rr][Ff]-[Ee][Xx][Cc][Ee][Pp][Tt][Ii][Oo][Nn](:[[:alnum:]_,-]+)?:[[:space:]]*//')"
  fi

  if [[ -z "$reason" ]]; then
    local label_name="${PERF_EXCEPTION_LABEL_NAME:-docker-perf-exception}"
    if [[ "${PERF_EXCEPTION_LABEL:-false}" == "true" ]]; then
      reason="PR label '${label_name}' applied"
    elif [[ "${PERF_EXCEPTION_IMAGE_LABEL:-false}" == "true" ]]; then
      reason="PR label '${label_name}:${NAME:-}' applied"
    fi
  fi

  printf '%s' "$reason"
}

evaluate() {
  local current="${CURRENT_BYTES:?CURRENT_BYTES is required}"
  local budget_mb="${BUDGET_MB:?BUDGET_MB is required}"
  local tol="${TOLERANCE_PCT:-0}"
  local dive_status="${DIVE_STATUS:-0}"
  local hadolint_status="${HADOLINT_STATUS:-0}"
  local exception="${EXCEPTION_REASON:-}"
  local exception_scope="${EXCEPTION_SCOPE:-}"

  local budget_bytes=$((budget_mb * MIB))
  local limit=$(( budget_bytes * (100 + tol) / 100 ))

  local -a failures=()
  local -a waived_failures=()

  if [[ -n "$exception" && -z "$exception_scope" ]]; then
    exception_scope="all"
  fi
  exception_scope="${exception_scope,,}"

  gate_is_waived() {
    local gate="$1"

    [[ -n "$exception" ]] || return 1
    [[ "$exception_scope" == "all" ]] && return 0
    [[ ",${exception_scope}," == *",${gate},"* ]]
  }

  if [[ "$current" -gt "$limit" ]]; then
    local failure="size ${current}B exceeds limit ${limit}B (budget ${budget_mb}MiB +${tol}% tolerance)"
    if gate_is_waived size; then
      waived_failures+=("$failure")
    else
      failures+=("$failure")
    fi
  fi
  if [[ "$dive_status" -ne 0 ]]; then
    local failure="dive layer-efficiency gate failed"
    if gate_is_waived dive; then
      waived_failures+=("$failure")
    else
      failures+=("$failure")
    fi
  fi
  if [[ "$hadolint_status" -ne 0 ]]; then
    local failure="hadolint best-practice gate failed"
    if gate_is_waived hadolint; then
      waived_failures+=("$failure")
    else
      failures+=("$failure")
    fi
  fi

  if [[ "${#failures[@]}" -eq 0 && "${#waived_failures[@]}" -eq 0 ]]; then
    echo "PASS: all gates within budget"
    return 0
  fi

  local failure
  if [[ "${#failures[@]}" -eq 0 && -n "$exception" ]]; then
    echo "EXCEPTION: gate(s) failed but a documented exception applies: ${exception}"
    for failure in "${waived_failures[@]}"; do echo "  - (waived) ${failure}"; done
    return 0
  fi

  echo "FAIL: a documented exception is required to merge"
  for failure in "${failures[@]}"; do echo "  - ${failure}"; done
  return 1
}

render_report() {
  local metrics="${1:?metrics JSON path is required}"

  jq -r '
    def mib: (. / 1048576 * 10 | round) / 10;
    def secs: (. / 100 | round) / 10;
    def sign(d): (if d > 0 then "+" else "" end) + ((d | mib) | tostring) + " MiB";

    "| `\(.name)` "
    + "| `\(.dockerfile)` "
    + "| \(.current_bytes | mib) MiB "
    + "| " + (if (.base_bytes // 0) > 0 then sign(.current_bytes - .base_bytes) else "n/a" end) + " "
    + "| \(.build_ms | secs)s "
    + "| \(.budget_mb) MiB +\(.tolerance_pct)% "
    + "| " + (
        if .verdict == "pass" then "pass"
        elif .verdict == "exception" then "exception"
        else "fail" end
      )
    + (if (.exception // "") != "" then " - \(.exception)" else "" end)
    + " |"
  ' "$metrics"
}

build_image() {
  local dockerfile="$1" context="$2" target="$3" tag="$4" role="$5"
  local -a args=(buildx build --file "$dockerfile" --tag "$tag" --load --progress plain)

  [[ -n "$target" ]] && args+=(--target "$target")

  if [[ -n "${DOCKER_PERF_GHA_CACHE:-}" ]]; then
    args+=(--cache-from "type=gha,scope=docker-perf-${NAME}")
    if [[ "$role" == "head" ]]; then
      args+=(--cache-to "type=gha,mode=max,scope=docker-perf-${NAME}")
    fi
  fi
  args+=("$context")

  local start end
  start="$(date +%s%N)"
  docker "${args[@]}" >&2
  end="$(date +%s%N)"
  echo $(( (end - start) / 1000000 ))
}

image_size() {
  docker image inspect "$1" --format '{{.Size}}'
}

run_hadolint() {
  local dockerfile="$1"
  local config="${HADOLINT_CONFIG:-.hadolint.yaml}"

  if [[ -n "${HADOLINT:-}" ]]; then
    "$HADOLINT" --config "$config" "$dockerfile"
  else
    docker run --rm -i \
      -v "$PWD/$config:/.config/hadolint.yaml:ro" \
      "hadolint/hadolint:${HADOLINT_VERSION:-v2.13.1-alpine}" \
      hadolint --config /.config/hadolint.yaml - < "$dockerfile"
  fi
}

run_dive() {
  local tag="$1"
  local config="${DIVE_CONFIG:-.dive-ci}"

  if [[ -n "${DIVE:-}" ]]; then
    CI=true "$DIVE" --ci --ci-config "$config" --source docker "$tag"
  else
    docker run --rm \
      -e CI=true \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v "$PWD/$config:/.dive-ci:ro" \
      "wagoodman/dive:${DIVE_VERSION:-v0.13.1}" \
      --ci --ci-config /.dive-ci --source docker "$tag"
  fi
}

run() {
  : "${NAME:?NAME is required}"
  : "${DOCKERFILE:?DOCKERFILE is required}"
  : "${CONTEXT:?CONTEXT is required}"
  : "${BUDGET_MB:?BUDGET_MB is required}"
  local target="${TARGET:-}"
  local tol="${TOLERANCE_PCT:-0}"
  local out_dir="${OUT_DIR:-.docker-perf}"
  mkdir -p "$out_dir"

  log "==> [${NAME}] building head image from ${DOCKERFILE}"
  local head_tag="docker-perf-${NAME}:head"
  local build_ms current_bytes
  build_ms="$(build_image "$DOCKERFILE" "$CONTEXT" "$target" "$head_tag" head)"
  current_bytes="$(image_size "$head_tag")"

  local base_bytes=0 base_build_ms=0
  if [[ -n "${BASE_DOCKERFILE:-}" && -f "${BASE_DOCKERFILE}" ]]; then
    log "==> [${NAME}] building base image from ${BASE_DOCKERFILE}"
    local base_tag="docker-perf-${NAME}:base"
    base_build_ms="$(build_image "$BASE_DOCKERFILE" "${BASE_CONTEXT:-$CONTEXT}" "$target" "$base_tag" base || echo 0)"
    base_bytes="$(image_size "$base_tag" 2>/dev/null || echo 0)"
  else
    log "==> [${NAME}] no base Dockerfile available; skipping delta"
  fi

  local hadolint_status=0
  run_hadolint "$DOCKERFILE" || hadolint_status=$?
  log "==> [${NAME}] hadolint exit status: ${hadolint_status}"

  local dive_status=0
  run_dive "$head_tag" || dive_status=$?
  log "==> [${NAME}] dive exit status: ${dive_status}"

  local exception exception_scope
  exception="$(detect_exception "$DOCKERFILE")"
  exception_scope="$(detect_exception_scope "$DOCKERFILE")"
  [[ -n "$exception" ]] && log "==> [${NAME}] documented exception: ${exception}"

  local eval_out rc=0
  eval_out="$(CURRENT_BYTES="$current_bytes" BUDGET_MB="$BUDGET_MB" TOLERANCE_PCT="$tol" \
    DIVE_STATUS="$dive_status" HADOLINT_STATUS="$hadolint_status" EXCEPTION_SCOPE="$exception_scope" \
    EXCEPTION_REASON="$exception" \
    evaluate)" || rc=$?
  printf '%s\n' "$eval_out" >&2

  local verdict
  case "$eval_out" in
    PASS*) verdict="pass" ;;
    EXCEPTION*) verdict="exception" ;;
    *) verdict="fail" ;;
  esac

  local report_exception=""
  [[ "$verdict" == "exception" ]] && report_exception="$exception"

  jq -n \
    --arg name "$NAME" \
    --arg dockerfile "$DOCKERFILE" \
    --argjson current "$current_bytes" \
    --argjson base "$base_bytes" \
    --argjson build_ms "$build_ms" \
    --argjson base_build_ms "$base_build_ms" \
    --argjson budget_mb "$BUDGET_MB" \
    --argjson tol "$tol" \
    --argjson dive "$dive_status" \
    --argjson hadolint "$hadolint_status" \
    --arg verdict "$verdict" \
    --arg exception "$report_exception" \
    '{name:$name, dockerfile:$dockerfile, current_bytes:$current, base_bytes:$base,
      build_ms:$build_ms, base_build_ms:$base_build_ms, budget_mb:$budget_mb,
      tolerance_pct:$tol, dive_status:$dive, hadolint_status:$hadolint,
      verdict:$verdict, exception:$exception}' \
    > "$out_dir/metrics-${NAME}.json"

  render_report "$out_dir/metrics-${NAME}.json" > "$out_dir/row-${NAME}.md"

  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    {
      echo "### Dockerfile performance - ${NAME}"
      echo
      echo "| Image | Dockerfile | Size | Delta vs base | Build time | Budget | Status |"
      echo "| --- | --- | --- | --- | --- | --- | --- |"
      cat "$out_dir/row-${NAME}.md"
    } >> "$GITHUB_STEP_SUMMARY"
  fi

  return "$rc"
}

main() {
  local cmd="${1:-run}"
  [[ "$#" -gt 0 ]] && shift
  case "$cmd" in
    run) run ;;
    evaluate) evaluate ;;
    detect-exception) detect_exception "$@" ;;
    detect-exception-scope) detect_exception_scope "$@" ;;
    render-report) render_report "$@" ;;
    *) log "unknown subcommand: ${cmd}"; return 2 ;;
  esac
}

main "$@"
