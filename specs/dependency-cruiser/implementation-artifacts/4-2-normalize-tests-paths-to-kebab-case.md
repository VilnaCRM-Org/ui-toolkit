# Story 4.2: Normalize `tests/` paths to kebab-case

Status: draft

## Story

As a maintainer,
I want the camelCase/PascalCase test files and directories under `tests/` renamed to lowercase
kebab-case with all Playwright/Jest references and internal imports updated,
so that the test tree satisfies the same kebab-case naming convention as the source tree ahead of
turning the `no-uppercase-paths` and kebab naming rules on in Story 4.3.

## Acceptance Criteria

1. Every camelCase/PascalCase spec and test FILE under `tests/` is renamed to lowercase kebab-case,
   preserving the `.spec.*` / `.test.*` / extension suffix — e.g. `authSkeleton.spec.ts` ->
   `auth-skeleton.spec.ts`, `backToMain.spec.ts` -> `back-to-main.spec.ts`,
   `UiBackToMain.test.tsx` -> `ui-back-to-main.test.tsx`,
   `AuthSkeleton.integration.test.tsx` -> `auth-skeleton.integration.test.tsx`,
   `localizationGenerator.spec.js` -> `localization-generator.spec.js`.
2. Every camelCase/PascalCase NON-spec helper/fixture/mock file under `tests/` (e.g.
   `runMemlabTests.js`, `ScenarioBuilder.js`, `checkboxToggle.js`, `formFill.js`,
   `tooltipToggle.js`, `styleMock.ts`, `swiperMock.tsx`, `svgMock.ts`) is renamed to lowercase
   kebab-case (`run-memlab-tests.js`, `scenario-builder.js`, `checkbox-toggle.js`, `form-fill.js`,
   `tooltip-toggle.js`, `style-mock.ts`, `swiper-mock.tsx`, `svg-mock.ts`).
3. Any Playwright `*-snapshots/` directory is renamed to track its kebab-case spec name. The two
   existing snapshot dirs (`states.spec.ts-snapshots`, `visual.spec.ts-snapshots`) already track
   lowercase spec names (`states.spec.ts`, `visual.spec.ts`), so they need NO rename in this story;
   this AC is satisfied by confirming there are no `*-snapshots/` dirs bound to a renamed spec.
4. Every rename is performed with `git mv` so file history is preserved (no delete-plus-add).
5. React component EXPORT identifiers are unchanged — only file and directory PATHS become
   kebab-case. The test bodies still import and assert against PascalCase identifiers
   (`UiButton`, `AuthSkeleton`, `ScenarioBuilder` the class), and the `*.stories.tsx` story IDs and
   visual-snapshot PNG basenames (already lowercase, e.g. `uicomponents-uibutton--contained`) are
   unchanged.
6. All references to the renamed paths resolve after the rename: Playwright `testMatch`
   (`**/*.spec.ts`) and Jest `testMatch` globs still match by suffix; the Jest `moduleNameMapper`
   entries in `jest.config.ts` that point at `tests/unit/mocks/styleMock.ts`,
   `tests/unit/mocks/swiperMock.tsx`, and `tests/unit/mocks/svgMock.ts` are updated to the renamed
   mock paths; the internal `require('../utils/ScenarioBuilder')` /
   `require('../memory-leak/utils/ScenarioBuilder')` calls and the memlab runner's dynamic
   `tests/` directory read are updated to the renamed paths.
7. `scripts/check-test-structure.sh` and its Bats coverage (`tests/bats/test_directory_structure.bats`)
   are reviewed: the script enforces only that test files live UNDER `tests/` (it is path-shape
   agnostic and keys off the `*.test.*` / `*.spec.*` suffix, which the renames preserve), so it
   needs no change; any expectation that does reference a renamed path or directory shape is updated.
8. `make test` (or the Jest + Playwright suites) runs green after the renames with the same set of
   tests collected and executed as before; no test is silently dropped by a stale glob or a broken
   import.

## Tasks / Subtasks

- [ ] Task 1: Rename camelCase/PascalCase spec & test files to kebab-case with `git mv` (AC: 1, 4, 5)
  - [ ] 1.1 Rename the `tests/e2e/` specs: `authSkeleton.spec.ts` -> `auth-skeleton.spec.ts`,
        `backToMain.spec.ts` -> `back-to-main.spec.ts`. (The already-lowercase `button.spec.ts`,
        `form.spec.ts`, `layout.spec.ts`, `stories.smoke.spec.ts` need no rename.)
  - [ ] 1.2 Rename the `tests/integration/components/` integration tests:
        `AuthSkeleton.integration.test.tsx` -> `auth-skeleton.integration.test.tsx`,
        `Layout.integration.test.tsx` -> `layout.integration.test.tsx`,
        `UiCardList.integration.test.tsx` -> `ui-card-list.integration.test.tsx`,
        `UiFooter.integration.test.tsx` -> `ui-footer.integration.test.tsx`,
        `UiForm.integration.test.tsx` -> `ui-form.integration.test.tsx`,
        `UiTextFieldForm.integration.test.tsx` -> `ui-text-field-form.integration.test.tsx`.
  - [ ] 1.3 Rename the `tests/unit/` PascalCase `*.test.ts(x)` files (e.g. `AppTheme.test.ts` ->
        `app-theme.test.ts`, `AuthSkeleton.test.tsx` -> `auth-skeleton.test.tsx`,
        `UiBackToMain.test.tsx` -> `ui-back-to-main.test.tsx`,
        `UiCheckBoxStyles.test.tsx` -> `ui-check-box-styles.test.tsx`,
        `ServicesHoverCard.test.tsx` -> `services-hover-card.test.tsx`,
        `PrivacyPolicy.test.tsx` -> `privacy-policy.test.tsx`) and the camelCase ones
        (`componentsIndex.test.ts` -> `components-index.test.ts`).
  - [ ] 1.4 Rename the `tests/unit/config/` files: `jestConfig.test.ts` -> `jest-config.test.ts`,
        `jestDiscovery.test.ts` -> `jest-discovery.test.ts`,
        `storybookConfig.test.ts` -> `storybook-config.test.ts`.
  - [ ] 1.5 Rename the `tests/unit/` `.spec.js` files:
        `localizationGenerator.spec.js` -> `localization-generator.spec.js`,
        `ScenarioBuilder.spec.js` -> `scenario-builder.spec.js`.
  - [ ] 1.6 Use `git mv OLD NEW` for each; confirm `git status` reports renames (R), not
        delete+add. Do NOT touch any `export`/`class`/identifier inside the files — only the PATH
        changes (AC5).

- [ ] Task 2: Rename camelCase/PascalCase helper, fixture & mock files to kebab-case (AC: 2, 4)
  - [ ] 2.1 `git mv` the memory-leak files: `tests/memory-leak/runMemlabTests.js` ->
        `run-memlab-tests.js`, `tests/memory-leak/utils/ScenarioBuilder.js` ->
        `utils/scenario-builder.js`, and the scenarios under `tests/memory-leak/tests/`:
        `checkboxToggle.js` -> `checkbox-toggle.js`, `formFill.js` -> `form-fill.js`,
        `tooltipToggle.js` -> `tooltip-toggle.js`.
  - [ ] 2.2 `git mv` the Jest mocks under `tests/unit/mocks/`: `styleMock.ts` -> `style-mock.ts`,
        `swiperMock.tsx` -> `swiper-mock.tsx`, `svgMock.ts` -> `svg-mock.ts`.
  - [ ] 2.3 Leave already-lowercase helpers untouched (`tests/e2e/constants.ts`,
        `tests/e2e/utils.ts`, `tests/unit/constants.ts`, `tests/unit/utils/render-with-providers.tsx`,
        `tests/visual/stories.json`).

- [ ] Task 3: Confirm no snapshot directory needs a rename (AC: 3)
  - [ ] 3.1 Verify the only `*-snapshots/` dirs are `tests/visual/states.spec.ts-snapshots/` and
        `tests/visual/visual.spec.ts-snapshots/`, both bound to the unchanged lowercase specs
        `states.spec.ts` / `visual.spec.ts`; therefore no snapshot dir is renamed in this story.
  - [ ] 3.2 Confirm the snapshot PNG basenames are already lowercase and are NOT renamed (they are
        derived from Storybook story IDs, not file paths).

- [ ] Task 4: Update Jest references to the renamed paths (AC: 6)
  - [ ] 4.1 In `jest.config.ts`, update the `moduleNameMapper` targets from
        `<rootDir>/tests/unit/mocks/styleMock.ts`, `.../swiperMock.tsx`, `.../svgMock.ts` to the
        kebab-case paths (`style-mock.ts`, `swiper-mock.tsx`, `svg-mock.ts`). Leave the `testMatch`
        globs as-is — they match by `*.test.*` / `*.spec.js` suffix, which the renames preserve.
  - [ ] 4.2 Update the internal `require` of the renamed `ScenarioBuilder` in
        `tests/unit/scenario-builder.spec.js`
        (`require('../memory-leak/utils/scenario-builder')`) and in each renamed memory-leak
        scenario (`tests/memory-leak/tests/*.js` -> `require('../utils/scenario-builder')`).

- [ ] Task 5: Update the memlab runner's dynamic test discovery (AC: 6)
  - [ ] 5.1 In `tests/memory-leak/run-memlab-tests.js`, confirm the `readdir`/`require`-based scan
        of `tests/memory-leak/tests/` still resolves the renamed scenario files
        (`checkbox-toggle.js`, `form-fill.js`, `tooltip-toggle.js`); adjust any hardcoded filename
        list or path literal that referenced the old camelCase names.

- [ ] Task 6: Review the test-structure guard (AC: 7)
  - [ ] 6.1 Read `scripts/check-test-structure.sh` and confirm it keys off the `*.test.*` /
        `*.spec.*` suffix and the `tests/` prune path only (no PascalCase/camelCase path literal),
        so the kebab renames leave it correct without edits.
  - [ ] 6.2 Read `tests/bats/test_directory_structure.bats` and confirm its fixtures
        (e.g. `src/feature/tests/feature.spec.ts`) are not coupled to any renamed real path; update
        only if an expectation references a renamed file.

- [ ] Task 7: Confirm export identifiers and story/snapshot IDs are unchanged (AC: 5)
  - [ ] 7.1 Grep the renamed files to confirm no `export`, `class`, or imported component
        identifier (`UiButton`, `AuthSkeleton`, `ScenarioBuilder`) was lowercased — only PATHS
        changed.
  - [ ] 7.2 Confirm `*.stories.tsx` story IDs (under `src/`) and the visual snapshot PNG basenames
        are untouched, so no visual baseline is invalidated.

- [ ] Task 8: Verification (AC: 1-8)
  - [ ] 8.1 Run `git status` and confirm every changed test path is reported as a rename (R) with
        history preserved; confirm no remaining camelCase/PascalCase path exists under `tests/`
        (e.g. `find tests -type f | grep -E '/[a-z]*[A-Z]|/[A-Z]'` returns nothing for files that
        should be kebab).
  - [ ] 8.2 Run the Jest suite and confirm the SAME number of unit/integration tests is collected
        and all pass (no test silently dropped by a stale `moduleNameMapper` or broken `require`).
  - [ ] 8.3 Run the Playwright e2e + visual suites and confirm the renamed specs are collected by
        `testMatch: ['**/*.spec.ts']` and the visual snapshots still match (no baseline drift).
  - [ ] 8.4 Run the memory-leak runner and confirm it discovers and executes the renamed scenarios.
  - [ ] 8.5 Run `scripts/check-test-structure.sh` and confirm it still reports OK (all test files
        under `tests/`). Do NOT add `no-uppercase-paths` or the kebab naming rules to
        `.dependency-cruiser.js` in this story — that is Story 4.3, sequenced AFTER 4.1 and 4.2.

## Dev Notes

### Architecture Decisions (from specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md)

**Kebab-case path normalization, identifiers stay PascalCase (Decision 7).** The naming rules
(`no-uppercase-paths`, `component-name-kebab-case`, `test-name-kebab-case`) are adopted but CANNOT
be enabled under zero-tolerance against the current tree until the camelCase test files
(`authSkeleton.spec.ts`, `backToMain.spec.ts`) and PascalCase paths are first renamed (via
`git mv`) to lowercase kebab-case. Decision 7 is explicit that React export IDENTIFIERS stay
PascalCase (e.g. `export const UiButton`); only the file and directory PATHS become kebab-case.
This story performs the `tests/` half of that migration.

**Sequencing (Decision 7 / Process Patterns).** Epic 1 enabled the BASE gate on the current tree
with the naming rules OFF. Epic 4 performs the kebab-case migration (Story 4.1 = `src/components/`,
this Story 4.2 = `tests/`) and only THEN, in Story 4.3, turns the three naming rules ON — the
enabling run must pass with zero `no-uppercase-paths` / kebab violations. This story therefore
makes NO change to `.dependency-cruiser.js`; it only renames paths and fixes references so that
Story 4.3 can flip the rules to a clean gate. Story 4.3 is sequenced AFTER both 4.1 and 4.2.

**Scope boundary (Structure Patterns).** The `tests/` tree is NOT analyzed as dependency-cruiser
source — it is enforced only as a forbidden TARGET of `src/` (`src-not-to-tests`). So these renames
do not affect the `src/` graph the gate analyzes; they exist to satisfy the path convention that
Story 4.3's `no-uppercase-paths` rule (scoped to the governed `src/` + `tests/` paths) will check.

### Project Structure Notes

- **Renamed (spec/test files):** `tests/e2e/authSkeleton.spec.ts`,
  `tests/e2e/backToMain.spec.ts`; all six `tests/integration/components/*.integration.test.tsx`;
  the PascalCase/camelCase `tests/unit/*.test.ts(x)` (e.g. `AppTheme.test.ts`,
  `UiBackToMain.test.tsx`, `componentsIndex.test.ts`); `tests/unit/config/*.test.ts`; and the
  `tests/unit/*.spec.js` files (`localizationGenerator.spec.js`, `ScenarioBuilder.spec.js`).
- **Renamed (helpers/mocks):** `tests/memory-leak/runMemlabTests.js`,
  `tests/memory-leak/utils/ScenarioBuilder.js`, `tests/memory-leak/tests/{checkboxToggle,formFill,tooltipToggle}.js`,
  `tests/unit/mocks/{styleMock.ts,swiperMock.tsx,svgMock.ts}`.
- **Edited (references):** `jest.config.ts` (`moduleNameMapper` mock paths);
  `tests/unit/scenario-builder.spec.js` and `tests/memory-leak/tests/*.js`
  (`require('../utils/scenario-builder')`); `tests/memory-leak/run-memlab-tests.js` (dynamic
  scenario discovery).
- **Reviewed, expected NO change:** `scripts/check-test-structure.sh` and
  `tests/bats/test_directory_structure.bats` (suffix- and prune-based, path-shape agnostic);
  `tests/visual/states.spec.ts-snapshots/` and `tests/visual/visual.spec.ts-snapshots/` (bound to
  unchanged lowercase specs); `playwright.config.ts` (`testMatch: ['**/*.spec.ts']` matches by
  suffix); already-lowercase helpers (`tests/e2e/{constants,utils}.ts`, `tests/unit/constants.ts`,
  `tests/unit/utils/render-with-providers.tsx`).
- **NOT touched this story:** `.dependency-cruiser.js` (naming rules added in Story 4.3);
  `src/components/**` (renamed in Story 4.1).

### Testing Approach

This story is a mechanical rename plus reference fix-up; verification is behavioral against the
real suites rather than a new unit test:

- After the `git mv`s, run the Jest suite and confirm the identical set of unit/integration tests
  is collected and passes — a stale `moduleNameMapper` mock path or a broken
  `require('../utils/scenario-builder')` would surface as a module-not-found failure.
- Run the Playwright e2e and visual suites and confirm the renamed specs are still collected by
  `testMatch: ['**/*.spec.ts']` and the visual snapshots match unchanged baselines.
- Run the memory-leak runner and confirm it discovers and executes the renamed scenario files.
- Run `scripts/check-test-structure.sh` and confirm it reports OK.
- Negative confirmation: `find tests -type f` shows no residual camelCase/PascalCase file path
  segments that should have been kebab-cased.

### References

- Architecture:
  `specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md`
  - Decision 7: Kebab-case Path Normalization & Migration (identifiers stay PascalCase; only paths
    change; Epic 4 migration then Story 4.3 enables the rules)
  - Structure Patterns (`tests/` enforced as a forbidden target, not analyzed as source)
  - Process Patterns (naming-rule sequencing — rules enabled only after migration)
- Epics: `specs/dependency-cruiser/planning-artifacts/epics-dependency-cruiser-2026-06-23.md`
  (Story 4.2)
- PRD: `specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md`
  - FR21 (all governed `src/` + `tests/` paths lowercase kebab-case), FR23 (the existing
    PascalCase/camelCase paths migrated via `git mv`)
- Previous story:
  `specs/dependency-cruiser/implementation-artifacts/4-1-normalize-src-components-to-kebab-case.md`

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
