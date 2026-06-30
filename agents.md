# agents.md

This file is the contract for AI coding agents (Claude Code, Codex, GitHub Copilot, Cursor,
and any other assistant) working in the VilnaCRM `ui-toolkit` repository. It defines a
mandatory test-coverage policy and the exact workflow to follow whenever you write or update
tests. It promotes the agent and quality rules from `specs/planning-artifacts/architecture.md`
into a discoverable, root-level instruction file.

`ui-toolkit` is a shared internal component library: React 19, MUI 9 with Emotion, TypeScript
6, Storybook 10, Jest 29 with React Testing Library, and Playwright (e2e and visual), with
Stryker mutation testing. The package manager is `bun@1.3.5` and Node is `^20.19.0 ||
^22.13.0 || >=24`. Components are reuse-first (canonical behavior from `crm`, visual gap-fill
from `website`) and must stay deterministic and async-stateless. All commands are Makefile
targets run from the repository root, inside the Docker `bun` service.

Because this is a component library, the failure mode this policy guards against is real:
agents verify the primary render and skip the disabled, loading, error, empty, and boundary
states. A single happy-path test is NOT adequate coverage and does NOT make the work done.

## Mandatory Test-Scenario Coverage Policy

This policy is a hard requirement, not advice. It applies to every AI agent whenever you
write or update tests — when adding a component, enhancing one, changing behavior, or fixing
a bug. Follow the five steps below in order. Skipping a scenario class or step is allowed
ONLY with a recorded, concrete justification (see Step 3) — never by silent omission.

### Step 1 — Pick the Right Test Layer

Choose the layer(s) that actually exercise the change; a single component change often needs
more than one. Match the change to the suite and run its verification command.

| Test layer        | Use it for                                      | Command            |
| ----------------- | ----------------------------------------------- | ------------------ |
| Unit              | Components, hooks, theme, and pure client logic | `make test-unit`   |
| End-to-end (e2e)  | Storybook-driven component behavior end to end  | `make test-e2e`    |
| Visual regression | Any change to rendered UI, layout, or styling   | `make test-visual` |

Unit tests run on Jest with React Testing Library in a jsdom env; specs are centralized in
`tests/unit/**/*.test.tsx` (and `*.test.ts` for non-render logic). E2e and visual specs are
Playwright run against a Storybook build (`tests/e2e/**`, `tests/visual/**`); visual snapshots
sit in adjacent `*-snapshots/` folders. There is no separate `make test-integration` target:
integration-level coverage (component composition and interaction) lives in the Jest unit
suite via React Testing Library — exercise composed behavior there, not just isolated units.
Every test file lives under the root `tests/` tree, and `make lint-test-structure` (run on
every pull request) fails on any `*.test.*` or `*.spec.*` file placed outside it — see
CONTRIBUTING.md for the canonical layout.

Storybook is a first-class coverage layer here, not just documentation. Every new or enhanced
component MUST ship stories that render its full state matrix (see Step 2); e2e and visual
suites run against those stories, so missing states are missing coverage. Provenance for each
component must also be recorded per `specs/planning-artifacts/architecture.md`.

Add a specialized suite when the change touches its concern: `make test-mutation` (test
strength, Stryker), `make test-bats` (Makefile and CI shell flows), `make test-memory-leak`
(leaks), `make load-tests` (traffic, K6), and `make lighthouse-desktop` /
`make lighthouse-mobile` (performance, accessibility, best practices).

`make test-mutation` runs the full, gated Stryker suite locally. In CI it is sharded across a
parallel matrix (`make test-mutation-shard`) and a final job merges the per-shard reports and
re-enforces the same `break` threshold (`make merge-mutation-reports`) — same gate, much faster.
Every workflow cancels superseded runs via `concurrency`, so a new push aborts the previous one.
See CONTRIBUTING.md ("CI speed and the mutation-testing gate") for the full flow.

### Step 2 — Cover Every Applicable Scenario Class

For each layer you touch, cover all three scenario classes that apply to the change. Positive
coverage on its own is never enough.

1. Positive / happy path — valid props and the expected success render and behavior.
2. Negative / invalid / failure path — invalid or unsupported props, and error, loading,
   timeout, and retry handling exposed through component state.
3. Boundary / edge cases — empty, null, and missing-data states, plus boundary values for
   size, length, count, and layout, and off-by-one behavior.

Test the component state matrix, not just the default render. Walk this checklist and add
coverage for every item the change can reach.

- [ ] Default render and expected success state
- [ ] Disabled, loading, error, empty, and success variants
- [ ] Invalid props or unsupported prop combinations
- [ ] Boundary values for size, length, count, and layout constraints
- [ ] Keyboard and focus behavior for interactive components
- [ ] Accessibility expectations exposed through UI state changes (roles, names, `aria-*`)
- [ ] Responsive and visual-regression risk for reusable components
- [ ] Locale, formatting, and translation-sensitive behavior (i18next)
- [ ] Regression protection for previously reported component bugs (see Step 4)

### Step 3 — Document Any Skipped Scenario Class

If a scenario class or checklist item genuinely does not apply, record it explicitly with a
concrete reason — in the test file (as a comment), the pull request description, or your task
summary. Use the `Not applicable: <reason>` convention. A bare "not applicable" with no
reason, or silent omission, does not satisfy this policy.

Examples of acceptable justifications:

- `Disabled / loading — Not applicable: presentational component with no interactive state.`
- `Keyboard / focus — Not applicable: non-interactive layout primitive with no focusable child.`
- `Boundary / edge — Not applicable: pure type re-export with no runtime branches.`

### Step 4 — Regression Coverage Is Mandatory for Bug Fixes

When you fix a component bug, add a regression test that fails before your fix and passes
after it. This is mandatory unless there is a concrete, recorded reason a test cannot
reasonably be added (for example, the defect lives in a third-party dependency you do not
control). Document that reason as in Step 3, and cover the previously broken scenario in the
layer that best reproduces it — usually the Jest unit suite, sometimes e2e or visual.

### Step 5 — Verify Before Calling Test Work Done

Test work is not done until the relevant verification commands have actually been run and
pass. Run the layer commands you touched, then the project lint gate.

```bash
bun x prettier . --write   # Auto-format (lint runs format-check, so format first)
make test-unit             # Jest unit suite (jsdom)
make test-e2e              # Storybook-driven behavior (for behavior changes)
make test-visual           # Visual regression (for UI or styling changes)
make lint                  # Full gate: ESLint, TypeScript, markdownlint, and format-check
```

Run only the suites the change affects, but never skip a suite that does apply. If a
deliberate, reviewed UI change makes visual baselines stale, regenerate them with
`make test-visual PLAYWRIGHT_TEST_ARGS="--update-snapshots"` and review the diff before
committing.

## Behavior-First Assertions

Prefer meaningful behavior assertions over shallow rendering or snapshot-only coverage.

- Query the way a user perceives the UI: `getByRole`, `getByLabelText`, `getByAltText`, and
  `getByText` rather than implementation details. Use Playwright user-facing locators in e2e
  specs for the same reason. Do not add `data-testid` to source solely to satisfy a test.
- Assert against localized strings produced by the i18next `t()` function, not hardcoded
  English, so translation-sensitive behavior stays covered.
- Use `describe` and `it` blocks, mirroring the existing `tests/unit` suites.
- Treat snapshots and screenshots as a supplement that guards appearance; the load-bearing
  assertions must check behavior and state.

## Definition of Done

A change to tests is done only when every statement below is true.

- The relevant layer(s) were identified before writing tests (Step 1).
- Positive, negative, and edge/boundary cases are present for every applicable class.
- The component state matrix (disabled, loading, error, empty, success) is covered, with
  Storybook stories for every state on new or enhanced components.
- Every skipped scenario class has a concrete `Not applicable: <reason>` justification.
- Bug fixes include a regression test that fails before the fix and passes after it.
- Assertions check user-facing behavior and state, not implementation details or snapshots
  alone, and keyboard, focus, and accessibility-visible behavior are asserted where the UI
  changed.
- The relevant test commands above were run and passed, including `make lint`.
- Commits follow Conventional Commits.
