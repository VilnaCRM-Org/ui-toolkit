#!/usr/bin/env bats

# Guards against command-documentation drift (issue #102). The human/agent
# operating docs (README.md, agents.md) must stay honest about the Makefile:
#
#   1. Every `make <target>` they reference must actually exist in the Makefile,
#      so a doc can never deny or misname a target the machine defines/runs.
#   2. Every core pull-request gate surfaced in the README gating table must be
#      documented, so a newcomer or agent can reproduce the CI gate from the docs.
#
# This is the docs-equivalent of tests/bats/make-target-coverage.tsv, which keeps
# the Bats coverage manifest honest against the same Makefile.

load './test_helper.bash'

# The core pull-request gates surfaced in the README gating table — the set a
# contributor is expected to run locally. This is a curated subset (heavy suites
# such as memory-leak and lighthouse are documented in agents.md but not listed
# here); keep it in sync with the README table. Adding a target here means it
# must be documented in README.md or agents.md.
GATING_TARGETS=(lint test-unit test-integration test-e2e test-visual test-storybook test-mutation test-bats)

# Print, one per line, every `make <target>` invocation that appears in a CODE
# context (a fenced code block or an inline `code` span) of the given Markdown
# file. Two things are deliberately excluded so the guard never fails a valid doc:
#   - prose such as "does NOT make the work done" (not in code formatting), and
#   - the English verb in a comment such as "# make sure the container is up"
#     (`make` there is not at a shell command position).
# To achieve the latter, every code line is prefixed with a synthetic "; "
# separator, then only a `make` sitting at a command position — line start or
# right after a `;`, `&`, `|`, or `(` — is treated as an invocation.
extract_documented_targets() {
  local file="$1"
  {
    # Bodies of ``` fenced code blocks (fences sit at column 0 in these docs).
    awk '/^```/ { f = 1 - f; next } f { print }' "$file"
    # Contents of inline `code` spans, one per line.
    grep -oE '`[^`]+`' "$file" | tr -d '`'
  } \
    | sed 's/^/; /' \
    | grep -oE '[;&|(] *make [a-z][a-z0-9-]+' \
    | sed 's/.*make //' \
    | sort -u
}

# Print, one per line, every real target defined in the Makefile, excluding the
# dot-directives (.PHONY, .DEFAULT_GOAL, ...). Mirrors the parsing used by
# target_coverage_contract.bats so both contracts see the same target set.
makefile_targets() {
  awk -F: '/^[A-Za-z0-9_.-]+:/ { if ($1 !~ /^\./) print $1 }' \
    "$PROJECT_ROOT/Makefile" | sort -u
}

assert_documented_targets_exist() {
  local doc="$1"
  local known missing=""
  known="$(makefile_targets)"

  while IFS= read -r target; do
    [ -n "$target" ] || continue
    if ! printf '%s\n' "$known" | grep -qxF "$target"; then
      missing="$missing $target"
    fi
  done < <(extract_documented_targets "$PROJECT_ROOT/$doc")

  if [ -n "$missing" ]; then
    echo "$doc references make target(s) the Makefile does not define:$missing" >&2
    return 1
  fi
}

@test "every make target documented in README.md exists in the Makefile" {
  assert_documented_targets_exist README.md
}

@test "every make target documented in agents.md exists in the Makefile" {
  assert_documented_targets_exist agents.md
}

@test "every core pull-request gate in the README table is documented in the docs" {
  local documented undocumented=""
  documented="$(
    {
      extract_documented_targets "$PROJECT_ROOT/README.md"
      extract_documented_targets "$PROJECT_ROOT/agents.md"
    } | sort -u
  )"

  local gate
  for gate in "${GATING_TARGETS[@]}"; do
    if ! printf '%s\n' "$documented" | grep -qxF "$gate"; then
      undocumented="$undocumented $gate"
    fi
  done

  if [ -n "$undocumented" ]; then
    echo "Core gating target(s) not documented in README.md or agents.md:$undocumented" >&2
    return 1
  fi
}

@test "agents.md documents the make test-integration target instead of denying it" {
  # The retired sentence "There is no separate \`make test-integration\` target".
  run grep -Ei 'no separate.*test-integration' "$PROJECT_ROOT/agents.md"
  [ "$status" -ne 0 ]

  run grep -F 'make test-integration' "$PROJECT_ROOT/agents.md"
  [ "$status" -eq 0 ]
}
