#!/usr/bin/env bats

load './test_helper.bash'

ALPINE_GUARD="$BATS_TEST_DIRNAME/../../scripts/ci/alpine_base_guard.sh"
DOCKERFILE_RCA="$PROJECT_ROOT/Dockerfile.rca"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

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
  grep -q 'Dockerfile.rca' "$COMPOSE_FILE"
}

@test "rca service declares profiles: [tools]" {
  grep -qE 'tools' "$COMPOSE_FILE"
}

@test "rca service bind-mounts the working tree to /app" {
  grep -qE '\./:/app|\.:/app' "$COMPOSE_FILE"
}

@test "rca service does not expose any host ports" {
  # Extract only the rca service block and ensure it has no 'ports:' key
  python3 -c "
import sys, yaml
with open('$COMPOSE_FILE') as f:
    data = yaml.safe_load(f)
svc = data.get('services', {}).get('rca', {})
assert 'ports' not in svc, 'rca service must not expose host ports'
"
}
