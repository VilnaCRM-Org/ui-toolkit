#!/usr/bin/env bats

load './test_helper.bash'

SCRIPT="$BATS_TEST_DIRNAME/../../scripts/ci/alpine_base_guard.sh"

write_fixture() {
  local path="$1"
  shift
  printf '%s\n' "$@" > "$path"
}

# --- classify (positive) ----------------------------------------------------

@test "classify treats an alpine tag with a digest suffix as alpine (positive)" {
  run bash "$SCRIPT" classify 'oven/bun:1.3.14-alpine@sha256:abc123'
  [ "$status" -eq 0 ]
  [ "$output" = "alpine" ]
}

@test "classify treats a compound alpine tag as alpine (positive)" {
  run bash "$SCRIPT" classify 'node:20-alpine3.19'
  [ "$status" -eq 0 ]
  [ "$output" = "alpine" ]
}

@test "classify treats a bare alpine repository as alpine (positive)" {
  run bash "$SCRIPT" classify 'alpine'
  [ "$status" -eq 0 ]
  [ "$output" = "alpine" ]
}

@test "classify treats a tagged alpine repository as alpine (positive)" {
  run bash "$SCRIPT" classify 'alpine:3.19'
  [ "$status" -eq 0 ]
  [ "$output" = "alpine" ]
}

@test "classify treats a fully qualified alpine repository as alpine (positive)" {
  run bash "$SCRIPT" classify 'docker.io/library/alpine:3.19'
  [ "$status" -eq 0 ]
  [ "$output" = "alpine" ]
}

@test "classify treats scratch as scratch (positive)" {
  run bash "$SCRIPT" classify 'scratch'
  [ "$status" -eq 0 ]
  [ "$output" = "scratch" ]
}

# --- classify (negative) -----------------------------------------------------

@test "classify treats the Playwright jammy vendor image as non-alpine (negative)" {
  run bash "$SCRIPT" classify 'mcr.microsoft.com/playwright:v1.59.1-jammy'
  [ "$status" -eq 0 ]
  [ "$output" = "non-alpine" ]
}

@test "classify treats ubuntu as non-alpine (negative)" {
  run bash "$SCRIPT" classify 'ubuntu:22.04'
  [ "$status" -eq 0 ]
  [ "$output" = "non-alpine" ]
}

# --- classify (edge) ---------------------------------------------------------

@test "classify reports an unresolved build-arg base as unknown (edge)" {
  run bash "$SCRIPT" classify '${BASE_IMAGE}'
  [ "$status" -eq 0 ]
  [ "$output" = "unknown" ]
}

@test "classify does not mistake a registry port for a tag (edge)" {
  run bash "$SCRIPT" classify 'registry:5000/team/app:1.0'
  [ "$status" -eq 0 ]
  [ "$output" = "non-alpine" ]
}

@test "classify treats an alpine repo behind a bare registry port as alpine (edge)" {
  run bash "$SCRIPT" classify 'registry:5000/library/alpine'
  [ "$status" -eq 0 ]
  [ "$output" = "alpine" ]
}

@test "classify treats an empty ref as unknown (edge)" {
  run bash "$SCRIPT" classify ''
  [ "$status" -eq 0 ]
  [ "$output" = "unknown" ]
}

@test "classify requires alpine in the final repo segment or tag, not a parent path (edge)" {
  # Default-deny: an Alpine-based image that does not advertise `alpine` in the
  # tag or final repo segment (e.g. alpine/git) still needs an explicit marker.
  run bash "$SCRIPT" classify 'alpine/git:2.40'
  [ "$status" -eq 0 ]
  [ "$output" = "non-alpine" ]
}

# --- parse-froms (positive) --------------------------------------------------

@test "parse-froms prints the single external base ref (positive)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.single"
  write_fixture "$dockerfile" \
    'FROM node:20-alpine' \
    'RUN echo hi'

  run bash "$SCRIPT" parse-froms "$dockerfile"
  [ "$status" -eq 0 ]
  [ "$output" = "node:20-alpine" ]
}

@test "parse-froms skips the platform flag and prints the ref (edge)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.platform"
  write_fixture "$dockerfile" \
    'FROM --platform=$BUILDPLATFORM node:20-alpine AS b'

  run bash "$SCRIPT" parse-froms "$dockerfile"
  [ "$status" -eq 0 ]
  [ "$output" = "node:20-alpine" ]
}

# --- parse-froms (negative / edge) -------------------------------------------

@test "parse-froms skips references to earlier build stages (edge)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.multistage"
  write_fixture "$dockerfile" \
    'FROM node:20-alpine AS build' \
    'RUN echo build' \
    'FROM build' \
    'RUN echo final'

  run bash "$SCRIPT" parse-froms "$dockerfile"
  [ "$status" -eq 0 ]
  [ "$output" = "node:20-alpine" ]
}

@test "parse-froms never mistakes a COPY --from stage for a base ref (edge)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.copyfrom"
  write_fixture "$dockerfile" \
    'FROM node:20-alpine AS build' \
    'RUN echo build' \
    'FROM alpine:3.19' \
    'COPY --from=build /app /app'

  run bash "$SCRIPT" parse-froms "$dockerfile"
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "node:20-alpine" ]
  [ "${lines[1]}" = "alpine:3.19" ]
  [ "${#lines[@]}" -eq 2 ]
  [[ "$output" != *build* ]]
}

@test "parse-froms prints nothing for a missing file (edge)" {
  run bash "$SCRIPT" parse-froms "$BATS_TEST_TMPDIR/Dockerfile.absent"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

# --- detect-exception --------------------------------------------------------

@test "detect-exception returns the inline marker reason (negative-waived)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.exception"
  write_fixture "$dockerfile" \
    '# alpine-exception: glibc-only vendor base' \
    'FROM ubuntu:22.04'

  run bash "$SCRIPT" detect-exception "$dockerfile"
  [ "$status" -eq 0 ]
  [ "$output" = "glibc-only vendor base" ]
}

@test "detect-exception ignores a bare marker with no reason (edge)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.bare"
  write_fixture "$dockerfile" \
    '# alpine-exception:' \
    'FROM ubuntu:22.04'

  run bash "$SCRIPT" detect-exception "$dockerfile"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

@test "detect-exception ignores a whitespace-only marker reason (edge)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.spaces"
  write_fixture "$dockerfile" \
    '# alpine-exception:    ' \
    'FROM ubuntu:22.04'

  run bash "$SCRIPT" detect-exception "$dockerfile"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

@test "detect-exception finds a marker placed below the FROM line (negative-waived)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.below"
  write_fixture "$dockerfile" \
    'FROM ubuntu:22.04' \
    '# alpine-exception: glibc-only vendor base'

  run bash "$SCRIPT" detect-exception "$dockerfile"
  [ "$status" -eq 0 ]
  [ "$output" = "glibc-only vendor base" ]
}

@test "detect-exception falls back to the PR label reason (negative-waived)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.label"
  write_fixture "$dockerfile" \
    'FROM ubuntu:22.04'

  run env ALPINE_EXCEPTION_LABEL=true bash "$SCRIPT" detect-exception "$dockerfile"
  [ "$status" -eq 0 ]
  [ "$output" = "PR label 'docker-alpine-exception' applied" ]
}

@test "detect-exception returns empty with no marker and no label (negative)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.none"
  write_fixture "$dockerfile" \
    'FROM ubuntu:22.04'

  run bash "$SCRIPT" detect-exception "$dockerfile"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

# --- evaluate ----------------------------------------------------------------

@test "evaluate passes an alpine base (positive)" {
  run env BASE_CLASS=alpine EXCEPTION_REASON= bash "$SCRIPT" evaluate
  [ "$status" -eq 0 ]
  assert_output_contains 'PASS: base image is Alpine-compliant'
}

@test "evaluate passes a scratch base (positive)" {
  run env BASE_CLASS=scratch EXCEPTION_REASON= bash "$SCRIPT" evaluate
  [ "$status" -eq 0 ]
  assert_output_contains 'PASS: base image is Alpine-compliant'
}

@test "evaluate fails a non-alpine base without an exception (negative)" {
  run env BASE_CLASS=non-alpine EXCEPTION_REASON= OFFENDING_REF='ubuntu:22.04' \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 1 ]
  assert_output_contains 'FAIL: non-Alpine base image; migrate to an Alpine variant or document an exception'
  assert_output_contains '(offending base: ubuntu:22.04)'
}

@test "evaluate waives a non-alpine base with a documented exception (negative-waived)" {
  run env BASE_CLASS=non-alpine EXCEPTION_REASON='glibc-only vendor base' \
    bash "$SCRIPT" evaluate
  [ "$status" -eq 0 ]
  assert_output_contains 'EXCEPTION: non-Alpine base waived by documented exception: glibc-only vendor base'
}

@test "evaluate fails an unknown base without an exception (edge)" {
  run env BASE_CLASS=unknown EXCEPTION_REASON= bash "$SCRIPT" evaluate
  [ "$status" -eq 1 ]
  assert_output_contains 'FAIL: non-Alpine base image; migrate to an Alpine variant or document an exception'
}

# --- scan (explicit fixture args only; hermetic) -----------------------------
#
# scan's git-discovery branch (no args) is the path the CI workflow exercises;
# it is intentionally validated by the live workflow run rather than here, so
# these tests stay hermetic and pass inside the container with no .git present.

@test "scan passes an Alpine fixture file (positive)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.alpine"
  write_fixture "$dockerfile" \
    'FROM node:20-alpine' \
    'RUN echo hi'

  run bash "$SCRIPT" scan "$dockerfile"
  [ "$status" -eq 0 ]
  assert_output_contains 'PASS'
}

@test "scan fails a Debian fixture file with no marker (negative)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.debian"
  write_fixture "$dockerfile" \
    'FROM debian:bookworm' \
    'RUN echo hi'

  run bash "$SCRIPT" scan "$dockerfile"
  [ "$status" -eq 1 ]
  assert_output_contains 'FAIL'
}

@test "scan waives a Debian fixture file carrying an inline marker (negative-waived)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.debian-waived"
  write_fixture "$dockerfile" \
    '# alpine-exception: glibc-only vendor base' \
    'FROM debian:bookworm' \
    'RUN echo hi'

  run bash "$SCRIPT" scan "$dockerfile"
  [ "$status" -eq 0 ]
  assert_output_contains 'EXCEPTION'
}

@test "scan fails when any of multiple fixtures is an unwaived violation (edge)" {
  local good="$BATS_TEST_TMPDIR/Dockerfile.good"
  local bad="$BATS_TEST_TMPDIR/Dockerfile.bad"
  write_fixture "$good" \
    'FROM node:20-alpine'
  write_fixture "$bad" \
    'FROM ubuntu:22.04'

  run bash "$SCRIPT" scan "$good" "$bad"
  [ "$status" -eq 1 ]
  assert_output_contains 'FAIL'
}

@test "scan fails an unresolved build-arg base (edge)" {
  local dockerfile="$BATS_TEST_TMPDIR/Dockerfile.arg"
  write_fixture "$dockerfile" \
    'FROM ${BASE_IMAGE}'

  run bash "$SCRIPT" scan "$dockerfile"
  [ "$status" -eq 1 ]
  assert_output_contains 'FAIL'
}

@test "scan fails closed on an explicit path that does not exist (negative)" {
  run bash "$SCRIPT" scan "$BATS_TEST_TMPDIR/Dockerfile.does-not-exist"
  [ "$status" -eq 1 ]
  assert_output_contains 'FAIL'
  assert_output_contains 'not found'
}
