#!/usr/bin/env bats

load './test_helper.bash'

ALPINE_GUARD="$BATS_TEST_DIRNAME/../../scripts/ci/alpine_base_guard.sh"
DOCKERFILE_RCA="$PROJECT_ROOT/Dockerfile.rca"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

# Emit only the `rca:` service block (from `  rca:` to the next sibling service or
# top-level key) so assertions cannot be satisfied by a different service's keys.
# Uses awk rather than a YAML parser to avoid any python/PyYAML runtime dependency.
rca_block() {
  awk '
    /^  rca:[[:space:]]*$/ { f=1; print; next }
    f && (/^[^[:space:]]/ || /^  [^[:space:]]/) { f=0 }
    f { print }
  ' "$COMPOSE_FILE"
}

# --- Dockerfile.rca existence and alpine-exception marker --------------------

@test "Dockerfile.rca exists at the repository root" {
  [ -f "$DOCKERFILE_RCA" ]
}

@test "Dockerfile.rca carries a non-empty alpine-exception marker" {
  run bash "$ALPINE_GUARD" detect-exception "$DOCKERFILE_RCA"
  [ "$status" -eq 0 ]
  [ -n "$output" ]
}

@test "alpine guard passes for Dockerfile.rca (EXCEPTION waive)" {
  run bash "$ALPINE_GUARD" scan "$DOCKERFILE_RCA"
  [ "$status" -eq 0 ]
  assert_output_contains 'EXCEPTION'
}

# --- Dockerfile.rca content: version pin, binary path, supporting tools ------

@test "Dockerfile.rca pins rust-code-analysis-cli at version 0.0.25" {
  grep -qE '0\.0\.25' "$DOCKERFILE_RCA"
}

@test "Dockerfile.rca installs the binary to /usr/local/bin/rust-code-analysis-cli" {
  grep -q '/usr/local/bin/rust-code-analysis-cli' "$DOCKERFILE_RCA"
}

@test "Dockerfile.rca installs jq as a supporting tool" {
  grep -qE '\bjq\b' "$DOCKERFILE_RCA"
}

@test "Dockerfile.rca installs make as a supporting tool" {
  grep -qE '\bmake\b' "$DOCKERFILE_RCA"
}

@test "Dockerfile.rca verifies the amd64 prebuilt with the pinned SHA-256" {
  grep -q '9ec2a217b8ff191e02dab5d5f2eee6158b63fd975c532b2c5d67c2e6c7249894' "$DOCKERFILE_RCA"
}

@test "Dockerfile.rca falls back to cargo install on non-amd64 platforms" {
  grep -qE 'cargo install' "$DOCKERFILE_RCA"
}

# --- docker-compose.yml: rca service -----------------------------------------

@test "docker-compose.yml defines an rca service" {
  grep -q 'rca:' "$COMPOSE_FILE"
}

@test "rca service builds from Dockerfile.rca" {
  rca_block | grep -q 'Dockerfile.rca'
}

@test "rca service declares profiles: [tools]" {
  rca_block | grep -qE 'tools'
}

@test "rca service bind-mounts the working tree to /app" {
  rca_block | grep -qE '\./:/app|\.:/app'
}

@test "rca service does not expose any host ports" {
  local block
  block="$(rca_block)"
  [ -n "$block" ]
  ! grep -qE '^[[:space:]]*ports:' <<<"$block"
}
