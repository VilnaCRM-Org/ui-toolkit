# Story 1.4: make lint-dep-cruiser target, lint-chain registration, and clean baseline run

Status: draft

## Story

As a contributor,
I want a make lint-dep-cruiser target that cruises the governed src/ graph and is wired into the aggregate make lint flow,
so that I can run the same committed policy locally and see a clean pass before marking a pull request ready for review.

## Acceptance Criteria

1. The `Makefile` defines a `lint-dep-cruiser` target whose recipe runs
   `$(BUN_X) depcruise --config .dependency-cruiser.js src`.
2. `lint-dep-cruiser` is listed in the `.PHONY` declaration.
3. The aggregate target reads exactly
   `lint: lint-next lint-tsc lint-md format-check lint-test-structure lint-dep-cruiser`.
4. Running `make lint-dep-cruiser` evaluates the full governed `src/` graph rooted at
   `src/index.ts`.
5. Any pre-existing `src/` violations are remediated in the same slice; no `depcruise-baseline`
   file is introduced. Before the run is considered clean, the `not-to-dev-dep` rule is confirmed
   scoped to truly dev-only modules so the dev+peer runtime libraries (`@mui/material`, `react`,
   etc.) do not produce false dev-dep violations.
6. A clean run prints no violations and exits `0`.
7. When one or more `src/` modules violate an `error`-severity rule, the `err` reporter prints
   one line per violation naming the offending file and the violated rule.
8. On any `error`-severity violation, `make lint-dep-cruiser` exits non-zero.
9. When `make lint` is invoked, `lint-dep-cruiser` runs as part of the chain against the same
   committed policy and `src` scope.

## Tasks / Subtasks

- [ ] Task 1: Add the `lint-dep-cruiser` Makefile target (AC: 1, 4)
  - [ ] 1.1 Add a `lint-dep-cruiser` target with the help comment
        `## Run dependency-cruiser graph-hygiene gate inside the docker container.`
  - [ ] 1.2 Set the recipe to `$(BUN_X) depcruise --config .dependency-cruiser.js src` so the
        cruise roots at `src/index.ts` inside the docker-compose `bun` service
  - [ ] 1.3 Confirm `$(BUN_X)` resolves to `docker compose run --rm bun bun x` via the existing
        `RUN_BUN_SH` / `BUN` / `BUN_X` variable chain (no new variables)

- [ ] Task 2: Register the target in `.PHONY` (AC: 2)
  - [ ] 2.1 Append `lint-dep-cruiser` to the `.PHONY` line (Makefile line ~20) alongside
        `lint-next lint-tsc lint-md format-check lint-test-structure`

- [ ] Task 3: Wire `lint-dep-cruiser` into the aggregate `lint` chain (AC: 3, 9)
  - [ ] 3.1 Change the `lint:` target (Makefile line ~48) from
        `lint: lint-next lint-tsc lint-md format-check lint-test-structure`
        to `lint: lint-next lint-tsc lint-md format-check lint-test-structure lint-dep-cruiser`
  - [ ] 3.2 Keep `lint-dep-cruiser` last so graph hygiene runs after the existing checks

- [ ] Task 4: Achieve a clean zero-tolerance baseline run (AC: 5, 6)
  - [ ] 4.1 Run `make lint-dep-cruiser` against current `main` and capture all reported
        violations
  - [ ] 4.2 Remediate every `error`-severity violation in source within this slice (refactor the
        offending `src/` modules — e.g. break a cycle, remove an orphan, fix a barrel/public-API
        or type-only breach); do NOT add or generate a `depcruise-baseline` file. If
        `not-to-dev-dep` reports the dev+peer runtime libraries (`@mui/material`, `react`, etc.),
        that is a rule-scoping bug in `.dependency-cruiser.js` (Story 1.3), NOT a source defect —
        fix the rule scope (exclude `npm-peer`) rather than touching source
  - [ ] 4.3 Confirm no `depcruise-baseline.json` exists anywhere in the repo and none is committed
  - [ ] 4.4 Re-run `make lint-dep-cruiser` and confirm it prints no violations and exits `0`

- [ ] Task 5: Confirm failure behavior and reporter output (AC: 7, 8)
  - [ ] 5.1 Verify (e.g. with a scratch fixture reverted afterward) that an introduced
        `error`-severity violation makes the `err` reporter print one line per violation naming
        the offending file and the violated rule
  - [ ] 5.2 Confirm the target exits non-zero on that violation and that the scratch fixture is
        fully reverted so the committed tree stays clean

- [ ] Task 6: Verification (AC: 1-9)
  - [ ] 6.1 `grep -n 'lint-dep-cruiser' Makefile` shows the target recipe, the `.PHONY` entry,
        and the `lint:` chain entry
  - [ ] 6.2 Confirm the `lint:` line reads exactly
        `lint: lint-next lint-tsc lint-md format-check lint-test-structure lint-dep-cruiser`
  - [ ] 6.3 Run `make lint-dep-cruiser` and confirm a clean exit `0`
  - [ ] 6.4 Run `make lint` and confirm `lint-dep-cruiser` executes as part of the chain with the
        same committed policy and `src` scope

## Dev Notes

### Architecture Decisions (from specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md)

**Make Target Design (Decision 4).** The target name is locked to `lint-dep-cruiser` (exactly —
not `lint-deps`, not `lint-dependency-cruiser`). The recipe is:

```makefile
lint-dep-cruiser: ## Run dependency-cruiser graph-hygiene gate inside the docker container.
    $(BUN_X) depcruise --config .dependency-cruiser.js src
```

`$(BUN_X)` (= `docker compose run --rm bun bun x`) keeps the gate consistent with every other lint
target and inside the same `bun` service — there are no `package.json` scripts, so the Makefile is
the single entry point. Pointing the cruise at `src` roots the graph in the governed scope, and
`src/index.ts` is the entry the policy resolves from.

**Lint-chain integration (Decision 4).** Register the target in `.PHONY` and append it to the
aggregate chain so a full local `make lint` exercises the gate and CI invokes the same target:

```makefile
lint: lint-next lint-tsc lint-md format-check lint-test-structure lint-dep-cruiser
```

**Reporting Format (Decision 6).** The default `err` reporter prints one line per violation naming
the offending file and the violated rule, and exits non-zero on any `error`-severity match. A
clean run prints no violations and exits zero. Visual/graph reporters (`dot`/`archi`) are out of
scope.

**Zero-tolerance baseline (Decision 6 / Decision Impact step 5).** There is no `depcruise-baseline`
file; every violation surfaces on every run. Pre-existing violations against current `main` must be
resolved in this same slice rather than recorded into a baseline.

**Dev+peer overlap is the dominant first-run consideration (Gap Analysis).** This published
library mirrors its runtime libraries into both `devDependencies` and `peerDependencies` (only
`swiper` is a true `dependency`). If `not-to-dev-dep` is not scoped to truly dev-only modules
(`npm-dev` AND not `npm-peer`, authored in Story 1.3), the clean-baseline run will surface 100+
false dev-dep violations on `@mui/material`/`react`/etc. The fix is rule scoping, not source
remediation; confirm a zero count for these libraries before declaring the baseline clean.

**Governed scope (Structure Patterns).** Analyzed: `src` (graph rooted at `src/index.ts`).
The `tests/` tree is NOT analyzed as source; it is enforced as a forbidden target of `src/` via the
`src-not-to-tests` / `not-to-test` rules in the committed policy. Excluded/not-followed dirs
(`node_modules`, `build`, `.next`, `storybook-static`, `coverage`, `.stryker-tmp`,
`playwright-report`, `test-results`, `reports`, `.lighthouseci`, `.qlty`) are handled by the policy
options, so the recipe passes only `src`.

### Project Structure Notes

- **Files to modify:** `Makefile` (three edits: new `lint-dep-cruiser` target, `.PHONY` entry,
  `lint:` chain).
- **Depends on (from earlier Epic 1 stories, must already exist):** `.dependency-cruiser.js` at
  the repository root and `dependency-cruiser@^17.3.7` as a devDependency in `package.json` with a
  refreshed `bun.lock`.
- **Possible source edits:** whichever `src/` modules carry pre-existing `error`-severity
  violations get refactored under Task 4 (file list determined at implementation time).
- **No new file:** explicitly no `depcruise-baseline.json`.
- Makefile reference points: `.PHONY` at line ~20, `lint:` aggregate at line ~48; the existing
  `BUN_X` variable chain (`RUN_BUN_SH` → `BUN` → `BUN_X`) is reused unchanged.

### Testing Approach

This story is Makefile wiring plus a clean-baseline remediation; verification is command-based,
run inside the docker-compose `bun` service (`make start` first per project conventions):

- `make lint-dep-cruiser` exits `0` with no violations on the remediated tree (AC 6).
- A deliberately introduced `error`-severity violation produces one `err` line per violation
  (file + rule) and a non-zero exit, then is reverted (AC 7, 8).
- `make lint` runs the full chain including `lint-dep-cruiser` against the same policy and scope
  (AC 9).
- `grep` assertions confirm the recipe, `.PHONY` entry, and the exact `lint:` chain string
  (AC 1, 2, 3). The CI workflow (`.github/workflows/dependency-cruiser.yml`, Story 2.1) calls the
  same `make lint-dep-cruiser`, so no thresholds/scope are duplicated in YAML.

### References

- Architecture:
  `specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md`
  - §Core Architectural Decisions — Decision 4 (Make Target Design), Decision 6 (Reporting Format)
  - §Decision Impact Analysis (Implementation Sequence steps 3-5)
  - §Implementation Patterns & Consistency Rules — Naming Patterns, Structure Patterns
    (Governed Scope)
- Epics: `specs/dependency-cruiser/planning-artifacts/epics-dependency-cruiser-2026-06-23.md`
  (Story 1.4)
- PRD: `specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md`
  - FR13, FR14, FR15, FR8, FR12

## Dev Agent Record

### Agent Model Used

_Pending implementation._

### Debug Log References

_Pending implementation._

### Completion Notes List

_Pending implementation._

### File List

_Pending implementation._

### Change Log

_Pending implementation._
