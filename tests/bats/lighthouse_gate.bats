#!/usr/bin/env bats

load './test_helper.bash'

WORKFLOW="$PROJECT_ROOT/.github/workflows/performance-testing.yml"
LIGHTHOUSE_RC="$PROJECT_ROOT/lighthouserc.js"

setup() {
  export CONFIG_SANDBOX="$BATS_TEST_TMPDIR/config"
  mkdir -p "$CONFIG_SANDBOX/scripts/ci" "$CONFIG_SANDBOX/storybook-static"
  cp "$LIGHTHOUSE_RC" "$CONFIG_SANDBOX/lighthouserc.js"
  cp "$PROJECT_ROOT/scripts/ci/lighthouse-policy.js" "$CONFIG_SANDBOX/scripts/ci/lighthouse-policy.js"
  (cd "$CONFIG_SANDBOX" && node -e '
    const {
      CATALOGUE_TITLES,
      TITLES_WITHOUT_CONTENTFUL_PAINT,
      TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT,
    } = require("./scripts/ci/lighthouse-policy");
    const story = (id, title, name) => [id, { type: "story", id, title, name }];
    const titled = (prefix, titles) =>
      titles.map((title, index) => story(`${prefix}-${index}--only`, title, "Only"));
    const entries = Object.fromEntries([
      ["a--docs", { type: "docs", id: "a--docs", title: "A", name: "Docs" }],
      story("a--first", "A", "First"),
      story("a--second", "A", "Second"),
      story("b--only", "B", "Only"),
      story("c--only", "C", "Only"),
      ...titled("skipped", TITLES_WITHOUT_CONTENTFUL_PAINT),
      ...titled("icon", TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT),
      ...titled("board", CATALOGUE_TITLES),
    ]);
    require("fs").writeFileSync("storybook-static/index.json", JSON.stringify({ entries }));
  ')
}

load_config() {
  run env "$@" node -e '
    const config = require("./lighthouserc.js").ci;
    const PERFORMANCE = [
      "categories:performance",
      "first-contentful-paint",
      "speed-index",
      "cumulative-layout-shift",
    ];
    const floors = Object.fromEntries(
      config.assert.assertMatrix.map(entry => [
        entry.matchingUrlPattern,
        Object.fromEntries(
          Object.entries(entry.assertions).filter(([audit]) => PERFORMANCE.includes(audit))
        ),
      ])
    );
    console.log(JSON.stringify({ assert: Object.keys(config.assert), urls: config.collect.url, floors }));
  '
}

@test "the Lighthouse config audits one story per Storybook title from the built index" {
  cd "$CONFIG_SANDBOX"
  load_config LHCI_FORM_FACTOR=desktop
  [ "$status" -eq 0 ]
  [[ "$output" == '{"assert":["assertMatrix"],"urls":["/iframe.html?id=a--first&viewMode=story","/iframe.html?id=b--only&viewMode=story","/iframe.html?id=board-0--only&viewMode=story","/iframe.html?id=c--only&viewMode=story","/iframe.html?id=icon-0--only&viewMode=story","/iframe.html?id=icon-1--only&viewMode=story","/iframe.html?id=icon-2--only&viewMode=story","/iframe.html?id=icon-3--only&viewMode=story"],"floors":{'* ]]
  assert_output_contains '"[?&]id=a--first&":{"categories:performance":["error",{"minScore":0.9}]}'
  assert_output_contains '"[?&]id=c--only&":{"categories:performance":["error",{"minScore":0.9}]}'
}

@test "the Lighthouse config audits only its shard of the stories" {
  cd "$CONFIG_SANDBOX"
  load_config LHCI_FORM_FACTOR=mobile LHCI_SHARD=2/3
  [ "$status" -eq 0 ]
  [[ "$output" == '{"assert":["assertMatrix"],"urls":["/iframe.html?id=b--only&viewMode=story","/iframe.html?id=icon-0--only&viewMode=story","/iframe.html?id=icon-3--only&viewMode=story"],"floors":{'* ]]
  assert_output_contains '"[?&]id=b--only&":{"categories:performance":["error",{"minScore":0.4}]}'
  assert_output_contains '"[?&]id=icon-0--only&":{"first-contentful-paint":["error",{"minScore":0.4}],"speed-index":["error",{"minScore":0.4}],"cumulative-layout-shift":["error",{"minScore":0.4}]}'
}

@test "the Lighthouse config holds an icon-only title to the paint metrics and only warns on the catalogue board" {
  cd "$CONFIG_SANDBOX"
  load_config LHCI_FORM_FACTOR=desktop
  [ "$status" -eq 0 ]
  assert_output_contains '"[?&]id=icon-0--only&":{"first-contentful-paint":["error",{"minScore":0.9}],"speed-index":["error",{"minScore":0.9}],"cumulative-layout-shift":["error",{"minScore":0.9}]}'
  assert_output_contains '"[?&]id=board-0--only&":{"categories:performance":["warn",{"minScore":0.9}]}'
  [[ "$output" != *'"[?&]id=icon-0--only&":{"categories:performance"'* ]]
}

@test "the Lighthouse config holds every story to the accessibility and best-practices error floors" {
  cd "$CONFIG_SANDBOX"
  run env LHCI_FORM_FACTOR=mobile node -e '
    const matrix = require("./lighthouserc.js").ci.assert.assertMatrix;
    const floors = new Set(
      matrix.map(entry =>
        JSON.stringify([
          entry.aggregationMethod,
          entry.assertions["categories:accessibility"],
          entry.assertions["categories:best-practices"],
          entry.assertions["color-contrast"],
        ])
      )
    );
    console.log([...floors].join("\n"));
  '
  [ "$status" -eq 0 ]
  [ "$output" = '["median",["error",{"minScore":0.85}],["error",{"minScore":0.9}],"warn"]' ]
}

@test "the Lighthouse config refuses an icon-only or catalogue title the Storybook index does not have" {
  cd "$CONFIG_SANDBOX"
  node -e '
    const fs = require("fs");
    const index = JSON.parse(fs.readFileSync("storybook-static/index.json", "utf8"));
    delete index.entries["board-0--only"];
    fs.writeFileSync("storybook-static/index.json", JSON.stringify(index));
  '
  load_config LHCI_FORM_FACTOR=desktop
  [ "$status" -ne 0 ]
  assert_output_contains 'absent from the Storybook index: Showcase/'
}

@test "the Lighthouse config refuses to load without a form factor" {
  cd "$CONFIG_SANDBOX"
  load_config
  [ "$status" -ne 0 ]
  assert_output_contains 'LHCI_FORM_FACTOR must be one of desktop, mobile'
}

@test "the Lighthouse config refuses to load without a Storybook build" {
  cd "$CONFIG_SANDBOX"
  rm "$CONFIG_SANDBOX/storybook-static/index.json"
  load_config LHCI_FORM_FACTOR=desktop
  [ "$status" -ne 0 ]
}

@test "the Lighthouse config carries no hand-picked story list" {
  run grep -E 'STORY_IDS|uicomponents-' "$LIGHTHOUSE_RC"
  [ "$status" -ne 0 ]
}

@test "the Lighthouse config refuses a skip-list entry the Storybook index does not have" {
  cd "$CONFIG_SANDBOX"
  node -e '
    const fs = require("fs");
    const index = JSON.parse(fs.readFileSync("storybook-static/index.json", "utf8"));
    delete index.entries["skipped-0--only"];
    fs.writeFileSync("storybook-static/index.json", JSON.stringify(index));
  '
  load_config LHCI_FORM_FACTOR=desktop
  [ "$status" -ne 0 ]
  assert_output_contains 'absent from the Storybook index'
}

@test "the performance workflow builds Storybook once and shares it with every audit job" {
  [ "$(grep -c -E '^\s*run: make storybook-build$' "$WORKFLOW")" -eq 1 ]
  grep -qE '^\s*run: make copy-storybook-static$' "$WORKFLOW"
  grep -qE '^\s*needs: build-storybook$' "$WORKFLOW"
  grep -qE '^\s*name: storybook-static$' "$WORKFLOW"
  grep -qE '^\s*run: make load-storybook-static$' "$WORKFLOW"
  run grep -E '^\s*run: make lighthouse-' "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$(printf '%s\n' "$output" | wc -l)" -eq 1 ]
  printf '%s\n' "$output" | grep -qF 'LHCI_SHARD=${{ matrix.shard }}/$LHCI_SHARD_COUNT'
}

@test "the performance workflow's shard list matches its declared shard count" {
  local shards count
  shards="$(grep -oE '^\s*shard: \[[0-9, ]+\]$' "$WORKFLOW" | grep -oE '[0-9]+' | tr '\n' ' ')"
  count="$(grep -oE '^\s*LHCI_SHARD_COUNT: [0-9]+$' "$WORKFLOW" | grep -oE '[0-9]+$')"
  [ -n "$shards" ]
  [ -n "$count" ]
  [ "$(printf '%s' "$shards" | wc -w)" -eq "$count" ]
  [ "$shards" = "$(seq -s ' ' 1 "$count") " ]
}

@test "the performance workflow keeps the Lighthouse results of a failed audit" {
  local upload_line
  upload_line="$(grep -n -E '^\s*- name: Upload the Lighthouse results$' "$WORKFLOW" | cut -d: -f1)"
  [ -n "$upload_line" ]
  sed -n "$((upload_line + 1))p" "$WORKFLOW" | grep -qE '^\s*if: always\(\)$'
  grep -qE '^\s*name: lighthouse-\$\{\{ matrix\.formFactor \}\}-\$\{\{ matrix\.shard \}\}$' "$WORKFLOW"
}
