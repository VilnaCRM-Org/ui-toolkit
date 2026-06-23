# Story 3.1: Contributor documentation for the dependency-cruiser gate

Status: draft

## Story

As a contributor,
I want repository documentation explaining what dependency-cruiser enforces, how it complements
ESLint, how to run it locally, and how to read its output,
so that I can use the graph-hygiene gate as part of my normal workflow without interpreting raw
tool internals.

## Acceptance Criteria

1. `CONTRIBUTING.md` or `README.md` contains a section about the graph-hygiene check that explains
   what `dependency-cruiser` enforces: cycles, orphans, public-API/barrel discipline,
   `src` ↛ `tests`, no production import of stories or dev dependencies, and type-only discipline.
2. The documentation states that the gate complements ESLint by filling the disabled
   `import/no-cycle` gap rather than duplicating the active `import/order` or
   `no-extraneous-dependencies` checks.
3. `make lint-dep-cruiser` is documented as the single command to run the check locally.
4. The documentation references `make lint-dep-cruiser`, not the raw `bun x depcruise` invocation.
5. The documentation states that no additional setup beyond the repository's existing
   docker-compose `bun` workflow is required.
6. The `err` output format is explained: one line per violation naming the offending file and the
   violated rule.
7. Guidance on remediating common violations (cycles, orphans, leaked stories/dev imports) is
   present.
8. IDE/editor integration and visual/graph reporting are explicitly noted as out of scope.
9. The zero-tolerance, no-baseline nature of the gate is stated.

## Tasks / Subtasks

- [ ] Task 1: Add the "Dependency graph hygiene" section describing enforced rules (AC: 1, 9)
  - [ ] 1.1 In `CONTRIBUTING.md`, add a `## Dependency graph hygiene (dependency-cruiser)`
        section near the existing lint/quality-gate guidance.
  - [ ] 1.2 List the enforced boundaries in contributor-facing terms: circular dependencies
        (`no-circular`), orphan modules (`no-orphans`), public-API/barrel discipline
        (`components-public-api`), `src` must not depend on `tests/`
        (`src-not-to-tests` / `not-to-test` / `not-to-spec`), no production import of stories
        (`no-prod-import-of-stories`) or dev dependencies (`not-to-dev-dep`), and type-only
        discipline (`type-files-imported-as-type-only`, `type-files-no-runtime-imports`).
  - [ ] 1.3 State that the gate is zero-tolerance with no `depcruise-baseline` file — every
        violation surfaces on every run and must be fixed, not suppressed.

- [ ] Task 2: Document ESLint complementarity (AC: 2)
  - [ ] 2.1 State that `dependency-cruiser` fills the disabled `import/no-cycle` gap (ESLint's
        `eslint-plugin-import` is active for `import/order` and `no-extraneous-dependencies` but
        does not enable `import/no-cycle` for source), so `no-circular` is a genuine, non-redundant
        addition.
  - [ ] 2.2 State that the gate does NOT duplicate the active ESLint `import/order` or
        `no-extraneous-dependencies` checks; it owns cycle, orphan, boundary, barrel, and
        type-only discipline instead.

- [ ] Task 3: Document the local run command and prerequisites (AC: 3, 4, 5)
  - [ ] 3.1 Document `make lint-dep-cruiser` as the single command to run the check locally.
  - [ ] 3.2 Reference `make lint-dep-cruiser` only — never instruct contributors to call the raw
        `bun x depcruise --config .dependency-cruiser.js src` line directly.
  - [ ] 3.3 State that the check also runs as part of `make lint`
        (`lint: lint-next lint-tsc lint-md format-check lint-test-structure lint-dep-cruiser`).
  - [ ] 3.4 State that no extra setup is required beyond the existing docker-compose `bun`
        workflow (`make start` brings the service up; the target runs inside it via `$(BUN_X)`).

- [ ] Task 4: Explain failure output and remediation (AC: 6, 7)
  - [ ] 4.1 Explain the `err` reporter output: one line per violation naming the offending file
        and the violated rule; a clean run prints nothing and exits `0`.
  - [ ] 4.2 Add remediation guidance for common violations: break circular imports
        (`no-circular`) by extracting shared code or inverting a dependency; wire orphan modules
        into the entry barrel or remove them (`no-orphans`); move `*.stories.tsx` and dev-only
        imports out of production paths (`no-prod-import-of-stories`, `not-to-dev-dep`); import a
        component only through its `index.tsx`/`index.ts` barrel (`components-public-api`).

- [ ] Task 5: Note out-of-scope items (AC: 8)
  - [ ] 5.1 State that IDE/editor integration is out of scope.
  - [ ] 5.2 State that visual/graph reporting (`dot`/`archi` output) is out of scope.

- [ ] Task 6: Mirror the gate into `README.md` quality-gate listing (AC: 1, 3)
  - [ ] 6.1 Add a short entry in `README.md` naming the gate, what it enforces at a glance, and
        the `make lint-dep-cruiser` command, linking to the fuller `CONTRIBUTING.md` section.

- [ ] Task 7: Verification (AC: 1-9)
  - [ ] 7.1 Confirm the `CONTRIBUTING.md` section names every enforced area in AC 1 and the
        zero-tolerance/no-baseline nature (AC 9).
  - [ ] 7.2 Confirm the ESLint complementarity wording (AC 2) is present and accurate.
  - [ ] 7.3 Confirm `make lint-dep-cruiser` is the only documented command and no raw
        `bun x depcruise` line is shown to contributors (AC 3, 4).
  - [ ] 7.4 Confirm the no-extra-setup, `err` format, remediation, and out-of-scope statements
        (AC 5, 6, 7, 8) are present.
  - [ ] 7.5 Run `make lint-md` and confirm the edited docs pass markdownlint.

## Dev Notes

### Architecture Decisions (from specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md)

**Docs are the closing slice, not a code change.** This story modifies only `CONTRIBUTING.md` and
`README.md` — the two `modified` documentation entries in the architecture's Target-state
Repository Change Delta (§Project Structure & Boundaries). The policy, Makefile target, and CI
workflow are delivered by Epics 1 and 2; this story documents the already-wired gate.

**Single invocation path (locked).** Per §Implementation Patterns -> Naming/Process Patterns and
§Enforcement Guidelines, `make lint-dep-cruiser` is the single source of truth for the command,
config path, and scope. Documentation MUST reference the make target, never the raw CLI:

```text
make lint-dep-cruiser
```

The underlying `$(BUN_X) depcruise --config .dependency-cruiser.js src` line (Decision 4) is an
implementation detail and must not be presented to contributors as the way to run the check.

**What to describe as "enforced" (Decision 3 rule set).** The contributor-facing list maps to the
`error`-severity rules: `no-circular`, `no-orphans`, `no-non-package-json`, `not-to-unresolvable`,
`not-to-dev-dep`, `not-to-test`, `not-to-spec`, `type-files-imported-as-type-only`,
`type-files-no-runtime-imports`, `src-not-to-tests`, `no-prod-import-of-stories`, and
`components-public-api`. Advisory `warn`/`info` rules do not fail the gate and need not be
foregrounded.

**ESLint complementarity (NFR4 in Epics; PRD FR19).** `eslint-plugin-import` is active
(`import/order`, `no-extraneous-dependencies`) but `import/no-cycle` is NOT enabled for source, so
`no-circular` is a genuine gap dependency-cruiser fills. The docs must frame the gate as
non-redundant, not as a second copy of existing ESLint checks.

**Failure format (Decision 6).** The default `err` reporter prints one line per violation naming
the offending file and the violated rule, and exits non-zero on any `error` match; a clean run
prints nothing and exits `0`. There is no baseline — zero-tolerance.

**Out of scope (Decision 6, Deferred Decisions).** Visual/graph reporters (`dot`/`archi`) are out
of scope per the PRD; IDE/editor integration is likewise not part of this initiative. The docs
must say so explicitly.

### Project Structure Notes

- **Files to modify:**
  - `/home/dima/Desktop/ui-toolkit/CONTRIBUTING.md` — add the
    `## Dependency graph hygiene (dependency-cruiser)` section (enforced rules, ESLint
    complementarity, local command, `err` output, remediation, out-of-scope, zero-tolerance).
  - `/home/dima/Desktop/ui-toolkit/README.md` — add a short quality-gate entry with the
    `make lint-dep-cruiser` command, linking to the fuller `CONTRIBUTING.md` section.
- **No new files** and **no application source changes** for this story.
- This story assumes Epic 1 (`.dependency-cruiser.js`, `lint-dep-cruiser` target, `lint:` chain)
  and Epic 2 (`.github/workflows/dependency-cruiser.yml`) are already in place; the docs describe
  the existing behavior and must stay consistent with those files.
- Wide tables, if any, must be wrapped in `<!-- markdownlint-disable MD013 -->` /
  `<!-- markdownlint-enable MD013 -->`, matching the planning-artifact convention, so `make
lint-md` stays green.

### Testing Approach

This is a documentation-only story; there are no unit tests to add. Verification is
review-and-lint based (Task 7):

- Manual review confirms each acceptance criterion's content is present and accurate (enforced
  areas, ESLint complementarity, single make command, no raw CLI, no-extra-setup, `err` format,
  remediation, out-of-scope, zero-tolerance/no-baseline).
- `make lint-md` (markdownlint) must pass on the edited `CONTRIBUTING.md` and `README.md`; it runs
  inside the docker-compose `bun` service and is already part of the aggregate `lint` chain.
- The documented command itself is exercised indirectly: a reviewer can run `make lint-dep-cruiser`
  exactly as the docs instruct and confirm the described `err`/clean-exit behavior matches.

### References

- Architecture:
  `specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md`
  - §Core Architectural Decisions — Decision 3 (Rule Set), Decision 4 (Make Target),
    Decision 6 (Reporting Format)
  - §Implementation Patterns & Consistency Rules — Naming/Process Patterns, Enforcement Guidelines
  - §Project Structure & Boundaries — Target-state Repository Change Delta
    (`CONTRIBUTING.md`, `README.md` modified), Requirements-to-Structure Mapping (FR19, FR20)
- Epics: `specs/dependency-cruiser/planning-artifacts/epics-dependency-cruiser-2026-06-23.md`
  (Story 3.1; NFR4 ESLint non-redundancy; Epic 3)
- PRD: `specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md`
  - FR19 (documentation of what the gate enforces + ESLint complementarity),
    FR20 (local `make lint-dep-cruiser` usage + failure interpretation)

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
