#!/usr/bin/env sh
# Fail when test files (*.test.*, *.spec.*) live outside the root tests/ tree.
# See CONTRIBUTING.md ("Test directory layout") for the canonical structure.
#
# Usage: check-test-structure.sh [ROOT]
#   ROOT defaults to the current directory. A non-default ROOT is used by the
#   Bats suite to scan a fixture tree.
set -eu

ROOT="${1:-.}"

if [ ! -d "$ROOT" ]; then
  echo "ERROR: scan root '$ROOT' is not a directory." >&2
  exit 2
fi

if ! cd "$ROOT"; then
  echo "ERROR: scan root '$ROOT' is not accessible." >&2
  exit 2
fi

# Prune generated/vendored output (git-ignored, so it can never carry a
# committed test file), then the root tests/ tree (the only place test files
# are allowed) and the root _bmad tooling tree, and collect what remains.
# `if !` keeps a find failure from being masked by the trailing sort.
if ! matches=$(
  find . \
    \( -type d \( \
      -name node_modules -o \
      -name .git -o \
      -name build -o \
      -name out -o \
      -name .next -o \
      -name coverage -o \
      -name .stryker-tmp -o \
      -name storybook-static -o \
      -name playwright-report -o \
      -name test-results -o \
      -name reports -o \
      -name .lighthouseci -o \
      -name .qlty -o \
      -name .playwright-mcp \
    \) -prune \) -o \
    \( -path './tests' -o -path './tests/*' \
      -o -path './_bmad' -o -path './_bmad/*' \) -prune -o \
    -type f \( -name '*.test.*' -o -name '*.spec.*' \) -print
); then
  echo "ERROR: failed to scan '$ROOT' for test files." >&2
  exit 2
fi

matches=$(printf '%s' "$matches" | sort)

if [ -n "$matches" ]; then
  echo "ERROR: test files found outside the root tests/ directory:" >&2
  printf '%s\n' "$matches" | sed 's,^\./,  ,' >&2
  echo >&2
  echo "Move them under tests/ (tests/unit, tests/integration, tests/e2e," >&2
  echo "tests/visual, tests/load, tests/memory-leak, tests/bats)." >&2
  exit 1
fi

echo "OK: all test files live under the root tests/ directory."
