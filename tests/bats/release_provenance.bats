#!/usr/bin/env bats

load './test_helper.bash'

WORKFLOW() {
  printf '%s' "$PROJECT_ROOT/.github/workflows/release-provenance.yml"
}

step_line() {
  grep -nE "^ +- name: $1$" "$(WORKFLOW)" | head -n 1 | cut -d: -f1
}

@test "release provenance runs when a release is published" {
  grep -qxE '  release:' "$(WORKFLOW)"
  grep -qxE '      - published' "$(WORKFLOW)"
}

@test "release provenance builds and gates the tarball before attesting and replacing the asset" {
  local pack licences attest upload
  pack="$(step_line 'Pack the publishable tarball from the release tag')"
  licences="$(step_line 'Fail on a licence, IP or secret finding in the tarball')"
  attest="$(step_line 'Attest build provenance for the release tarball')"
  upload="$(step_line 'Replace the release asset with the attested tarball')"

  [ -n "$pack" ] && [ -n "$licences" ] && [ -n "$attest" ] && [ -n "$upload" ]
  [ "$pack" -lt "$licences" ]
  [ "$licences" -lt "$attest" ]
  [ "$attest" -lt "$upload" ]
}

@test "release provenance attests the packed tarball and uploads the same file" {
  grep -qF "subject-path: 'dist/*.tgz'" "$(WORKFLOW)"
  grep -qF 'tarballs=(dist/*.tgz)' "$(WORKFLOW)"
  grep -qF 'gh release upload "$RELEASE_TAG" "${tarballs[0]}" --clobber' "$(WORKFLOW)"
}

@test "release provenance grants only the permissions attestation and upload need" {
  grep -qxF '      contents: write' "$(WORKFLOW)"
  grep -qxF '      id-token: write' "$(WORKFLOW)"
  grep -qxF '      attestations: write' "$(WORKFLOW)"
}

@test "the release workflow leaves attestation to release provenance" {
  run grep -F 'attest-build-provenance' "$PROJECT_ROOT/.github/workflows/autorelease.yml"
  [ "$status" -eq 1 ]
}
