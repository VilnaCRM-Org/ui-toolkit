#!/usr/bin/env bats

# Guards the aggregate gate targets (issue #98). `make ci` and `make verify` are the
# repository's answer to "is my branch green?": one command that replays the merge bar
# locally instead of hand-copying steps out of 20 workflow YAMLs. Three things must stay
# true for that promise to hold:
#
#   1. Both targets run their gate set in order, fail fast, and exit non-zero.
#   2. `verify` is a superset of `ci`, so the cheap set can never drift out of the full one.
#   3. Every gate a pull-request workflow runs is reachable from `verify` — otherwise a
#      green `make verify` would prove less than a green pull request.

load './test_helper.bash'

# Pull-request workflow targets that are environment plumbing rather than quality gates:
# they boot, tear down, or move artifacts and assert nothing on their own. `make verify`
# manages its own containers through each gate, so it never needs to invoke these.
PLUMBING_TARGETS=(install start start-bun up down copy-coverage copy-mutation-report stage-mutation-reports)

# Sharded CI equivalents of a single local gate. CI fans mutation testing across a matrix
# and re-enforces the same Stryker break threshold once over the union of the shards;
# `make verify` runs that identical gate unsharded in one process.
GATE_EQUIVALENT_test_mutation_shard=test-mutation
GATE_EQUIVALENT_merge_mutation_reports=test-mutation

setup() {
  setup_makefile_test_env
  create_gate_make_stub
}

# A stand-in for the recursive `make <gate>` invocation, injected through the Makefile's
# MAKE_GATE variable. It logs each gate it was asked to run and fails the gates named in
# FAKE_FAILING_GATES, so the gate-runner's own control flow can be tested without running
# the real Docker-backed suites.
create_gate_make_stub() {
  cat > "$STUB_BIN_DIR/gate-make" <<'EOF'
#!/usr/bin/env bash
printf 'gate-make %s\n' "$*" >> "${COMMAND_LOG:?}"

for failing_gate in ${FAKE_FAILING_GATES:-}; do
  if [ "$1" = "$failing_gate" ]; then
    exit 1
  fi
done

exit 0
EOF

  chmod +x "$STUB_BIN_DIR/gate-make"
}

run_gate_set() {
  local target="$1"

  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    COMMAND_LOG="$COMMAND_LOG" \
    FAKE_FAILING_GATES="${FAKE_FAILING_GATES:-}" \
    make -C "$MAKEFILE_SANDBOX" "$target" MAKE_GATE=gate-make
}

# The gates the stub was actually asked to run, in order.
executed_gates() {
  awk '$1 == "gate-make" { print $2 }' "$COMMAND_LOG"
}

assert_summary_row() {
  assert_output_contains "$(printf '  %-20s %s' "$1" "$2")"
}

# Resolve a Makefile variable with real Make semantics (nested $(...) references included)
# rather than re-implementing expansion in awk.
makefile_variable() {
  local printer="$BATS_TEST_TMPDIR/print.mk"

  printf 'print-%%:\n\t@printf "%%s\\n" "$($*)"\n' > "$printer"
  make --no-print-directory -C "$PROJECT_ROOT" -f Makefile -f "$printer" "print-$1"
}

# Every real target defined in the Makefile, excluding the dot-directives. Mirrors the
# parsing used by target_coverage_contract.bats so every contract sees the same set.
makefile_target_names() {
  awk -F: '/^[A-Za-z0-9_.-]+:/ { if ($1 !~ /^\./) print $1 }' "$PROJECT_ROOT/Makefile" | sort -u
}

# The prerequisites of a target, with the trailing `## help text` stripped so a comment
# word can never be mistaken for a dependency.
target_prerequisites() {
  awk -F: -v target="$1" '
    $1 == target {
      sub(/^[^:]*:/, "")
      sub(/##.*/, "")
      print
    }
  ' "$PROJECT_ROOT/Makefile"
}

# Every target `make verify` reaches, transitively: the gate list plus the prerequisites
# each gate pulls in (this is what expands the `lint` aggregate into its eight linters).
verify_closure() {
  local known queue=() seen="" target token

  known="$(makefile_target_names)"
  read -r -a queue <<< "$(makefile_variable VERIFY_GATES)"

  while [ "${#queue[@]}" -gt 0 ]; do
    target="${queue[0]}"
    queue=("${queue[@]:1}")

    case " $seen " in
      *" $target "*) continue ;;
    esac
    seen="$seen $target"

    for token in $(target_prerequisites "$target"); do
      if printf '%s\n' "$known" | grep -qxF -- "$token"; then
        queue+=("$token")
      fi
    done
  done

  printf '%s\n' $seen | sort -u
}

# Every `run: make <target>` a pull-request workflow executes. GitHub expressions such as
# `${{ matrix.formFactor }}` are collapsed to `*` so a matrix-fanned target is matched as
# the family it stands for instead of being silently dropped.
pull_request_workflow_targets() {
  local workflow

  for workflow in "$PROJECT_ROOT"/.github/workflows/*.yml; do
    grep -qF 'pull_request:' "$workflow" || continue

    sed -E 's/\$\{\{[^}]*\}\}/*/g' "$workflow" \
      | sed -n -E 's/^[[:space:]]*run:[[:space:]]*make[[:space:]]+([A-Za-z0-9_.*-]+).*/\1/p'
  done | sort -u
}

gate_equivalent() {
  local key="GATE_EQUIVALENT_${1//[^A-Za-z0-9]/_}"

  printf '%s\n' "${!key:-$1}"
}

# ---- gate-runner behavior ----------------------------------------------------

@test "make ci runs the fast gate set in order and reports every gate as passing" {
  run_gate_set ci
  [ "$status" -eq 0 ]

  run diff -u <(printf '%s\n' lint build test-unit test-integration test-bats) <(executed_gates)
  [ "$status" -eq 0 ]
}

@test "make ci prints a gate summary and a passing verdict" {
  run_gate_set ci
  [ "$status" -eq 0 ]

  assert_output_contains 'ci gate summary'
  assert_summary_row lint pass
  assert_summary_row test-bats pass
  assert_output_contains 'ci PASSED'
}

@test "make ci stops at the first failing gate, marks the rest skipped, and exits non-zero" {
  FAKE_FAILING_GATES=build run_gate_set ci
  [ "$status" -ne 0 ]

  assert_summary_row lint pass
  assert_summary_row build FAIL
  assert_summary_row test-unit skipped
  assert_summary_row test-integration skipped
  assert_summary_row test-bats skipped
  assert_output_contains 'ci FAILED at gate: build'

  assert_log_contains 'gate-make build'
  assert_log_not_contains 'gate-make test-unit'
}

@test "make verify runs the ci gate set plus the heavy merge-bar suites" {
  run_gate_set verify
  [ "$status" -eq 0 ]
  assert_output_contains 'verify PASSED'

  run diff -u \
    <(printf '%s\n' lint build test-unit test-integration test-bats \
      test-mutation test-e2e test-visual test-memory-leak lighthouse-desktop lighthouse-mobile) \
    <(executed_gates)
  [ "$status" -eq 0 ]
}

@test "make verify fails closed when a heavy gate fails" {
  FAKE_FAILING_GATES=test-visual run_gate_set verify
  [ "$status" -ne 0 ]

  assert_summary_row test-visual FAIL
  assert_summary_row lighthouse-mobile skipped
  assert_output_contains 'verify FAILED at gate: test-visual'
}

@test "run-gates refuses to pass vacuously when no gate set is given" {
  run_gate_set run-gates
  [ "$status" -ne 0 ]
  assert_output_contains "run-gates needs a non-empty GATE_SET"
  assert_log_not_contains 'gate-make'
}

@test "help advertises the aggregate ci and verify entrypoints" {
  run_make_target help
  [ "$status" -eq 0 ]
  assert_output_contains 'ci'
  assert_output_contains 'verify'
}

# ---- gate-set composition ----------------------------------------------------

@test "the verify gate set is a superset of the ci gate set" {
  local ci_gates verify_gates gate
  ci_gates="$(makefile_variable CI_GATES)"
  verify_gates="$(makefile_variable VERIFY_GATES)"

  [ -n "$ci_gates" ]

  for gate in $ci_gates; do
    printf '%s\n' $verify_gates | grep -qxF -- "$gate"
  done
}

@test "every gate in the verify set is a real Makefile target" {
  local known gate
  known="$(makefile_target_names)"

  for gate in $(makefile_variable VERIFY_GATES); do
    printf '%s\n' "$known" | grep -qxF -- "$gate"
  done
}

# ---- the merge bar cannot drift away from the workflows ----------------------

@test "the workflow scanner sees the pull-request gates it is meant to police" {
  local targets
  targets="$(pull_request_workflow_targets)"

  # A silently empty or truncated scan would make the reachability test below pass
  # vacuously, so pin a few gates the workflows are known to run.
  printf '%s\n' "$targets" | grep -qxF -- 'test-unit'
  printf '%s\n' "$targets" | grep -qxF -- 'test-mutation-shard'
  printf '%s\n' "$targets" | grep -qxF -- 'lighthouse-*'
}

@test "every gate a pull request workflow runs is reachable from make verify" {
  local closure target unreachable=""
  closure="$(verify_closure)"

  while IFS= read -r target; do
    [ -n "$target" ] || continue

    case " ${PLUMBING_TARGETS[*]} " in
      *" $target "*) continue ;;
    esac

    target="$(gate_equivalent "$target")"

    if [ "${target%\*}" != "$target" ]; then
      printf '%s\n' "$closure" | grep -qE "^${target%\*}[A-Za-z0-9_.-]+$" && continue
    else
      printf '%s\n' "$closure" | grep -qxF -- "$target" && continue
    fi

    unreachable="$unreachable $target"
  done < <(pull_request_workflow_targets)

  if [ -n "$unreachable" ]; then
    echo "Pull-request gate(s) not reachable from 'make verify':$unreachable" >&2
    echo "--- verify closure ---" >&2
    printf '%s\n' "$closure" >&2
    return 1
  fi
}

# ---- documentation -----------------------------------------------------------

@test "README.md and CONTRIBUTING.md document ci and verify as the pre-push commands" {
  local doc
  for doc in README.md CONTRIBUTING.md; do
    grep -qF 'make ci' "$PROJECT_ROOT/$doc"
    grep -qF 'make verify' "$PROJECT_ROOT/$doc"
  done
}

@test "agents.md points contributors at the aggregate gate commands" {
  grep -qF 'make verify' "$PROJECT_ROOT/agents.md"
}
