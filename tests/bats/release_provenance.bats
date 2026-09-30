#!/usr/bin/env bats

load './test_helper.bash'

WORKFLOW() {
  printf '%s' "$PROJECT_ROOT/.github/workflows/release-provenance.yml"
}

AUTORELEASE() {
  printf '%s' "$PROJECT_ROOT/.github/workflows/autorelease.yml"
}

step_line() {
  grep -nE "^ +- name: $1$" "$(WORKFLOW)" | head -n 1 | cut -d: -f1
}

setup() {
  setup_stub_dir
  export WORK="$BATS_TEST_TMPDIR/work"
  mkdir -p "$WORK/dist"
  printf 'payload' > "$WORK/dist/vilnacrm-ui-toolkit-9.9.9.tgz"
  export PAYLOAD_SHA
  PAYLOAD_SHA="$(printf 'payload' | sha256sum | cut -d' ' -f1)"
  export GH_REPO='VilnaCRM-Org/ui-toolkit'
  cat > "$STUB_BIN_DIR/gh" <<'STUB'
#!/usr/bin/env bash
printf 'gh %s\n' "$*" >> "${COMMAND_LOG:?}"
case "$*" in
  *releases/tags/*) printf '%s' "$FAKE_RELEASE_JSON" ;;
  *octet-stream*) printf '%s  vilnacrm-ui-toolkit-9.9.9.tgz\n' "$FAKE_CHECKSUM_BODY" ;;
esac
STUB
  chmod +x "$STUB_BIN_DIR/gh"
}

release_json() {
  local digest="$1" with_checksum="${2:-0}"
  local assets
  assets="{\"name\":\"vilnacrm-ui-toolkit-9.9.9.tgz\",\"digest\":$digest,\"url\":\"https://api/a/1\"}"
  if [ "$with_checksum" = "1" ]; then
    assets="$assets,{\"name\":\"vilnacrm-ui-toolkit-9.9.9.tgz.sha256\",\"digest\":null,\"url\":\"https://api/a/2\"}"
  fi
  printf '{"assets":[%s]}' "$assets"
}

verify() {
  run bash "$PROJECT_ROOT/scripts/ci/verify-release-asset.sh" v9.9.9 "$WORK/dist"
}

@test "release provenance runs when a release is published" {
  grep -qxE '  release:' "$(WORKFLOW)"
  grep -qxE '      - published' "$(WORKFLOW)"
}

@test "release provenance builds and gates the tarball before attesting and verifying the asset" {
  local pack licences attest check
  pack="$(step_line 'Pack the publishable tarball from the release tag')"
  licences="$(step_line 'Fail on a licence, IP or secret finding in the tarball')"
  attest="$(step_line 'Attest build provenance for the release tarball')"
  check="$(step_line 'Verify the published release asset matches the attested tarball')"

  [ -n "$pack" ] && [ -n "$licences" ] && [ -n "$attest" ] && [ -n "$check" ]
  [ "$pack" -lt "$licences" ]
  [ "$licences" -lt "$attest" ]
  [ "$attest" -lt "$check" ]
  grep -qF 'run: bash scripts/ci/verify-release-asset.sh "$RELEASE_TAG" dist' "$(WORKFLOW)"
}

@test "release provenance never modifies the assets of a published release" {
  run grep -E 'gh release (upload|delete-asset|edit)|--clobber' "$(WORKFLOW)"
  [ "$status" -eq 1 ]
  grep -qF "subject-path: 'dist/*.tgz'" "$(WORKFLOW)"
}

@test "release provenance grants read-only contents plus attestation permissions" {
  grep -qxF '      contents: read' "$(WORKFLOW)"
  grep -qxF '      id-token: write' "$(WORKFLOW)"
  grep -qxF '      attestations: write' "$(WORKFLOW)"
  run grep -xF '      contents: write' "$(WORKFLOW)"
  [ "$status" -eq 1 ]
}

@test "the release workflow leaves attestation to release provenance" {
  run grep -F 'attest-build-provenance' "$(AUTORELEASE)"
  [ "$status" -eq 1 ]
}

@test "the release is created with the tarball and its checksum in one call" {
  grep -qF 'tarball="$(bash scripts/ci/write-release-checksum.sh dist)"' "$(AUTORELEASE)"
  grep -qF 'gh release create "$RELEASE_TAG" "$tarball" "$tarball.sha256" \' "$(AUTORELEASE)"
  run grep -F 'gh release upload' "$(AUTORELEASE)"
  [ "$status" -eq 1 ]
}

@test "the checksum writer prints the tarball and writes a bare-name sha256 file" {
  run bash "$PROJECT_ROOT/scripts/ci/write-release-checksum.sh" "$WORK/dist"
  [ "$status" -eq 0 ]
  [ "$output" = "$WORK/dist/vilnacrm-ui-toolkit-9.9.9.tgz" ]
  [ "$(cat "$WORK/dist/vilnacrm-ui-toolkit-9.9.9.tgz.sha256")" = "$PAYLOAD_SHA  vilnacrm-ui-toolkit-9.9.9.tgz" ]

  run bash -c "cd '$WORK/dist' && sha256sum -c vilnacrm-ui-toolkit-9.9.9.tgz.sha256"
  [ "$status" -eq 0 ]
  printf 'tampered' > "$WORK/dist/vilnacrm-ui-toolkit-9.9.9.tgz"
  run bash -c "cd '$WORK/dist' && sha256sum -c vilnacrm-ui-toolkit-9.9.9.tgz.sha256"
  [ "$status" -ne 0 ]
}

@test "the checksum writer fails when dist holds no tarball" {
  rm "$WORK/dist/vilnacrm-ui-toolkit-9.9.9.tgz"
  run bash "$PROJECT_ROOT/scripts/ci/write-release-checksum.sh" "$WORK/dist"
  [ "$status" -eq 1 ]
  [[ "$output" == *"expected exactly one tarball in $WORK/dist/, found 0"* ]]
}

@test "the checksum writer fails when dist holds two tarballs" {
  printf 'other' > "$WORK/dist/vilnacrm-ui-toolkit-9.9.8.tgz"
  run bash "$PROJECT_ROOT/scripts/ci/write-release-checksum.sh" "$WORK/dist"
  [ "$status" -eq 1 ]
  [[ "$output" == *"found 2"* ]]
}

@test "verification passes when the published digest matches the re-pack" {
  export FAKE_RELEASE_JSON
  FAKE_RELEASE_JSON="$(release_json "\"sha256:$PAYLOAD_SHA\"")"
  verify
  [ "$status" -eq 0 ]
  [[ "$output" == *"release v9.9.9 asset vilnacrm-ui-toolkit-9.9.9.tgz matches the attested re-pack sha256:$PAYLOAD_SHA"* ]]
  grep -qxF 'gh api repos/VilnaCRM-Org/ui-toolkit/releases/tags/v9.9.9' "$COMMAND_LOG"
  run grep -F 'octet-stream' "$COMMAND_LOG"
  [ "$status" -eq 1 ]
}

@test "verification also checks the published sha256 asset when it exists" {
  export FAKE_RELEASE_JSON FAKE_CHECKSUM_BODY="$PAYLOAD_SHA"
  FAKE_RELEASE_JSON="$(release_json "\"sha256:$PAYLOAD_SHA\"" 1)"
  verify
  [ "$status" -eq 0 ]
  grep -qxF 'gh api -H Accept: application/octet-stream https://api/a/2' "$COMMAND_LOG"
}

@test "verification fails closed when the published sha256 asset disagrees" {
  export FAKE_RELEASE_JSON FAKE_CHECKSUM_BODY="deadbeef"
  FAKE_RELEASE_JSON="$(release_json "\"sha256:$PAYLOAD_SHA\"" 1)"
  verify
  [ "$status" -eq 1 ]
  [[ "$output" == *"asset vilnacrm-ui-toolkit-9.9.9.tgz.sha256 lists deadbeef, the re-pack is $PAYLOAD_SHA"* ]]
}

@test "verification fails closed when the published digest differs" {
  export FAKE_RELEASE_JSON
  FAKE_RELEASE_JSON="$(release_json '"sha256:0000"')"
  verify
  [ "$status" -eq 1 ]
  [[ "$output" == *"digest sha256:0000 does not match the re-pack sha256:$PAYLOAD_SHA"* ]]
}

@test "verification fails closed when the asset has no digest" {
  export FAKE_RELEASE_JSON
  FAKE_RELEASE_JSON="$(release_json null)"
  verify
  [ "$status" -eq 1 ]
  [[ "$output" == *"release v9.9.9 has no asset vilnacrm-ui-toolkit-9.9.9.tgz with a digest"* ]]
}

@test "verification fails closed when the release lacks the tarball asset" {
  export FAKE_RELEASE_JSON='{"assets":[]}'
  verify
  [ "$status" -eq 1 ]
  [[ "$output" == *"has no asset vilnacrm-ui-toolkit-9.9.9.tgz"* ]]
}
