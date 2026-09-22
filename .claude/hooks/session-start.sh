#!/usr/bin/env bash
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}" || exit 0

if command -v bun >/dev/null 2>&1; then
  if bun install --frozen-lockfile --ignore-scripts >/dev/null 2>&1; then
    echo "bun install --frozen-lockfile --ignore-scripts: ok (bun $(bun --version)); run make git-hooks-install for husky"
  else
    echo "bun install --frozen-lockfile --ignore-scripts: FAILED; native commands below will not work until it does"
  fi
else
  echo "bun: not installed; every command below needs Docker (make start-bun first)"
fi

if docker compose version >/dev/null 2>&1; then
  echo "docker compose: available; make targets run inside the bun service"
else
  echo "docker compose: unavailable; only the native commands below can run here"
fi

cat <<'MAP'
Native on the host (after the install above):
  bun x tsc --newLine LF
  bun x eslint --max-warnings 0 .
  bun x prettier . --check
  bun x markdownlint "**/*.md"
  bun scripts/ci/check-referenced-paths.ts
  NODE_OPTIONS=--no-experimental-strip-types node ./node_modules/jest/bin/jest.js
  NODE_OPTIONS=--no-experimental-strip-types node ./node_modules/jest/bin/jest.js --config jest.integration.config.ts
  bun x bats -r tests/bats
Docker only (pinned images): make lint-metrics, make lint-deps, make test-mutation, make test-e2e,
  make test-visual, make test-a11y, make test-storybook, make test-memory-leak, make lighthouse-*
Full map: make help. Test policy: agents.md. Merge bar: CONTRIBUTING.md.
MAP
