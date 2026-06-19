#!/usr/bin/env bash
#
# Alpine base-image regression guard (issue #40).
#
# Hermetic static check: parses Dockerfile FROM lines and fails when a base
# image is non-Alpine and no documented exception applies. Never touches the
# network or Docker. Default-deny: any non-Alpine base must carry an inline
# `# alpine-exception: <reason>` marker (mirrors the `# perf-exception:`
# convention) or the `docker-alpine-exception` PR label.
#
# Exit codes: 0 ok / 1 gate failed / 2 usage error.

set -euo pipefail

log() {
  printf '%s\n' "$*" >&2
}

# classify <image_ref> -> alpine | scratch | non-alpine | unknown
classify() {
  local ref="${1:-}"

  # 1. Strip any @sha256:... digest suffix.
  ref="${ref%%@*}"

  # Empty/garbage ref -> unknown. Unreachable from scan (refs are filtered
  # before classify), but keeps the standalone subcommand from hard-failing the
  # gate on a malformed input.
  [ -n "$ref" ] || { printf '%s\n' "unknown"; return 0; }

  # 2. Exactly `scratch`.
  local lower="${ref,,}"
  if [ "$lower" = "scratch" ]; then
    printf '%s\n' "scratch"
    return 0
  fi

  # 3. Unresolved variable.
  if [[ "$ref" == *'$'* ]]; then
    printf '%s\n' "unknown"
    return 0
  fi

  # 4. Determine the tag from the last path segment (ignores registry:port/).
  local last="${ref##*/}"
  local tag=""
  if [[ "$last" == *:* ]]; then
    tag="${last##*:}"
  fi

  # 5. Tag contains `alpine`.
  if [[ "${tag,,}" == *alpine* ]]; then
    printf '%s\n' "alpine"
    return 0
  fi

  # 6. Repository name (ref with any :tag removed); last segment exactly `alpine`.
  local repo="$ref"
  if [[ "$last" == *:* ]]; then
    repo="${ref%:*}"
  fi
  local repo_last="${repo##*/}"
  if [ "${repo_last,,}" = "alpine" ]; then
    printf '%s\n' "alpine"
    return 0
  fi

  # 7. Otherwise.
  printf '%s\n' "non-alpine"
}

# parse-froms <dockerfile> -> external base refs, one per line
parse_froms() {
  local file="${1:-}"
  [ -n "$file" ] && [ -f "$file" ] || return 0

  local -a stages=()
  local line
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"

    # Match: leading space, FROM (case-insensitive), at least one space.
    if [[ ! "$line" =~ ^[[:space:]]*[Ff][Rr][Oo][Mm][[:space:]]+ ]]; then
      continue
    fi

    # Tokenize the remainder after FROM.
    local rest="${line#"${BASH_REMATCH[0]}"}"
    local -a tokens=()
    read -r -a tokens <<<"$rest"

    # First non-flag token is the image ref.
    local ref=""
    local tok
    for tok in "${tokens[@]+"${tokens[@]}"}"; do
      if [[ "$tok" == --* ]]; then
        continue
      fi
      ref="$tok"
      break
    done
    [ -n "$ref" ] || continue

    # Record AS <name> (case-insensitive) as a known stage.
    local stage_name=""
    local i
    for ((i = 0; i < ${#tokens[@]}; i++)); do
      if [[ "${tokens[i],,}" == "as" ]] && [ $((i + 1)) -lt ${#tokens[@]} ]; then
        stage_name="${tokens[i + 1],,}"
        break
      fi
    done

    # Local stage reference -> skip.
    local is_stage_ref=0
    local s
    for s in "${stages[@]+"${stages[@]}"}"; do
      if [ "${ref,,}" = "$s" ]; then
        is_stage_ref=1
        break
      fi
    done

    if [ -n "$stage_name" ]; then
      stages+=("$stage_name")
    fi

    if [ "$is_stage_ref" -eq 0 ]; then
      printf '%s\n' "$ref"
    fi
  done <"$file"
}

# detect-exception <dockerfile> -> reason or empty
#
# The waiver is file-scoped: a single marker anywhere in the file waives every
# non-Alpine base it declares. Reviewers should therefore scrutinise any
# multi-stage Dockerfile that carries a marker (see CONTRIBUTING.md).
detect_exception() {
  local file="${1:-}"
  local line reason

  if [ -n "$file" ] && [ -f "$file" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      line="${line%$'\r'}"
      if [[ "$line" =~ ^[[:space:]]*#[[:space:]]*[Aa][Ll][Pp][Ii][Nn][Ee]-[Ee][Xx][Cc][Ee][Pp][Tt][Ii][Oo][Nn][[:space:]]*:[[:space:]]*([^[:space:]].*)$ ]]; then
        reason="${BASH_REMATCH[1]}"
        reason="${reason%"${reason##*[![:space:]]}"}"
        printf '%s\n' "$reason"
        return 0
      fi
    done <"$file"
  fi

  if [ "${ALPINE_EXCEPTION_LABEL:-}" = "true" ]; then
    printf '%s\n' "PR label 'docker-alpine-exception' applied"
    return 0
  fi
}

# evaluate -> PASS/EXCEPTION (exit 0) | FAIL (exit 1), driven by env.
evaluate() {
  local base_class="${BASE_CLASS:-}"
  local reason="${EXCEPTION_REASON:-}"
  local offending="${OFFENDING_REF:-}"

  if [ "$base_class" = "alpine" ] || [ "$base_class" = "scratch" ]; then
    printf '%s\n' "PASS: base image is Alpine-compliant"
    return 0
  fi

  if [ -n "$reason" ]; then
    printf '%s\n' "EXCEPTION: non-Alpine base waived by documented exception: ${reason}"
    return 0
  fi

  if [ -n "$offending" ]; then
    printf '%s\n' "FAIL: non-Alpine base image; migrate to an Alpine variant or document an exception (offending base: ${offending})"
  else
    printf '%s\n' "FAIL: non-Alpine base image; migrate to an Alpine variant or document an exception"
  fi
  return 1
}

# Recognised container-build filenames: `Dockerfile`, `Dockerfile.<suffix>`,
# `<prefix>.Dockerfile`, and `Containerfile[.<suffix>]`. Kept in sync with the
# workflow `paths:` trigger so the discovery surface matches the trigger surface.
readonly DOCKERFILE_BASENAME_RE='^(Dockerfile([.][^/]+)?|[^/]+[.]Dockerfile|Containerfile([.][^/]+)?)$'

# discover_dockerfiles -> list of Dockerfile paths
discover_dockerfiles() {
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git ls-files | while IFS= read -r path; do
      local base="${path##*/}"
      if [[ "$base" =~ $DOCKERFILE_BASENAME_RE ]]; then
        printf '%s\n' "$path"
      fi
    done
  else
    # `base` is path-anchored (not `-name base`) so a directory legitimately
    # named `base/` at any depth is not silently pruned.
    find . \
      \( -name node_modules -o -name .git -o -name .stryker-tmp -o -path ./base \) -prune \
      -o -type f \( -name 'Dockerfile' -o -name 'Dockerfile.*' \
        -o -name '*.Dockerfile' -o -name 'Containerfile' -o -name 'Containerfile.*' \) -print
  fi
}

# scan [dockerfile...] -> exit 0 all-clear / 1 any unwaived violation
scan() {
  local -a files=()
  if [ "$#" -gt 0 ]; then
    files=("$@")
  else
    local f
    while IFS= read -r f; do
      [ -n "$f" ] && files+=("$f")
    done < <(discover_dockerfiles)
  fi

  local rc=0
  local file
  for file in "${files[@]+"${files[@]}"}"; do
    # Fail closed: an explicitly-listed path that does not exist (a deleted,
    # renamed, or typo'd Dockerfile in a changed-files list) must not pass the
    # gate by default.
    if [ ! -f "$file" ]; then
      printf '%s | %s | %s\n' "$file" "(missing)" "FAIL: Dockerfile not found or unreadable"
      rc=1
      continue
    fi

    local -a refs=()
    local r
    while IFS= read -r r; do
      [ -n "$r" ] && refs+=("$r")
    done < <(parse_froms "$file")

    local file_class="alpine"
    local offending=""
    local display="(none)"
    if [ "${#refs[@]}" -gt 0 ]; then
      display=""
      local ref class
      for ref in "${refs[@]}"; do
        class="$(classify "$ref")"
        if [ -n "$display" ]; then
          display+=", "
        fi
        display+="$ref"
        if [ "$class" != "alpine" ] && [ "$class" != "scratch" ] && [ "$file_class" != "non-alpine" ]; then
          file_class="non-alpine"
          offending="$ref"
        fi
      done
    fi

    local reason
    reason="$(detect_exception "$file")"

    local verdict
    if verdict="$(
      BASE_CLASS="$file_class" \
      EXCEPTION_REASON="$reason" \
      OFFENDING_REF="$offending" \
      evaluate
    )"; then
      :
    else
      rc=1
    fi

    printf '%s | %s | %s\n' "$file" "$display" "$verdict"
  done

  if [ "$rc" -eq 0 ]; then
    printf '%s\n' "alpine base guard: all Dockerfiles compliant"
  else
    printf '%s\n' "alpine base guard: violations found"
  fi
  return "$rc"
}

main() {
  local cmd="${1:-scan}"
  [ "$#" -gt 0 ] && shift || true

  case "$cmd" in
    classify) classify "$@" ;;
    parse-froms) parse_froms "$@" ;;
    detect-exception) detect_exception "$@" ;;
    evaluate) evaluate ;;
    scan) scan "$@" ;;
    *)
      log "alpine base guard: unknown subcommand: ${cmd}"
      log "usage: alpine_base_guard.sh {classify|parse-froms|detect-exception|evaluate|scan}"
      exit 2
      ;;
  esac
}

main "$@"
