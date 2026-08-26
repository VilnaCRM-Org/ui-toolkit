#!/usr/bin/env bash

PROJECT_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME:-$0}")/../.." >/dev/null 2>&1 && pwd)"

setup_stub_dir() {
  export STUB_BIN_DIR="$BATS_TEST_TMPDIR/bin"
  export COMMAND_LOG="$BATS_TEST_TMPDIR/commands.log"

  mkdir -p "$STUB_BIN_DIR"
  : > "$COMMAND_LOG"
  export PATH="$STUB_BIN_DIR:$PATH"
}

reset_command_log() {
  : > "$COMMAND_LOG"
}

create_docker_stub() {
  cat > "$STUB_BIN_DIR/docker" <<'EOF'
#!/usr/bin/env bash
printf 'docker %s\n' "$*" >> "${COMMAND_LOG:?}"

# Lets a test make one specific docker invocation fail, so recipes that chain
# several container commands can be checked for aborting on the first failure.
if [ -n "${FAKE_DOCKER_FAILING_COMMAND:-}" ] \
  && printf '%s' "$*" | grep -qF -- "$FAKE_DOCKER_FAILING_COMMAND"; then
  exit 1
fi

if [ "$1" = "compose" ] && [ "$2" = "ps" ] && [ "${3:-}" = "-q" ] && [ "${4:-}" = "bun" ]; then
  if [ -n "${FAKE_DOCKER_COMPOSE_BUN_ID:-}" ]; then
    printf '%s\n' "$FAKE_DOCKER_COMPOSE_BUN_ID"
  fi
  exit 0
fi

if [ "$1" = "compose" ] \
  && [ "${2:-}" = "exec" ] \
  && [ "${3:-}" = "-T" ] \
  && [ "${4:-}" = "bun" ] \
  && [ "${5:-}" = "test" ] \
  && [ "${6:-}" = "-d" ] \
  && [ "${7:-}" = "/app/coverage" ]; then
  if [ "${FAKE_BUN_COVERAGE_EXISTS:-0}" = "1" ]; then
    exit 0
  fi
  exit 1
fi

exit 0
EOF

  chmod +x "$STUB_BIN_DIR/docker"
}

create_bun_stub() {
  cat > "$STUB_BIN_DIR/bun" <<'EOF'
#!/usr/bin/env bash
printf 'bun %s\n' "$*" >> "${COMMAND_LOG:?}"
exit 0
EOF

  chmod +x "$STUB_BIN_DIR/bun"
}

setup_makefile_test_env() {
  setup_stub_dir
  create_docker_stub
  create_bun_stub

  export MAKEFILE_SANDBOX="$BATS_TEST_TMPDIR/makefile-sandbox"
  mkdir -p "$MAKEFILE_SANDBOX"
  cp "$PROJECT_ROOT/Makefile" "$MAKEFILE_SANDBOX/Makefile"
}

run_make_target() {
  local target="$1"
  shift

  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    COMMAND_LOG="$COMMAND_LOG" \
    make -C "$MAKEFILE_SANDBOX" "$target" "$@"
}

run_make_target_with_env() {
  local target="$1"
  shift

  run env \
    PATH="$STUB_BIN_DIR:$PATH" \
    COMMAND_LOG="$COMMAND_LOG" \
    "$@" \
    make -C "$MAKEFILE_SANDBOX" "$target"
}

assert_log_contains() {
  local expected="$1"

  if ! grep -F -- "$expected" "$COMMAND_LOG" >/dev/null 2>&1; then
    echo "Expected command log to contain: $expected" >&2
    echo "--- command log ---" >&2
    cat "$COMMAND_LOG" >&2
    return 1
  fi
}

assert_log_not_contains() {
  local unexpected="$1"

  if grep -F -- "$unexpected" "$COMMAND_LOG" >/dev/null 2>&1; then
    echo "Did not expect command log to contain: $unexpected" >&2
    echo "--- command log ---" >&2
    cat "$COMMAND_LOG" >&2
    return 1
  fi
}

assert_output_contains() {
  local expected="$1"
  local actual_output="${output-}"

  if [[ "$actual_output" != *"$expected"* ]]; then
    echo "Expected output to contain: $expected" >&2
    echo "--- output ---" >&2
    printf '%s\n' "$actual_output" >&2
    return 1
  fi
}
