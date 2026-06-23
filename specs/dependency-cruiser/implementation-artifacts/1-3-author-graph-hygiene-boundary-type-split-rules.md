# Story 1.3: Author the graph-hygiene, boundary, and type-split rule set

Status: draft

## Story

As a maintainer,
I want the committed policy to enforce generic-health, components-centric, and type/runtime-split
rules as zero-tolerance `forbidden` rules,
so that cycles, orphans, leaked dev/test/story imports, and type-split violations fail the gate
without any baseline to suppress them.

## Acceptance Criteria

1. The `forbidden` set contains the `error`-severity generic-health rules `no-circular`,
   `no-orphans`, `no-non-package-json`, `not-to-unresolvable`, `not-to-dev-dep`, and `not-to-spec`
   (the `*.spec.*`/`*.test.*` FILE rule). The `tests/` DIRECTORY concern (CRM `not-to-test`) is
   implemented once as the components-centric `src-not-to-tests` rule (AC5), with non-overlapping
   scope so the two never double-report. The `not-to-dev-dep` rule forbids only **truly dev-only** modules using
   `to.dependencyTypes: ['npm-dev']` + `to.dependencyTypesNot: ['npm-peer', 'type-only']` (the
   committed mechanism, NOT a hand-maintained `pathNot` allowlist); because
   `combinedDependencies: true` dual-tags any dev+peer module, every module also declared under
   `peerDependencies` is excluded, so the dev+peer runtime libraries (`@mui/material`, `react`,
   `react-dom`, `react-hook-form`, `@mui/system`, `@emotion/react`, `@emotion/styled`, `i18next`,
   `react-i18next`) are NOT flagged. The gate is run against `main` and confirmed to produce ZERO
   `not-to-dev-dep` hits on those nine modules; `swiper` is the only true `dependency`.
2. The `forbidden` set contains the advisory rules `no-deprecated-core`, `not-to-deprecated`,
   `no-duplicate-dep-types`, `optional-deps-used`, and `peer-deps-used` at `warn`/`info` severity
   so they surface findings but do not fail the gate.
3. The `no-orphans` rule's allowlist is expressed as REGEX CLASSES (not enumerated paths):
   `\.d\.ts$` (covering `src/types/styles.d.ts`, `src/components/Types.d.ts`, AND
   `src/react-app-env.d.ts`), `\.stories\.tsx$`, `fonts\.css`, and
   `^src/(components/)?index\.(ts|tsx)$` (both entry barrels); dotfiles/config are covered by the
   default orphan `pathNot`.
4. The `fonts.css` side-effect import in `src/components/index.ts` does not trigger a `no-orphans`
   violation.
5. The `forbidden` set contains the `error`-severity components-centric rules `src-not-to-tests`,
   `no-prod-import-of-stories`, and `components-public-api`. `src-not-to-tests` owns the `tests/`
   DIRECTORY concern (CRM's `not-to-test`, `from.path: '^src'`, `to.path: '^tests/'`) and is the
   ONLY directory rule — `not-to-spec` (AC1) owns the disjoint spec/test FILE-pattern concern, so
   the two never double-report the same edge. `components-public-api` uses a concrete
   capture-group + negative-lookahead so a component may import its OWN internals but reaching past
   ANOTHER component's `index.ts`/`index.tsx` barrel fails: `from.path: '^src/components/([^/]+)/'`
   and `to.path: '^src/components/(?!\1/)[^/]+/(?!index[.](?:ts|tsx)$).+'`.
6. The `forbidden` set contains the `error`-severity type-split rules
   `type-files-imported-as-type-only` and `type-files-no-runtime-imports`.
7. In THIS story (Epic 1, base gate on the current PascalCase tree) the `no-uppercase-paths` and
   kebab-case naming rules are NOT yet present — they are adopted but enabled only in Epic 4 after
   the kebab-case migration (Decision 7), since they would fail the current tree wholesale. No CRM
   bulletproof-react layering rules (module/feature/repository/store/DI) are present (those stay
   dropped permanently).

## Tasks / Subtasks

- [ ] Task 1: Author the generic-health `error` rules in `.dependency-cruiser.js` (AC: 1)
  - [ ] 1.1 In the existing `forbidden` array of `.dependency-cruiser.js`, add `no-circular`
        (severity `error`) covering any cyclic chain in the `src/` graph.
  - [ ] 1.2 Add `no-non-package-json` (`error`) forbidding imports of npm modules not declared in
        `package.json`.
  - [ ] 1.3 Add `not-to-unresolvable` (`error`) forbidding imports that cannot be resolved on disk.
  - [ ] 1.4 Add `not-to-dev-dep` (`error`) forbidding production `src/` code from importing a
        **truly dev-only** devDependency. Scope `to.dependencyTypes` to `['npm-dev']` and set
        `to.dependencyTypesNot: ['npm-peer', 'type-only']` — this is the COMMITTED mechanism, NOT a
        hand-maintained `pathNot` allowlist. Because `combinedDependencies: true` makes any module
        placed in both `devDependencies` and `peerDependencies` carry BOTH the `npm-dev` and
        `npm-peer` tags, `dependencyTypesNot: ['npm-peer']` spares all nine dual-placed runtime
        libs automatically with no path list to drift. Keep CRM's `node_modules/@types/` `pathNot`
        exception layered under it, and `from.path: '^src'` + `from.pathNot` spec/test exclusion
        (CRM lines 169-189). Verify against `package.json` that the only true `dependencies` entry
        is `swiper` and that `@mui/material`, `react`, `react-dom`, `react-hook-form`,
        `@mui/system`, `@emotion/react`, `@emotion/styled`, `i18next`, and `react-i18next` (all
        dev+peer) are NOT in the forbidden set — otherwise the rule fires on 100+ component imports
        and fails the whole tree on the first zero-tolerance run.
  - [ ] 1.6 After authoring 1.4, run the gate against `main` (`make lint-dep-cruiser`) and confirm
        `not-to-dev-dep` produces ZERO hits on the nine dev+peer runtime libs (`@mui/material`,
        `react`, `react-dom`, `react-hook-form`, `@mui/system`, `@emotion/react`,
        `@emotion/styled`, `i18next`, `react-i18next`), proving the committed
        `dependencyTypesNot: ['npm-peer', 'type-only']` mechanism (NOT a `pathNot` allowlist)
        excludes them; the only true `dependency`, `swiper`, stays out of scope too.
  - [ ] 1.5 Add `not-to-spec` (`error`) forbidding production `src/` imports of `*.spec.*` /
        `*.test.*` FILE patterns (CRM lines 154-167). Give it a DISTINCT, non-overlapping scope
        from `src-not-to-tests` (Task 4.1) so they never double-report the same edge: `not-to-spec`
        owns the spec/test FILE pattern; `src-not-to-tests` owns the `tests/` DIRECTORY. The
        directory concern (CRM's `not-to-test`, lines 138-153) is implemented ONCE as
        `src-not-to-tests` to avoid a duplicate report against `tests/**/*.spec.ts`.

- [ ] Task 2: Author the `no-orphans` rule with the components-library allowlist (AC: 1, 3, 4)
  - [ ] 2.1 Add `no-orphans` (`error`) for modules nothing imports.
  - [ ] 2.2 In its `from.pathNot` allowlist, use REGEX CLASSES rather than enumerated paths:
        `\\.d\\.ts$` (covers `src/types/styles.d.ts`, `src/components/Types.d.ts`, and
        `src/react-app-env.d.ts`), `\\.stories\\.tsx$`, `fonts\\.css`, and
        `^src/(components/)?index\\.(ts|tsx)$` (both entry barrels). Dotfiles/config are covered by
        the default orphan `pathNot`.
  - [ ] 2.3 Confirm the `import './fonts.css'` side-effect import in `src/components/index.ts` is
        not reported as an orphan (it is reached from the barrel, not an orphan itself).

- [ ] Task 3: Author the advisory `warn`/`info` rules (AC: 2)
  - [ ] 3.1 Add `no-deprecated-core` (`warn`) and `not-to-deprecated` (`warn`).
  - [ ] 3.2 Add `no-duplicate-dep-types` (`warn`).
  - [ ] 3.3 Add `optional-deps-used` (`info`) and `peer-deps-used` (`warn`).
  - [ ] 3.4 Verify none of these advisory rules use `error` severity (they must not fail the gate).

- [ ] Task 4: Author the components-centric boundary rules (AC: 5)
  - [ ] 4.1 Add `src-not-to-tests` (`error`) forbidding any `src/` module from depending on the
        repository `tests/` DIRECTORY (`from.path: '^src'`, `to.path: '^tests/'`; CRM `not-to-test`
        lines 138-153). This is the single directory rule; do NOT also add a separate `not-to-test`
        rule (it would double-report with `not-to-spec`/this rule).
  - [ ] 4.2 Add `no-prod-import-of-stories` (`error`) forbidding production `src/` code from
        importing a `*.stories.tsx` file.
  - [ ] 4.3 Add `components-public-api` (`error`) forbidding reaching past a component's public
        entry barrel (`index.tsx` or `index.ts`) into ANOTHER component's internals, while allowing
        a component to import its OWN internals/subcomponents. Model it on CRM's
        `no-repository-internal-imports` negative-lookahead (CRM lines 241-256) with a `\1`
        back-reference so the "different component" scope is precise:

        ```javascript
        {
          name: 'components-public-api',
          severity: 'error',
          from: { path: '^src/components/([^/]+)/' },
          to: { path: '^src/components/(?!\\1/)[^/]+/(?!index[.](?:ts|tsx)$).+' },
        }
        ```

- [ ] Task 5: Author the type/runtime-split rules (AC: 6)
  - [ ] 5.1 Add `type-files-imported-as-type-only` (`error`) forbidding importing a type-only
        module (`*.d.ts`, `types.ts`) as a runtime (value) import.
  - [ ] 5.2 Add `type-files-no-runtime-imports` (`error`) forbidding a type-only module from
        pulling in runtime (value) imports.

- [ ] Task 6: Confirm rule-set boundaries for this Epic-1 slice (AC: 7)
  - [ ] 6.1 Confirm no `no-uppercase-paths` or kebab-case naming rule is present YET — they are
        adopted but enabled only in Epic 4 after the kebab-case migration (Decision 7); on the
        current PascalCase tree they would fail wholesale.
  - [ ] 6.2 Confirm no `no-cross-module-imports`, `no-components-import-modules`,
        repository/store/feature/DI, or `*-allowed-folders` layering rules are present (dropped
        permanently — no such layout exists).

- [ ] Task 7: Verification (AC: 1-7)
  - [ ] 7.1 Run `make lint-dep-cruiser` against the current `src/` graph and confirm it exits `0`
        with no `error`-severity violations (zero-tolerance baseline compliance; no
        `depcruise-baseline` created). In particular confirm `not-to-dev-dep` produces zero
        violations for the dev+peer runtime libraries (`@mui/material`, `react`, etc.) — this is the
        same main-branch confirmation captured in subtask 1.6.
  - [ ] 7.2 Grep `.dependency-cruiser.js` to confirm each required rule name is present at the
        expected severity and that the excluded CRM rule names are absent.
  - [ ] 7.3 Temporarily introduce a circular import or an orphan module and confirm the
        corresponding rule fails with a non-zero exit, then revert.

## Dev Notes

### Architecture Decisions (from specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md)

**Rule set ports generic + type-split, replaces CRM layering (Decision 3).** The policy ports the
CRM generic-health and type-split rules and substitutes CRM's bulletproof-react layering rules
with components-centric boundary rules tuned to this PascalCase component library. All rules live
in the single `forbidden` array; `error` fails the gate, `warn`/`info` are advisory. One CRM rule
— `not-to-dev-dep` — does NOT port verbatim and is re-scoped for this library's dev+peer layout
(see the dev+peer overlap note below).

- **Generic-health `error` rules:** `no-circular`, `no-orphans`, `no-non-package-json`,
  `not-to-unresolvable`, `not-to-dev-dep`, `not-to-test`, `not-to-spec`.
- **Advisory rules:** `no-deprecated-core` (warn), `not-to-deprecated` (warn),
  `no-duplicate-dep-types` (warn), `optional-deps-used` (info), `peer-deps-used` (warn).
- **Components-centric `error` rules:** `src-not-to-tests`, `no-prod-import-of-stories`,
  `components-public-api`.
- **Type-split `error` rules:** `type-files-imported-as-type-only`,
  `type-files-no-runtime-imports`.

**Dev+peer dependency overlap — `not-to-dev-dep` cannot port verbatim (Decision 3 / Gap Analysis).**
This published library declares its runtime libraries under BOTH `devDependencies` AND
`peerDependencies`; the ONLY pure `dependency` is `swiper`. A verbatim CRM `not-to-dev-dep`
(`src` ↛ `npm-dev`) would resolve `@mui/material` (~51 `src/` imports), `react` (~46),
`react-hook-form`, `i18next`, `react-i18next`, `@mui/system`, and `@emotion/react` as `npm-dev`
and fail the entire tree on the first zero-tolerance run. This is the dominant first-run
consideration — larger than cycles/orphans. The rule MUST forbid only truly dev-only modules
(`npm-dev` AND not `npm-peer`), allowlisting every dev+peer module. This preserves the genuine
value (catching `src/` leaks of build/test tooling like `jest`, `storybook`, `webpack`, `eslint`).

**`no-orphans` allowlist correctness (Gap Analysis).** Because the gate is zero-tolerance, the
allowlist is expressed as regex CLASSES so it does not drift: `^src/(components/)?index\.(ts|tsx)$`
(both entry barrels), `fonts\.css` (side-effect import), `\.d\.ts$` (covers
`src/types/styles.d.ts`, `src/components/Types.d.ts`, and `src/react-app-env.d.ts`), and
`\.stories\.tsx$` (all 21 stories); dotfiles/config use the default `pathNot`. Otherwise the first
run fails the tree.

**Naming rules deferred to Epic 4, layering rules dropped (Decision 3/7 / Process Patterns).** The
`no-uppercase-paths` and kebab-case naming rules ARE adopted but are enabled only in the Epic 4
slice AFTER the kebab-case migration — do not add them in THIS story; the current PascalCase tree
(`UiButton/`, `UiCardItem/ServicesHoverCard/`) would fail them wholesale. Never port the
module/feature/repository/store/DI layering rules (dropped permanently):
`src/{hooks,lib,providers,routes,stores,utils}` are empty placeholders, so those rules would match
nothing or misfire.

**Entry-file inconsistency (Gap Analysis — Minor).** Component entry files are inconsistently
`index.tsx` or `index.ts`; the `components-public-api` and `no-orphans` rules must treat both as
the public barrel.

**Zero-tolerance (Decision 2/6).** The `error`-severity boundary rules authored here are the
mechanism that enforces zero tolerance; no `depcruise-baseline` may be introduced to suppress
their findings.

### Project Structure Notes

- **File modified:** `.dependency-cruiser.js` (repository root) — this story adds the entire
  `forbidden` rule set into the policy whose `options` block and scope were committed in Story 1.2.
- **No new files** are created by this story. The `make lint-dep-cruiser` target, `.PHONY`
  registration, and aggregate `lint:` chain wiring are Story 1.4; the CI workflow is Epic 2.
- **Allowlist anchors that must exist as authored:** `src/index.ts`, `src/components/index.ts`,
  `src/types/styles.d.ts`, `src/components/Types.d.ts`, and the 21 `src/**/ *.stories.tsx` files
  (all verified present in the repository).

### Testing Approach

This story is policy-authoring; verification is behavioral against the real `src/` graph rather
than a unit test:

- Run `make lint-dep-cruiser` (which invokes `$(BUN_X) depcruise --config .dependency-cruiser.js
src` inside the docker-compose `bun` service) and confirm a clean exit `0` with no
  `error`-severity output on the current graph — the zero-tolerance baseline-compliance check.
- Inspect `.dependency-cruiser.js` to confirm each required rule name and severity is present and
  that the excluded CRM rule names are absent.
- Negative-path: introduce a temporary circular import / orphan module and confirm the gate exits
  non-zero with the default `text` reporter naming the offending file and the violated rule, then
  revert.

### References

- Architecture:
  `specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md`
  - Decision 2: Config File Design (options the rules depend on — `tsPreCompilationDeps`,
    `tsConfig.fileName`)
  - Decision 3: Rule Set Design (the full rule table, severities, and dropped CRM rules)
  - Decision 6: Reporting Format (default `text` reporter, no baseline)
  - Implementation Patterns & Consistency Rules: Format Patterns, Process Patterns,
    Enforcement Guidelines, Anti-Patterns
  - Gap Analysis Results: `no-orphans` allowlist correctness, entry-file inconsistency
- Epics: `specs/dependency-cruiser/planning-artifacts/epics-dependency-cruiser-2026-06-23.md`
  (Story 1.3)
- PRD: `specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md`
  - FR5 (generic dependency-health rules), FR6 (components-centric boundary rules),
    FR7 (type/runtime-split discipline), FR8 (zero-tolerance, no `depcruise-baseline`)
- Previous story:
  `specs/dependency-cruiser/implementation-artifacts/1-2-commit-dependency-cruiser-policy-scope-and-alias.md`

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
