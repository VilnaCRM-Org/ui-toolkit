# Story 4.3: Add `no-uppercase-paths` + kebab-case naming rules and verify a clean gate

Status: draft

## Story

As a maintainer,
I want the `no-uppercase-paths` rule and kebab-case naming rules for component and test
dirs/files added to `.dependency-cruiser.js` and the gate verified clean against the migrated
tree,
so that the kebab-case naming convention is enforced under zero tolerance with no violations on
the enabling run.

## Acceptance Criteria

1. This story is sequenced AFTER Stories 4.1 and 4.2: the `src/components/**` PascalCase
   dirs/files and the camelCase `tests/**` spec/test files have already been renamed to lowercase
   kebab-case (via `git mv`) before the naming rules are turned on, so the zero-tolerance gate can
   pass on the enabling run.
2. The `forbidden` set contains a `no-uppercase-paths` rule (severity `error`), ported from CRM
   line 472, with `from.path: '.*[A-Z].*'` and `to: {}`, scoped to the governed `src/` + `tests/`
   graph, forbidding any uppercase character in governed source/test paths.
3. The `forbidden` set contains a `component-name-kebab-case` rule (severity `error`) — CRM
   `src-*-name-kebab-case` parity, adapted to this library's `src/components/` layout — forbidding
   any non-kebab-case component directory or file name under `src/components/` (e.g. a reintroduced
   `UiNew/` or `CardContent.tsx`).
4. The `forbidden` set contains a `test-name-kebab-case` rule (severity `error`) — CRM
   `tests-*-name-lowercase` parity, adapted to this repository's `tests/{unit,integration,e2e,
visual}/` layout — forbidding any non-kebab-case test directory or file name under `tests/`
   (e.g. a reintroduced `AuthSkeleton.test.tsx` or `backToMain.spec.ts`).
5. Running `make lint-dep-cruiser` against the post-migration tree evaluates the naming rules
   across the governed `src/` and `tests/` paths, reports ZERO `no-uppercase-paths` /
   kebab-case naming violations, and exits `0` with no naming-related output.
6. React component EXPORT identifiers remain PascalCase (e.g. `export const UiButton`); only the
   file and directory PATHS are kebab-case — the naming rules target paths, never exported
   identifiers, so the published component API is unchanged.
7. Reintroducing a PascalCase path (for example a `src/components/UiNew/` dir) causes
   `make lint-dep-cruiser` to fail with a non-zero exit and the `text` reporter names the
   offending path and the violated naming rule; no `depcruise-baseline` file is introduced to
   suppress the finding.

## Tasks / Subtasks

- [ ] Task 1: Confirm the kebab-case migration is complete before enabling the rules (AC: 1)
  - [ ] 1.1 Confirm Story 4.1 renamed every `src/components/**` PascalCase dir/file to kebab-case
        (e.g. `UiButton/` -> `ui-button/`, `UiCardItem/ServicesHoverCard/` ->
        `ui-card-item/services-hover-card/`, `CardContent.tsx` -> `card-content.tsx`,
        `UiFooter.tsx` -> `ui-footer.tsx`) with barrels and imports updated.
  - [ ] 1.2 Confirm Story 4.2 renamed every camelCase/PascalCase `tests/**` spec/test file to
        kebab-case (e.g. `authSkeleton.spec.ts` -> `auth-skeleton.spec.ts`,
        `backToMain.spec.ts` -> `back-to-main.spec.ts`,
        `AuthSkeleton.integration.test.tsx` -> `auth-skeleton.integration.test.tsx`,
        `UiBackToMain.test.tsx` -> `ui-back-to-main.test.tsx`) with any matching
        `*-snapshots/` directories renamed to match.
  - [ ] 1.3 Confirm `make lint-tsc` and the test suites still resolve/compile after the migration
        (the prerequisite green state this story builds the naming gate on top of).

- [ ] Task 2: Add the `no-uppercase-paths` rule to `.dependency-cruiser.js` (AC: 2, 6)
  - [ ] 2.1 In the existing `forbidden` array, add `no-uppercase-paths` (severity `error`) ported
        verbatim in mechanics from CRM line 472: `from: { path: '.*[A-Z].*' }`, `to: {}`. It fires
        on any governed module whose path contains an uppercase letter.
  - [ ] 2.2 Confirm the rule operates on the governed `src/` + `tests/` graph only (the committed
        `options` scope from Epic 1); it must not need an explicit path allowlist once the tree is
        fully lowercased by 4.1/4.2.
  - [ ] 2.3 Carry over CRM's comment intent (all source paths must be lowercase; uppercase in file
        or directory names breaks consistency) so the finding is self-explanatory in `text` output.

- [ ] Task 3: Add the `component-name-kebab-case` rule (AC: 3, 6)
  - [ ] 3.1 Add `component-name-kebab-case` (severity `error`) modelled on CRM
        `src-module-name-kebab-case` / `src-feature-name-kebab-case` (CRM lines 488-516), adapted to
        this library's flat `src/components/` layout. Forbid a non-kebab-case component directory:
        `from: { path: '^src/components/(?![a-z0-9-]+/)[^/]+/' }`, `to: {}`.
  - [ ] 3.2 Ensure it ALSO catches non-kebab-case nested subcomponent dirs (e.g.
        `ui-card-item/ServicesHoverCard/`, `ui-footer/PrivacyPolicy/`) — the `no-uppercase-paths`
        rule already covers any uppercase path, so this rule is the components-scoped kebab-shape
        guard that complements it without double-suppressing.
  - [ ] 3.3 Confirm the rule targets PATHS only and never inspects exported identifiers, so
        `export const UiButton` in `src/components/ui-button/index.tsx` is unaffected.

- [ ] Task 4: Add the `test-name-kebab-case` rule (AC: 4, 6)
  - [ ] 4.1 Add `test-name-kebab-case` (severity `error`) modelled on CRM
        `tests-module-name-lowercase` / `tests-feature-name-lowercase` (CRM lines ~455-487),
        adapted to this repository's `tests/{unit,integration,e2e,visual}/` layout. Forbid a
        non-kebab-case test directory or file:
        `from: { path: '^tests/(?:unit|integration|e2e|visual)/.*[A-Z].*' }`, `to: {}` (or an
        equivalent negative-lookahead per-segment form matching CRM's mechanics).
  - [ ] 4.2 Confirm the scope matches the real test dirs (`tests/unit`, `tests/integration`,
        `tests/integration/components`, `tests/e2e`, `tests/visual`) and does not need to govern
        `tests/bats`, `tests/load`, or `tests/memory-leak` source unless they too are lowercased
        by 4.2.

- [ ] Task 5: Verification (AC: 1-7)
  - [ ] 5.1 Run `make lint-dep-cruiser` against the post-migration `src/` + `tests/` tree and
        confirm it exits `0` with ZERO `no-uppercase-paths`, `component-name-kebab-case`, and
        `test-name-kebab-case` violations (zero-tolerance enabling run; no `depcruise-baseline`
        created).
  - [ ] 5.2 Grep `.dependency-cruiser.js` to confirm `no-uppercase-paths`,
        `component-name-kebab-case`, and `test-name-kebab-case` are each present at `error`
        severity.
  - [ ] 5.3 Temporarily reintroduce a PascalCase path (e.g. `git mv src/components/ui-new`
        ... `src/components/UiNew`, or add a `CardContent.tsx`) and confirm the gate exits non-zero
        with the `text` reporter naming the offending path and the violated naming rule, then
        revert.
  - [ ] 5.4 Confirm no `depcruise-baseline` file exists and that the published export identifiers
        (e.g. `UiButton`, `UiCardItem`) are still PascalCase after the rules are live.

## Dev Notes

### Architecture Decisions (from specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md)

**Naming rules enabled in the Epic 4 slice after the kebab-case migration (Decision 7).** The
three naming rules (`no-uppercase-paths`, `component-name-kebab-case`, `test-name-kebab-case`) are
adopted per stakeholder direction but CANNOT be enabled under zero tolerance against the original
tree — the PascalCase component tree (`UiButton/`, `UiCardItem/ServicesHoverCard/`, PascalCase
files like `CardContent.tsx` / `UiFooter.tsx`) and the camelCase test files
(`authSkeleton.spec.ts`, `backToMain.spec.ts`) would fail every governed file at once. Epic 1
enabled the BASE gate (generic-health, type-split, components-centric boundary rules) on the
current tree with the naming rules OFF. Epic 4 performs the migration in Stories 4.1 (src) and 4.2
(tests), then THIS story turns the three naming rules ON; per Decision 7 the run that enables them
MUST pass with zero naming violations. React export IDENTIFIERS stay PascalCase
(`export const UiButton`); only file/dir PATHS become kebab-case (`ui-button/ui-button.tsx`) —
the rules govern paths, not identifiers, so the public API is unchanged.

**Mechanics ported from CRM (Decision 7 / Decision 3).** `no-uppercase-paths` is CRM line 472
verbatim in mechanics (`from.path: '.*[A-Z].*'`, `to: {}`). The kebab-case naming rules adapt CRM's
`src-module-name-kebab-case` / `src-feature-name-kebab-case` (CRM lines 488-516) and
`tests-module-name-lowercase` / `tests-feature-name-lowercase` (CRM lines ~455-487) negative-
lookahead per-segment form (`(?![a-z0-9-]+/)[^/]+/`) to this library's flat `src/components/` and
`tests/{unit,integration,e2e,visual}/` layout — CRM's bulletproof-react module/feature path
prefixes do not exist here, so the prefixes are dropped and the kebab-shape guard is what carries
over.

**Zero-tolerance, no baseline (Decision 2/6/7).** The naming rules are `error`-severity; no
`depcruise-baseline` may be introduced to suppress their findings. A clean enabling run is the
proof the migration was complete.

### Project Structure Notes

- **File modified:** `.dependency-cruiser.js` (repository root) — this story adds the three naming
  rules into the existing `forbidden` array authored in Story 1.3.
- **No source renames in THIS story:** the `git mv` renames live in Stories 4.1 (`src/components/**`)
  and 4.2 (`tests/**`); this story only enables the rules and verifies a clean gate against the
  already-migrated tree.
- **Real paths the rules govern after 4.1/4.2:** the ~21 component dirs that were PascalCase
  (`src/components/UiButton/` -> `src/components/ui-button/`, `UiCardItem/` -> `ui-card-item/`,
  `AppTheme/` -> `app-theme/`, `AuthSkeleton/` -> `auth-skeleton/`, `Layout/` -> `layout/`,
  `UiColorTheme/`, `UiBreakpoints/`, ...), nested subcomponents
  (`UiCardItem/ServicesHoverCard/ImageItem/` -> `ui-card-item/services-hover-card/image-item/`,
  `UiFooter/PrivacyPolicy/`, `UiFooter/SocialMediaItem/`, `UiFooter/DefaultFooter/`,
  `UiFooter/Mobile/`, `UiFooter/VilnaCRMEmail/`), PascalCase source files
  (`CardContent.tsx`, `CardGrid.tsx`, `CardSwiper.tsx`, `UiCardItem.tsx`, `UiFooter.tsx`,
  `TooltipWrapper.tsx`), and the test files (`tests/unit/UiButton.test.tsx`,
  `tests/integration/components/AuthSkeleton.integration.test.tsx`, `tests/e2e/authSkeleton.spec.ts`,
  `tests/e2e/backToMain.spec.ts`, ...).
- **No new files** are created by this story.

### Testing Approach

This story is policy-authoring; verification is behavioral against the real migrated `src/` +
`tests/` graph rather than a unit test:

- Run `make lint-dep-cruiser` (which invokes `$(BUN_X) depcruise --config .dependency-cruiser.js
src` inside the docker-compose `bun` service) and confirm a clean exit `0` with no
  naming-related `error`-severity output — the zero-tolerance enabling run.
- Inspect `.dependency-cruiser.js` to confirm `no-uppercase-paths`, `component-name-kebab-case`,
  and `test-name-kebab-case` are each present at `error` severity.
- Negative-path: temporarily reintroduce a PascalCase path (a `UiNew/` dir or a `CardContent.tsx`)
  and confirm the gate exits non-zero with the default `text` reporter naming the offending path
  and the violated rule, then revert.

### References

- Architecture:
  `specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md`
  - Decision 7: Kebab-case Path Normalization & Migration (rules adopted, enabled in the Epic 4
    slice after the migration; export identifiers stay PascalCase, paths become kebab-case)
  - Decision 3: Rule Set Design (CRM rule porting; dropped layering rules)
  - Decision 6: Reporting Format (default `text` reporter, no baseline)
- Epics: `specs/dependency-cruiser/planning-artifacts/epics-dependency-cruiser-2026-06-23.md`
  (Epic 4, Story 4.3)
- PRD: `specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md`
  - FR21 (`no-uppercase-paths`, all governed `src/`+`tests/` paths lowercase kebab-case),
    FR22 (component + test dir/file kebab-case naming rules, CRM `src-*-name-kebab-case` parity)
- Previous stories:
  `specs/dependency-cruiser/implementation-artifacts/4-1-normalize-src-components-to-kebab-case.md`,
  `specs/dependency-cruiser/implementation-artifacts/4-2-normalize-tests-paths-to-kebab-case.md`

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
