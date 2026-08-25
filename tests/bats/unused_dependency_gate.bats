#!/usr/bin/env bats

# Coverage for the unused-dependency gate (issues #92 and #93): the Makefile
# target that dispatches it into the bun container, its registration in the
# `lint` aggregate, and the script's own verdicts against fixture manifests.

load './test_helper.bash'

MAKEFILE="$PROJECT_ROOT/Makefile"
GATE_SCRIPT="$PROJECT_ROOT/scripts/ci/check-unused-dependencies.ts"

# One package per implicit-usage rule the policy applies: a `@types/*` package
# the compiler consumes, an alias-resolved package from IMPLICITLY_RESOLVED, and
# a package the fixture also declares as a peer dependency.
IMPLICITLY_USED_DEV_DEPENDENCIES='"@types/node": "^26.0.0", "jest-environment-jsdom": "^30.4.1", "peer-only": "^1.0.0"'

setup() {
  setup_makefile_test_env
  # The shared helper puts a logging `bun` stub that always exits 0 on PATH, which is what
  # the Makefile-dispatch tests above want. The gate-verdict tests below run the real gate,
  # and under the stub every one of them would pass vacuously. Dropping the stub leaves the
  # real interpreter, further along the same PATH, to answer.
  rm -f "$STUB_BIN_DIR/bun"
}

# Build a fixture tree whose only real reference is `used-lib`, imported from
# src/index.ts. The tree has no git index, so the gate falls back to its walk.
# The optional third argument names a package declared in both `dependencies`
# and `peerDependencies`, for the rule that the peer exemption is devDependency
# scoped.
write_fixture() {
  local dir="$1"
  local dev_dependencies="$2"
  local peer_production_package="${3:-}"

  local peer_production_entry=''
  if [ -n "$peer_production_package" ]; then
    peer_production_entry=", \"$peer_production_package\": \"^1.0.0\""
  fi

  mkdir -p "$dir/src"
  printf "import used from 'used-lib';\n\nexport default used;\n" > "$dir/src/index.ts"

  cat > "$dir/package.json" <<EOF
{
  "name": "unused-dependency-fixture",
  "dependencies": { "used-lib": "^1.0.0"$peer_production_entry },
  "devDependencies": { $dev_dependencies },
  "peerDependencies": { "peer-only": "^1.0.0"$peer_production_entry }
}
EOF
}

# ---- Makefile wiring ---------------------------------------------------------

@test "lint-unused-deps delegates to the gate script inside the bun container" {
  run_make_target lint-unused-deps
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose run --rm bun bun scripts/ci/check-unused-dependencies.ts'
}

@test "lint-unused-deps is declared in .PHONY" {
  awk '/^\.PHONY/{buf=""; flag=1} flag{buf=buf $0; if(/\\$/)next; if(buf ~ /lint-unused-deps/ && flag){found=1; exit}} END{exit !found}' "$MAKEFILE"
}

@test "lint target chain includes lint-unused-deps as a dependency" {
  grep -qE '^lint:.*lint-unused-deps' "$MAKEFILE"
}

# ---- gate verdicts -----------------------------------------------------------

@test "the gate passes when every declared package is referenced or implicitly resolved" {
  local fixture="$BATS_TEST_TMPDIR/referenced"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES"

  run bash -c "cd '$fixture' && bun '$GATE_SCRIPT'"
  [ "$status" -eq 0 ]
  assert_output_contains 'Every dependency and devDependency is referenced'
}

@test "the gate fails on a declared package nothing references" {
  local fixture="$BATS_TEST_TMPDIR/unreferenced"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES, \"never-referenced-pkg\": \"^1.0.0\""

  run bash -c "cd '$fixture' && bun '$GATE_SCRIPT'"
  [ "$status" -eq 1 ]
  assert_output_contains 'devDependencies.never-referenced-pkg'
}

@test "the peer exemption does not cover a production dependency" {
  local fixture="$BATS_TEST_TMPDIR/peer-production"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES" 'peer-production-pkg'

  run bash -c "cd '$fixture' && bun '$GATE_SCRIPT'"
  [ "$status" -eq 1 ]
  assert_output_contains 'dependencies.peer-production-pkg'
}

@test "the gate ignores planning prose under specs/ when deciding a package is used" {
  local fixture="$BATS_TEST_TMPDIR/specs-only"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES, \"specs-only-pkg\": \"^1.0.0\""
  mkdir -p "$fixture/specs"
  printf 'The plan considered specs-only-pkg but nothing adopted it.\n' > "$fixture/specs/plan.md"

  run bash -c "cd '$fixture' && bun '$GATE_SCRIPT'"
  [ "$status" -eq 1 ]
  assert_output_contains 'devDependencies.specs-only-pkg'
}

@test "the gate ignores markdown prose and env values when deciding a package is used" {
  local fixture="$BATS_TEST_TMPDIR/prose-only"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES, \"prose-only-pkg\": \"^1.0.0\""
  printf 'The README discusses prose-only-pkg without importing it.\n' > "$fixture/README.md"
  printf 'SOME_URL="http://localhost/api/prose-only-pkg"\n' > "$fixture/.env.example"

  run bash -c "cd '$fixture' && bun '$GATE_SCRIPT'"
  [ "$status" -eq 1 ]
  assert_output_contains 'devDependencies.prose-only-pkg'
}

@test "the gate does not count a package name embedded in a longer word as a reference" {
  local fixture="$BATS_TEST_TMPDIR/embedded-name"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES, \"range\": \"^1.0.0\""
  printf "export const arrangement = 'x';\n" > "$fixture/src/range.ts"

  run bash -c "cd '$fixture' && bun '$GATE_SCRIPT'"
  [ "$status" -eq 1 ]
  assert_output_contains 'devDependencies.range'
}

# A hyphen composes one registry name out of another, so it has to read as part of
# the identifier rather than as a word boundary: otherwise a surviving sibling
# keeps its dead prefix package alive, in either direction.
@test "the gate does not count a hyphenated sibling package as a reference" {
  local fixture="$BATS_TEST_TMPDIR/hyphenated-sibling"
  write_fixture "$fixture" \
    "$IMPLICITLY_USED_DEV_DEPENDENCIES, \"scope-tool\": \"^1.0.0\", \"lint\": \"^1.0.0\""
  printf "import 'scope-tool-webpack5';\nimport 'plugin-lint';\n" > "$fixture/src/siblings.ts"

  run bash -c "cd '$fixture' && bun '$GATE_SCRIPT'"
  [ "$status" -eq 1 ]
  assert_output_contains 'devDependencies.scope-tool'
  assert_output_contains 'devDependencies.lint'
}

# The bun image bakes no git binary, so a fixture that carries a .git index must
# hit the fail-closed branch instead of silently walking a divergent corpus.
@test "the gate exits 2 when a git index exists but no git binary does" {
  local fixture="$BATS_TEST_TMPDIR/git-no-binary"
  write_fixture "$fixture" "$IMPLICITLY_USED_DEV_DEPENDENCIES"
  mkdir -p "$fixture/.git"

  run bash -c "cd '$fixture' && bun '$GATE_SCRIPT'"
  [ "$status" -eq 2 ]
  assert_output_contains 'no git binary'
}

@test "the gate exits 2 when the manifest cannot be read" {
  local empty="$BATS_TEST_TMPDIR/no-manifest"
  mkdir -p "$empty"

  run bash -c "cd '$empty' && bun '$GATE_SCRIPT'"
  [ "$status" -eq 2 ]
  assert_output_contains 'Failed to read or parse'
}

@test "the real repository manifest passes the gate" {
  run bash -c "cd '$PROJECT_ROOT' && bun '$GATE_SCRIPT'"
  [ "$status" -eq 0 ]
}
