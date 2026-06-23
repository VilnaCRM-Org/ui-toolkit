# Story 4.1: Normalize `src/components/` to kebab-case

Status: draft

## Story

As a maintainer,
I want every PascalCase component directory and source file under `src/components/` renamed to
lowercase kebab-case with all references updated,
so that the governed source tree satisfies the kebab-case naming convention without changing the
published component API.

## Acceptance Criteria

1. Every top-level PascalCase component directory under `src/components/` is renamed to lowercase
   kebab-case: `AppTheme` -> `app-theme`, `AuthSkeleton` -> `auth-skeleton`, `Layout` ->
   `layout`, `UiBackToMain` -> `ui-back-to-main`, `UiBreakpoints` -> `ui-breakpoints`,
   `UiButton` -> `ui-button`, `UiCardItem` -> `ui-card-item`, `UiCardList` -> `ui-card-list`,
   `UiCheckbox` -> `ui-checkbox`, `UiColorTheme` -> `ui-color-theme`, `UiContainer` ->
   `ui-container`, `UiFooter` -> `ui-footer`, `UiForm` -> `ui-form`, `UiImage` -> `ui-image`,
   `UiInput` -> `ui-input`, `UiLink` -> `ui-link`, `UiSkeletonBlock` -> `ui-skeleton-block`,
   `UiSkeletonButton` -> `ui-skeleton-button`, `UiSkeletonInput` -> `ui-skeleton-input`,
   `UiSkeletons` -> `ui-skeletons`, `UiSkeletonText` -> `ui-skeleton-text`, `UiTextFieldForm` ->
   `ui-text-field-form`, `UiToolbar` -> `ui-toolbar`, `UiTooltip` -> `ui-tooltip`,
   `UiTypography` -> `ui-typography`.

2. Every nested subcomponent directory is renamed to kebab-case:
   `UiCardItem/ServicesHoverCard` -> `ui-card-item/services-hover-card`,
   `UiCardItem/ServicesHoverCard/ImageItem` -> `ui-card-item/services-hover-card/image-item`,
   `UiFooter/DefaultFooter` -> `ui-footer/default-footer`, `UiFooter/Mobile` ->
   `ui-footer/mobile`, `UiFooter/PrivacyPolicy` -> `ui-footer/privacy-policy`,
   `UiFooter/SocialMediaItem` -> `ui-footer/social-media-item`, `UiFooter/VilnaCRMEmail` ->
   `ui-footer/vilna-crm-email`.

3. Every PascalCase source file under `src/components/` is renamed to kebab-case, including
   `Types.d.ts` -> `types.d.ts`, `CardContent.tsx` -> `card-content.tsx`, `CardGrid.tsx` ->
   `card-grid.tsx`, `CardSwiper.tsx` -> `card-swiper.tsx`, `UiCardItem.tsx` (in `ui-card-list/`)
   -> `ui-card-item.tsx`, `sharedCardStyles.ts` -> `shared-card-styles.ts`, `UiFooter.tsx` ->
   `ui-footer.tsx`, `DefaultFooter.tsx` -> `default-footer.tsx`, `Mobile.tsx` -> `mobile.tsx`,
   `PrivacyPolicy.tsx` -> `privacy-policy.tsx`, `SocialMediaItem.tsx` -> `social-media-item.tsx`,
   `VilnaCRMEmail.tsx` -> `vilna-crm-email.tsx`, `ServicesHoverCard.tsx` ->
   `services-hover-card.tsx`, `ImageItem.tsx` -> `image-item.tsx`, `TooltipWrapper.tsx` ->
   `tooltip-wrapper.tsx`, `form-provider-bridge.tsx` (already kebab-case, unchanged), and every
   `*.stories.tsx` file (e.g. `Button.stories.tsx` -> `button.stories.tsx`,
   `CardItem.stories.tsx` -> `card-item.stories.tsx`). The entry barrels `index.ts` / `index.tsx`
   already lowercase remain unchanged.

4. Every rename is performed with `git mv` so that file history is preserved (verifiable via
   `git log --follow` on a renamed path).

5. The exported React component identifiers stay PascalCase (e.g. `export const UiButton`,
   `export { default as UiFooter }`); only the FILE and DIRECTORY paths change. No exported name
   is altered, so the published component API and every consumer import are unchanged.

6. `src/index.ts` and `src/components/index.ts` barrel re-exports point at the renamed kebab-case
   paths (e.g. `export { default as UiButton } from './ui-button'`), and the
   `import './fonts.css'` side-effect import in `src/components/index.ts` is unchanged
   (`fonts.css` is already lowercase).

7. All `@/` aliased and relative imports across `src/` resolve to the renamed paths, every
   `*.stories.tsx` import path is updated, and the import paths used by the unit, integration,
   e2e, and visual tests (e.g. `tests/unit/UiCardItem.test.tsx`'s
   `../../src/components/UiCardItem/CardContent`) resolve to the renamed kebab-case paths.

8. `make lint-tsc` and the test suites confirm the barrels, imports, stories, and tests still
   resolve and compile after the rename. No `no-uppercase-paths` or kebab-case naming rule is
   added in THIS story — those are added and verified in Story 4.3 (sequenced after 4.1 and 4.2).

## Tasks / Subtasks

- [ ] Task 1: Rename top-level component directories to kebab-case (AC: 1, 4)
  - [ ] 1.1 Use `git mv` for each of the 25 top-level dirs under `src/components/`
        (`AppTheme` -> `app-theme`, `AuthSkeleton` -> `auth-skeleton`, `Layout` -> `layout`,
        `UiBackToMain` -> `ui-back-to-main`, ... through `UiTypography` -> `ui-typography`; full
        mapping in AC1). On case-insensitive filesystems, rename via an intermediate name
        (`UiButton` -> `UiButton.tmp` -> `ui-button`) so `git mv` records the change.
  - [ ] 1.2 Do NOT touch `src/components/index.ts`, `src/components/fonts.css`, or
        `src/components/Types.d.ts` in this task (the barrel content is Task 4; `Types.d.ts` is
        Task 3).

- [ ] Task 2: Rename nested subcomponent directories to kebab-case (AC: 2, 4)
  - [ ] 2.1 `git mv` `ui-card-item/ServicesHoverCard` -> `ui-card-item/services-hover-card` and
        its child `services-hover-card/ImageItem` -> `services-hover-card/image-item`.
  - [ ] 2.2 `git mv` the `ui-footer/` children: `DefaultFooter` -> `default-footer`, `Mobile` ->
        `mobile`, `PrivacyPolicy` -> `privacy-policy`, `SocialMediaItem` -> `social-media-item`,
        `VilnaCRMEmail` -> `vilna-crm-email`.

- [ ] Task 3: Rename PascalCase source and story files to kebab-case (AC: 3, 4)
  - [ ] 3.1 `git mv` the component implementation/helper files listed in AC3 (`CardContent.tsx`,
        `CardGrid.tsx`, `CardSwiper.tsx`, `UiCardItem.tsx` in `ui-card-list/`,
        `sharedCardStyles.ts`, `UiFooter.tsx`, `DefaultFooter.tsx`, `Mobile.tsx`,
        `PrivacyPolicy.tsx`, `SocialMediaItem.tsx`, `VilnaCRMEmail.tsx`, `ServicesHoverCard.tsx`,
        `ImageItem.tsx`, `TooltipWrapper.tsx`).
  - [ ] 3.2 `git mv` `src/components/Types.d.ts` -> `src/components/types.d.ts`.
  - [ ] 3.3 `git mv` every `*.stories.tsx` file to kebab-case (`AuthSkeleton.stories.tsx` ->
        `auth-skeleton.stories.tsx`, `Layout.stories.tsx` -> `layout.stories.tsx`,
        `BackToMain.stories.tsx` -> `back-to-main.stories.tsx`, `Button.stories.tsx` ->
        `button.stories.tsx`, `CardItem.stories.tsx` -> `card-item.stories.tsx`,
        `CardList.stories.tsx` -> `card-list.stories.tsx`, `Checkbox.stories.tsx`,
        `Container.stories.tsx`, `Footer.stories.tsx`, `Form.stories.tsx`, `Image.stories.tsx`,
        `Input.stories.tsx`, `Link.stories.tsx`, `SkeletonBlock.stories.tsx`,
        `SkeletonButton.stories.tsx`, `SkeletonInput.stories.tsx`, `SkeletonText.stories.tsx`,
        `TextFieldForm.stories.tsx`, `Toolbar.stories.tsx`, `Tooltip.stories.tsx`,
        `Typography.stories.tsx`).
  - [ ] 3.4 Confirm `form-provider-bridge.tsx` and the `index.ts`/`index.tsx` barrels are already
        lowercase and are NOT renamed; confirm `src/components/fonts.css` is unchanged.

- [ ] Task 4: Update the entry barrels (AC: 5, 6)
  - [ ] 4.1 In `src/components/index.ts`, repoint every `export { default as ... } from './X'` and
        named re-export to the kebab-case dir (e.g. `from './ui-button'`, `from './ui-footer'`,
        `from './ui-color-theme'`, `from './ui-breakpoints'`, `from './layout'`,
        `from './auth-skeleton'`). Keep the exported IDENTIFIERS PascalCase and unchanged
        (`UiButton`, `Layout`, `crmColorTheme`, `crmBreakpointValues`, ...).
  - [ ] 4.2 Confirm `src/index.ts` still re-exports `./components` (unchanged — the barrel path is
        already lowercase) and that `import './fonts.css'` in `src/components/index.ts` is intact.

- [ ] Task 5: Update intra-`src/` imports and per-component barrels (AC: 5, 6, 7)
  - [ ] 5.1 Update every relative import inside each renamed component (e.g. `ui-card-item/index.tsx`
        importing `./CardContent` -> `./card-content`, `./constants`, `./styles`, `./types`,
        `./services-hover-card`; `ui-card-list/index.tsx` importing `./CardGrid` -> `./card-grid`,
        `./CardSwiper` -> `./card-swiper`, `./UiCardItem` -> `./ui-card-item`,
        `./sharedCardStyles` -> `./shared-card-styles`; `ui-footer/index.ts` importing
        `./UiFooter` -> `./ui-footer`, and its children `./default-footer`, `./mobile`,
        `./privacy-policy`, `./social-media-item`, `./vilna-crm-email`).
  - [ ] 5.2 Update any `@/` aliased imports that point at a renamed component path; leave
        `@/assets/...` import paths untouched (assets are out of scope for this story — only
        `src/components/` is normalized here).
  - [ ] 5.3 Update any import of `src/components/Types.d.ts` to the new `types.d.ts` path.

- [ ] Task 6: Update story-file import paths (AC: 7)
  - [ ] 6.1 In each renamed `*.stories.tsx`, repoint its relative imports to the kebab-case
        sibling files (e.g. the story's `import ... from '../index'` / `'./CardContent'` targets).

- [ ] Task 7: Update test import paths that reference renamed component paths (AC: 7)
  - [ ] 7.1 Update unit-test imports (e.g. `tests/unit/UiCardItem.test.tsx` ->
        `../../src/components/ui-card-item`, `../../src/components/ui-card-item/card-content`,
        `../../src/components/ui-card-item/constants`).
  - [ ] 7.2 Update integration-test imports (e.g.
        `tests/integration/components/UiFooter.integration.test.tsx` ->
        `../../../src/components/ui-footer`).
  - [ ] 7.3 Update e2e and visual test imports/helpers that reference renamed `src/components/`
        paths (story IDs/titles are unaffected because export names stay PascalCase). Do NOT
        rename the test FILES themselves — `tests/` file/dir renaming is Story 4.2.

- [ ] Task 8: Verification (AC: 5, 6, 7, 8)
  - [ ] 8.1 Run `make lint-tsc` and confirm a clean compile (all barrels, imports, stories, and
        tests resolve to the renamed paths).
  - [ ] 8.2 Run the unit and integration suites (and the e2e/visual suites where feasible) and
        confirm they pass against the renamed paths.
  - [ ] 8.3 Confirm `git log --follow` on a sample renamed path (e.g.
        `src/components/ui-footer/ui-footer.tsx`) shows pre-rename history (proving `git mv` was
        used).
  - [ ] 8.4 Grep the renamed `src/components/` tree to confirm exported identifiers are still
        PascalCase (e.g. `export const UiButton`, `export { default as UiFooter }`) — only PATHS
        changed.
  - [ ] 8.5 Confirm NO naming rule (`no-uppercase-paths`, `component-name-kebab-case`) was added to
        `.dependency-cruiser.js` in this story; that addition and its zero-violation verification
        is Story 4.3, sequenced after 4.1 and 4.2.

## Dev Notes

### Architecture Decisions (from specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md)

**Kebab-case path normalization, identifiers stay PascalCase (Decision 7).** The naming rules
(`no-uppercase-paths`, `component-name-kebab-case`, `test-name-kebab-case`) are adopted per
stakeholder direction but CANNOT be enabled under zero tolerance against the current PascalCase
tree. Decision 7 sequences a one-time `git mv` migration FIRST: the ~25 top-level PascalCase
component dirs, their nested subcomponents (`UiFooter/PrivacyPolicy/`,
`UiCardItem/ServicesHoverCard/`), and PascalCase files (`CardContent.tsx`, `UiFooter.tsx`) are
renamed to lowercase kebab-case, with all barrels, internal `@/` and relative imports, Storybook
`*.stories.tsx`, and tests updated to match. React EXPORT IDENTIFIERS stay PascalCase (e.g.
`export const UiButton`); only the file and directory PATHS become kebab-case
(`ui-button/ui-button.tsx`). This is exactly what FR23 requires, and keeping identifiers PascalCase
preserves the public API and every consumer import.

**Sequencing — this story is the first of the Epic 4 migration (Decision 7).** Epic 1 enabled the
BASE gate (generic-health, type-split, components-centric boundary rules) on the CURRENT tree with
the naming rules OFF. Epic 4 performs the rename (Story 4.1 = `src/components/`, Story 4.2 =
`tests/`) and THEN, in Story 4.3, turns the three naming rules ON and verifies a zero-violation
run. This story performs only the `src/components/` rename and reference updates; it adds NO rule
to `.dependency-cruiser.js`. Splitting the rename into its own epic keeps each slice independently
verifiable.

### Project Structure Notes

- **Files/dirs renamed:** all PascalCase paths under `src/components/` (verified present in the
  real tree). Top-level dirs: `AppTheme`, `AuthSkeleton`, `Layout`, `UiBackToMain`,
  `UiBreakpoints`, `UiButton`, `UiCardItem`, `UiCardList`, `UiCheckbox`, `UiColorTheme`,
  `UiContainer`, `UiFooter`, `UiForm`, `UiImage`, `UiInput`, `UiLink`, `UiSkeletonBlock`,
  `UiSkeletonButton`, `UiSkeletonInput`, `UiSkeletons`, `UiSkeletonText`, `UiTextFieldForm`,
  `UiToolbar`, `UiTooltip`, `UiTypography`. Nested:
  `UiCardItem/ServicesHoverCard/ImageItem`, `UiFooter/{DefaultFooter,Mobile,PrivacyPolicy,
SocialMediaItem,VilnaCRMEmail}`.
- **Files modified (content, not renamed):** `src/index.ts` (barrel re-export of `./components`),
  `src/components/index.ts` (per-component re-exports + `import './fonts.css'`), the per-component
  `index.tsx`/`index.ts` barrels, and the relative imports inside every renamed module.
- **Already lowercase / NOT renamed:** `src/components/index.ts`, `src/components/fonts.css`,
  `src/components/UiForm/form-provider-bridge.tsx`, and the per-component `index.ts`/`index.tsx`
  entry barrels.
- **Out of scope here:** `src/assets/` (its PascalCase `Features/`, `Gemstones/`, `TooltipIcons/`
  dirs and PascalCase SVGs), `src/types/`, and `src/react-app-env.d.ts` are not normalized by this
  story — Story 4.1's subject is `src/components/`. The `tests/` file/dir renames are Story 4.2;
  this story only updates the test import PATHS that point at renamed `src/components/` files.
- **Test references that must be repointed:** unit tests under `tests/unit/` (e.g.
  `UiCardItem.test.tsx` -> `../../src/components/ui-card-item/...`), integration tests under
  `tests/integration/components/` (e.g. `UiFooter.integration.test.tsx` ->
  `../../../src/components/ui-footer`), and any e2e/visual helper that imports from
  `src/components/`.

### Testing Approach

This story is a mechanical rename + reference update; verification is behavioral against the real
graph rather than a new unit test:

- Run `make lint-tsc` and confirm a clean TypeScript compile — this proves every barrel, relative
  import, story import, and test import resolves to the renamed kebab-case paths.
- Run the unit and integration suites (and e2e/visual where feasible) and confirm they pass with
  the repointed import paths; rendered output and story IDs are unchanged because export
  identifiers stay PascalCase.
- Confirm `git log --follow` on a renamed path surfaces pre-rename history, proving `git mv`
  preserved history.
- Grep the renamed tree to confirm exported identifiers remain PascalCase (only PATHS changed).

### References

- Architecture:
  `specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md`
  - Decision 7: Kebab-case Path Normalization & Migration (rename strategy, sequencing,
    identifiers-stay-PascalCase rationale, affected paths)
- Epics: `specs/dependency-cruiser/planning-artifacts/epics-dependency-cruiser-2026-06-23.md`
  (Epic 4, Story 4.1)
- PRD: `specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md`
  - FR21 (lowercase kebab-case governed paths), FR22 (component dir/file kebab-case naming),
    FR23 (normalize the existing PascalCase paths/barrels/imports/stories/tests)
- Next story:
  `specs/dependency-cruiser/implementation-artifacts/` — Story 4.3 (sequenced AFTER 4.1 and 4.2)
  adds `no-uppercase-paths` + the kebab-case naming rule(s) to `.dependency-cruiser.js` and
  verifies the gate passes at ZERO naming violations.

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
