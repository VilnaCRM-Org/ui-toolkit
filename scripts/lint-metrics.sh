#!/bin/sh
# Complexity/metrics enforcement gate for ui-toolkit.
# Run via: make lint-metrics-run
set -eu

# ---- helpers -----------------------------------------------------------------

die() { printf 'lint-metrics: %s\n' "$*" >&2; exit 1; }

# ---- preconditions -----------------------------------------------------------

command -v jq >/dev/null 2>&1 || die "jq is required but not found in PATH"

[ -n "${RCA_BIN:-}" ] || die "RCA_BIN is not set"
[ -x "$RCA_BIN" ] || die "RCA_BIN='$RCA_BIN' is not executable"

[ -n "${METRICS_POLICY:-}" ] || die "METRICS_POLICY is not set"
[ -f "$METRICS_POLICY" ] || die "METRICS_POLICY='$METRICS_POLICY' not found"
jq empty "$METRICS_POLICY" 2>/dev/null || die "METRICS_POLICY='$METRICS_POLICY' is not valid JSON"

METRICS_POLICY_SCHEMA="${METRICS_POLICY_SCHEMA:-config/metrics-policy.schema.json}"
[ -f "$METRICS_POLICY_SCHEMA" ] || die "METRICS_POLICY_SCHEMA='$METRICS_POLICY_SCHEMA' not found"

[ -n "${RCA_SCOPE:-}" ] || die "RCA_SCOPE is not set"
[ -n "${RCA_EXCLUDES:-}" ] || die "RCA_EXCLUDES is not set"

# ---- schema self-validation --------------------------------------------------

schema_errors=$(jq -r --slurpfile schema "$METRICS_POLICY_SCHEMA" '
  . as $p | $schema[0] as $s |
  [
    if ($p | type) != "object"
      then "policy must be an object: got \($p | type)" else null end,

    (($s.required // []) | .[] | . as $k |
      if ($p | has($k) | not) then "missing required key: \($k)" else null end),

    (($s.properties // {}) | to_entries | .[] |
      .key as $k | .value.type as $t |
      if ($p | has($k)) and $t != null and (($p[$k] | type) != $t)
      then "non-object section: \($k): got \($p[$k] | type)"
      else null end),

    (($p | keys) - ($s.properties // {} | keys) | .[] |
      "unknown top-level key: \(.)"),

    if ($p.hard | type) == "object" then
      (($s.properties.hard.required // []) | .[] | . as $k |
        if ($p.hard | has($k) | not) then "hard: missing required key: \($k)" else null end),
      ($p.hard | to_entries | .[] |
        if (.value | type) != "number"
        then "hard.\(.key): expected number, got \(.value | type)"
        else null end),
      (($p.hard | keys) - ($s.properties.hard.properties // {} | keys) | .[] |
        "hard: unknown key: \(.)")
    else null end,

    if ($p | has("review")) and (($p.review | type) == "object") then
      ($p.review | to_entries | .[] |
        if (.value | type) != "number"
        then "review.\(.key): expected number, got \(.value | type)"
        else null end)
    else null end
  ] | map(select(. != null)) | .[]
' "$METRICS_POLICY" 2>&1) || true

if [ -n "$schema_errors" ]; then
  printf 'lint-metrics: policy validation failed\n' >&2
  printf '%s\n' "$schema_errors" >&2
  exit 1
fi

# ---- read policy thresholds --------------------------------------------------

hard=$(jq -c '.hard' "$METRICS_POLICY")
review=$(jq -c '.review // {}' "$METRICS_POLICY")

# ---- run the analyzer --------------------------------------------------------

set -- "$RCA_BIN" -m -O json -p "$RCA_SCOPE"
set -f
for excl in $RCA_EXCLUDES; do
  set -- "$@" -X "$excl"
done
set +f

analyzer_out=$("$@" 2>&1) || die "analyzer exited with error"

if [ -z "$analyzer_out" ]; then
  die "analyzer produced no output"
fi

if ! printf '%s' "$analyzer_out" | jq -e 'type == "array" or type == "object"' >/dev/null 2>&1; then
  die "analyzer output is not valid JSON (expected array of file objects)"
fi

# ---- evaluate all hard metrics -----------------------------------------------

findings=$(printf '%s' "$analyzer_out" | jq -r \
  --argjson hard "$hard" \
  --arg scope "$RCA_SCOPE" '

  # helpers
  def number_or_null:
    if . == null then null
    elif type == "number" then .
    elif type == "object" then (.sum // null)
    else null end;

  def ratio(num; den):
    if num == null or den == null or den == 0 then null else num / den end;

  def chk_max(file; scp; subj; ln; metric; val):
    if ($hard | has(metric)) and val != null and (val > $hard[metric])
    then "FAIL|\(file)|\(scp)|\(subj)|\(ln)|\(metric)|\(val)|\($hard[metric])"
    else empty end;

  def chk_min(file; scp; subj; ln; metric; val):
    if ($hard | has(metric)) and val != null and (val < $hard[metric])
    then "FAIL|\(file)|\(scp)|\(subj)|\(ln)|\(metric)|\(val)|\($hard[metric])"
    else empty end;

  # file-level metrics
  def eval_file(fname):
    . as $m |
    (
      chk_max(fname; "file"; fname; 0; "nom_functions_file_max"; $m.nom.functions // null),
      chk_max(fname; "file"; fname; 0; "nom_closures_file_max"; $m.nom.closures // null),
      chk_max(fname; "file"; fname; 0; "nom_total_file_max";
        if ($m.nom.functions != null) and ($m.nom.closures != null)
        then $m.nom.functions + $m.nom.closures else null end),
      chk_max(fname; "file"; fname; 0; "lloc_file_max"; $m.loc.lloc // null),
      chk_max(fname; "file"; fname; 0; "ploc_file_max"; $m.loc.ploc // null),
      chk_max(fname; "file"; fname; 0; "sloc_file_max"; $m.loc.sloc // null),
      chk_max(fname; "file"; fname; 0; "halstead_volume_file_max";
        $m.halstead.volume // null),
      chk_max(fname; "file"; fname; 0; "halstead_bugs_file_max";
        $m.halstead.bugs // null),
      chk_min(fname; "file"; fname; 0; "mi_visual_studio_min";
        ($m.mi.mi_visual_studio // $m.maintanability_index.mi_visual_studio // null))
    );

  # function/closure-level metrics
  def eval_fn(fname; sp):
    sp as $s |
    $s.metrics as $m |
    ($s.name // "") as $subj |
    ($s.start_line // 0) as $ln |
    (
      chk_max(fname; "function"; $subj; $ln; "cyclomatic_max";
        $m.cyclomatic.sum // null),
      chk_max(fname; "function"; $subj; $ln; "cognitive_max";
        ($m.cognitive | number_or_null)),
      chk_max(fname; "function"; $subj; $ln; "abc_magnitude_max";
        $m.abc.magnitude // null),
      chk_max(fname; "function"; $subj; $ln; "nargs_function_max";
        $m.nargs.functions_max // null),
      chk_max(fname; "function"; $subj; $ln; "nargs_closure_max";
        $m.nargs.closures_max // null),
      chk_max(fname; "function"; $subj; $ln; "nexits_max";
        $m.nexits.average // null),
      chk_max(fname; "function"; $subj; $ln; "lloc_function_max";
        $m.loc.lloc // null),
      chk_max(fname; "function"; $subj; $ln; "ploc_function_max";
        $m.loc.ploc // null),
      chk_max(fname; "function"; $subj; $ln; "sloc_function_max";
        $m.loc.sloc // null),
      chk_max(fname; "function"; $subj; $ln; "halstead_volume_function_max";
        $m.halstead.volume // null),
      chk_max(fname; "function"; $subj; $ln; "halstead_bugs_function_max";
        $m.halstead.bugs // null)
    );

  # class-level metrics
  def eval_class(fname; sp):
    sp as $s |
    $s.metrics as $m |
    ($s.name // "") as $subj |
    ($s.start_line // 0) as $ln |
    (
      chk_max(fname; "class"; $subj; $ln; "class_wmc_max";
        $m.wmc.classes_sum // null),
      chk_max(fname; "class"; $subj; $ln; "class_npm_max";
        $m.npm.classes // null),
      chk_max(fname; "class"; $subj; $ln; "class_npa_max";
        $m.npa.classes // null),
      chk_max(fname; "class"; $subj; $ln; "class_coa_max";
        $m.npm.classes_average // null),
      chk_max(fname; "class"; $subj; $ln; "class_cda_max";
        $m.npa.classes_average // null)
    );

  # interface-level metrics
  def eval_iface(fname; sp):
    sp as $s |
    $s.metrics as $m |
    ($s.name // "") as $subj |
    ($s.start_line // 0) as $ln |
    (
      chk_max(fname; "interface"; $subj; $ln; "interface_npm_max";
        $m.npm.interfaces // null),
      chk_max(fname; "interface"; $subj; $ln; "interface_npa_max";
        $m.npa.interfaces // null)
    );

  # recursive space evaluation
  def eval_spaces(fname):
    .[] |
    . as $sp |
    ($sp.kind // "") as $k |
    if $k == "function" or $k == "closure" then
      eval_fn(fname; $sp),
      if ($sp.spaces // []) | length > 0 then ($sp.spaces | eval_spaces(fname)) else empty end
    elif $k == "class" then
      eval_class(fname; $sp),
      if ($sp.spaces // []) | length > 0 then ($sp.spaces | eval_spaces(fname)) else empty end
    elif $k == "interface" then
      eval_iface(fname; $sp),
      if ($sp.spaces // []) | length > 0 then ($sp.spaces | eval_spaces(fname)) else empty end
    else
      if ($sp.spaces // []) | length > 0 then ($sp.spaces | eval_spaces(fname)) else empty end
    end;

  # normalise input: accept single object or array
  if type == "object" then [.] else . end |

  .[] |
  . as $fo |
  ($fo.name // "unknown") as $fname |
  (
    ($fo.metrics | eval_file($fname)),
    if ($fo.spaces // []) | length > 0 then ($fo.spaces | eval_spaces($fname)) else empty end
  )
' 2>&1) || die "metric evaluation failed"

# ---- report results ----------------------------------------------------------

printf 'rust-code-analysis: Scope: %s\n' "$RCA_SCOPE"

if [ -z "$findings" ]; then
  printf 'rust-code-analysis: all hard checks pass\n'

  # Measured-metric summary (hard metrics that produced values)
  printf '\n%s\n' "| METRIC | VALUE | LIMIT |"
  printf '%s\n'   "| --- | --- | --- |"
  printf '%s' "$analyzer_out" | jq -r \
    --argjson hard "$hard" \
    --arg scope "$RCA_SCOPE" '
    def number_or_null:
      if . == null then null
      elif type == "number" then .
      elif type == "object" then (.sum // null)
      else null end;

    if type == "object" then [.] else . end |
    .[] |
    . as $fo |
    $fo.metrics as $m |
    [
      if $m.loc.sloc != null then "| sloc_file_max | \($m.loc.sloc) | \($hard.sloc_file_max) |" else empty end,
      if $m.loc.lloc != null then "| lloc_file_max | \($m.loc.lloc) | \($hard.lloc_file_max) |" else empty end,
      if $m.nom != null then
        "| nom_total_file_max | \(($m.nom.functions // 0) + ($m.nom.closures // 0)) | \($hard.nom_total_file_max) |"
      else empty end,
      if $m.mi.mi_visual_studio != null then
        "| mi_visual_studio_min | \($m.mi.mi_visual_studio) | \($hard.mi_visual_studio_min) |"
      else empty end
    ] | .[]
  ' 2>/dev/null || true

  # Mirror to GITHUB_STEP_SUMMARY when set and writable
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ] && [ -w "${GITHUB_STEP_SUMMARY:-/dev/null}" ] 2>/dev/null; then
    printf '## rust-code-analysis: all hard checks pass\n\nScope: %s\n' "$RCA_SCOPE" \
      >> "$GITHUB_STEP_SUMMARY"
  fi

  exit 0
fi

# There are violations — print findings table
printf '\n%s\n' "| GATE | FILE | SCOPE | SUBJECT | LINE | METRIC | VALUE | LIMIT |"
printf '%s\n'   "| --- | --- | --- | --- | --- | --- | --- | --- |"
printf '%s\n' "$findings" | while IFS='|' read -r gate file scp subj line metric val limit; do
  printf '| %s | %s | %s | %s | %s | %s | %s | %s |\n' \
    "$gate" "$file" "$scp" "$subj" "$line" "$metric" "$val" "$limit"
done

# Mirror to GITHUB_STEP_SUMMARY when set and writable
if [ -n "${GITHUB_STEP_SUMMARY:-}" ] && [ -w "${GITHUB_STEP_SUMMARY:-/dev/null}" ] 2>/dev/null; then
  {
    printf '## rust-code-analysis: hard check violations\n\nScope: %s\n\n' "$RCA_SCOPE"
    printf '| GATE | FILE | SCOPE | SUBJECT | LINE | METRIC | VALUE | LIMIT |\n'
    printf '| --- | --- | --- | --- | --- | --- | --- | --- |\n'
    printf '%s\n' "$findings" | while IFS='|' read -r gate file scp subj line metric val limit; do
      printf '| %s | %s | %s | %s | %s | %s | %s | %s |\n' \
        "$gate" "$file" "$scp" "$subj" "$line" "$metric" "$val" "$limit"
    done
  } >> "$GITHUB_STEP_SUMMARY"
fi

exit 1
