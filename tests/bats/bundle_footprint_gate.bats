#!/usr/bin/env bats

load './test_helper.bash'

CHECK="$PROJECT_ROOT/scripts/ci/check-bundle-footprint.mjs"
BUDGET="$PROJECT_ROOT/config/bundle-budget.json"

setup() {
  export FIXTURE="$BATS_TEST_TMPDIR/fixture"
  mkdir -p "$FIXTURE/build/chunks"
  head -c 300 /dev/zero > "$FIXTURE/build/index.mjs"
  head -c 200 /dev/zero > "$FIXTURE/build/chunks/chunk-A.mjs"
  write_metafile
  write_budget
}

write_metafile() {
  cat > "$FIXTURE/metafile.json" <<'EOF'
{
  "inputs": {},
  "outputs": {
    "build/index.mjs": {
      "bytes": 100,
      "entryPoint": "src/components/index.ts",
      "imports": [
        { "path": "build/chunks/chunk-A.mjs", "kind": "import-statement" },
        { "path": "build/chunks/chunk-B.mjs", "kind": "import-statement" }
      ],
      "inputs": { "src/components/index.ts": { "bytesInOutput": 100 } },
      "cssBundle": "build/index.css"
    },
    "build/ui-a.mjs": {
      "bytes": 50,
      "entryPoint": "src/components/ui-a/index.tsx",
      "imports": [{ "path": "build/chunks/chunk-A.mjs", "kind": "import-statement" }],
      "inputs": { "src/components/ui-a/index.tsx": { "bytesInOutput": 50 } }
    },
    "build/ui-b.mjs": {
      "bytes": 60,
      "entryPoint": "src/components/ui-b/index.tsx",
      "imports": [
        { "path": "build/chunks/chunk-A.mjs", "kind": "import-statement" },
        { "path": "build/chunks/chunk-B.mjs", "kind": "import-statement" }
      ],
      "inputs": { "src/components/ui-b/index.tsx": { "bytesInOutput": 60 } }
    },
    "build/ui-theme.mjs": {
      "bytes": 10,
      "entryPoint": "src/components/ui-theme/index.ts",
      "imports": [],
      "inputs": { "src/components/ui-theme/index.ts": { "bytesInOutput": 10 } }
    },
    "build/chunks/chunk-A.mjs": {
      "bytes": 400,
      "imports": [],
      "inputs": {
        "src/components/ui-a/styles.ts": { "bytesInOutput": 300 },
        "src/components/ui-theme/index.ts": { "bytesInOutput": 100 }
      }
    },
    "build/chunks/chunk-B.mjs": {
      "bytes": 700,
      "imports": [{ "path": "build/chunks/chunk-A.mjs", "kind": "import-statement" }],
      "inputs": {
        "src/components/ui-b/card.tsx": { "bytesInOutput": 200 },
        "node_modules/swiper/swiper.mjs": { "bytesInOutput": 500 }
      }
    },
    "build/index.css": { "bytes": 80, "imports": [], "inputs": {} }
  }
}
EOF
}

write_budget() {
  cat > "$FIXTURE/budget.json" <<'EOF'
{
  "entryBytes": { "default": 1000, "index": 2000, "ui-b": 1200 },
  "cssBytes": 100,
  "buildBytes": 1000,
  "sharedEntries": ["ui-theme"],
  "composition": { "ui-b": ["ui-a"] },
  "isolatedPackages": { "swiper": ["ui-b"] }
}
EOF
}

edit_budget() {
  node -e '
    const fs = require("fs");
    const budget = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const patch = JSON.parse(process.argv[2]);
    for (const [key, value] of Object.entries(patch)) budget[key] = value;
    fs.writeFileSync(process.argv[1], JSON.stringify(budget));
  ' "$FIXTURE/budget.json" "$1"
}

run_check() {
  run node "$CHECK" --metafile "$FIXTURE/metafile.json" --budget "$FIXTURE/budget.json" --build-dir "$FIXTURE/build"
}

@test "the library build asserts the footprint budget after emitting the bundle" {
  grep -qF "import { assertBundleFootprint } from './scripts/ci/check-bundle-footprint.mjs';" "$PROJECT_ROOT/build.config.mjs"
  grep -qF 'assertBundleFootprint({' "$PROJECT_ROOT/build.config.mjs"
  grep -qF "budgetPath: path.resolve(currentDir, 'config', 'bundle-budget.json')," "$PROJECT_ROOT/build.config.mjs"
}

@test "the committed budget declares every section the guard reads" {
  local key
  for key in entryBytes cssBytes buildBytes sharedEntries composition isolatedPackages; do
    node -e 'process.exit(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))[process.argv[2]] === undefined ? 1 : 0)' "$BUDGET" "$key"
  done
  node -e 'process.exit(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).entryBytes.default > 0 ? 0 : 1)' "$BUDGET"
}

@test "the committed budget confines swiper to the card list" {
  node -e '
    const budget = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    process.exit(JSON.stringify(budget.isolatedPackages.swiper) === JSON.stringify(["ui-card-list"]) ? 0 : 1);
  ' "$BUDGET"
}

@test "a build inside every budget passes and reports each entry's transitive bytes" {
  run_check
  [ "$status" -eq 0 ]
  assert_output_contains 'index                            1200 / 2000'
  assert_output_contains 'ui-b                             1160 / 1200'
  assert_output_contains 'ui-a                              450 / 1000'
  assert_output_contains 'build/                            500 bytes shipped'
}

@test "an entry whose transitive chunks exceed its budget fails the build" {
  edit_budget '{"entryBytes": {"default": 1000, "index": 2000, "ui-b": 1100}}'
  run_check
  [ "$status" -eq 1 ]
  assert_output_contains 'ui-b: 1160 bytes of JavaScript exceed its 1100-byte budget'
}

@test "the default budget applies to entries without their own line" {
  edit_budget '{"entryBytes": {"default": 400, "index": 2000, "ui-b": 1200}}'
  run_check
  [ "$status" -eq 1 ]
  assert_output_contains 'ui-a: 450 bytes of JavaScript exceed its 400-byte budget'
}

@test "the stylesheet and the shipped build directory have budgets of their own" {
  edit_budget '{"cssBytes": 79, "buildBytes": 499}'
  run_check
  [ "$status" -eq 1 ]
  assert_output_contains 'build/index.css: 80 bytes exceed its 79-byte budget'
  assert_output_contains 'build/: 500 bytes exceed the 499-byte package budget'
}

@test "an entry that reaches a component the budget does not declare fails the build" {
  edit_budget '{"composition": {}}'
  run_check
  [ "$status" -eq 1 ]
  assert_output_contains 'ui-b: reaches [ui-a] but config/bundle-budget.json composition declares []'
}

@test "a declared composition edge the build no longer has fails the build" {
  edit_budget '{"composition": {"ui-b": ["ui-a"], "ui-a": ["ui-b"]}}'
  run_check
  [ "$status" -eq 1 ]
  assert_output_contains 'ui-a: reaches [] but config/bundle-budget.json composition declares [ui-b]'
}

@test "shared token entries are reachable from anywhere without a declaration" {
  edit_budget '{"sharedEntries": []}'
  run_check
  [ "$status" -eq 1 ]
  assert_output_contains 'ui-a: reaches [ui-theme] but config/bundle-budget.json composition declares []'
}

@test "a chunk reached through a dynamic import counts toward bytes, composition, and isolation" {
  node -e '
    const fs = require("fs");
    const metafile = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    metafile.outputs["build/ui-a.mjs"].imports.push({ path: "build/chunks/chunk-B.mjs", kind: "dynamic-import" });
    fs.writeFileSync(process.argv[1], JSON.stringify(metafile));
  ' "$FIXTURE/metafile.json"
  run_check
  [ "$status" -eq 1 ]
  assert_output_contains 'ui-a                             1150 / 1000'
  assert_output_contains 'ui-a: 1150 bytes of JavaScript exceed its 1000-byte budget'
  assert_output_contains 'ui-a: reaches [ui-b] but config/bundle-budget.json composition declares []'
  assert_output_contains 'ui-a: pulls in swiper, which only [ui-b] may reach'
}

@test "an isolated package leaking into another entry fails the build" {
  edit_budget '{"isolatedPackages": {"swiper": []}}'
  run_check
  [ "$status" -eq 1 ]
  assert_output_contains 'ui-b: pulls in swiper, which only [] may reach'
  ! printf '%s' "$output" | grep -q 'index: pulls in swiper'
}

@test "a budget naming an entry the build does not emit fails the build" {
  edit_budget '{"entryBytes": {"default": 1000, "index": 2000, "ui-b": 1200, "ui-gone": 1}}'
  run_check
  [ "$status" -eq 1 ]
  assert_output_contains "config/bundle-budget.json names 'ui-gone', which the build does not emit"
}

@test "a metafile without entry points or a stylesheet fails the build" {
  printf '{"inputs": {}, "outputs": {}}\n' > "$FIXTURE/metafile.json"
  edit_budget '{"sharedEntries": [], "composition": {}, "isolatedPackages": {}}'
  run_check
  [ "$status" -eq 1 ]
  assert_output_contains 'the build emitted no entry points'
  assert_output_contains 'the build emitted no build/index.css'
}

@test "the checker refuses to run without its three arguments" {
  run node "$CHECK" --metafile "$FIXTURE/metafile.json"
  [ "$status" -eq 1 ]
  assert_output_contains 'usage: check-bundle-footprint.mjs'
}
