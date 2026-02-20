# UI Kit Full PNG Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all non-implemented UI kit modules and missing state variants identified across `Ui kit.png`, `Ui kit-1.png`, `Ui kit-2.png`, and `Ui kit-3.png`, while reusing CRM skeleton implementation with exact animation parity.

**Architecture:** Use a module-first approach under `src/components` with typed `Ui*` wrappers and consistent MUI-based APIs. Build missing features in vertical slices (test -> minimal implementation -> verify) and keep state parity explicit with a board coverage checklist. For skeletons, copy CRM implementation first and preserve animation system exactly before extending variants.

**Tech Stack:** React 18, TypeScript (strict), MUI v5, Storybook 8, Jest + Testing Library.

## Task 0: Locate and Copy CRM Skeleton Source (Blocker Task)

**Files:**
- Source (CRM): `/home/dima/Desktop/crm/<exact-skeleton-path>`
- Create/Modify (this repo): `src/components/UiSkeleton/**` and related files
- Test: `src/test/testing-library/UiSkeletonParity.test.tsx`

**Step 1: Identify exact CRM source path and branch**

Run in CRM repo:

```bash
git rev-parse --abbrev-ref HEAD
rg --files | rg -i "skeleton"
```

Expected: concrete source files for skeleton implementation and animation styles.

**Step 2: Copy skeleton source into toolkit**

Run (example, adjust once exact path is confirmed):

```bash
cp -R /home/dima/Desktop/crm/src/components/Skeletons/* src/components/UiSkeleton/
```

Expected: baseline skeleton files copied into toolkit.

**Step 3: Write failing parity test**

Create tests asserting copied animation tokens/keyframes/durations are unchanged versus CRM baseline constants.

**Step 4: Run parity test**

Run: `pnpm exec jest src/test/testing-library/UiSkeletonParity.test.tsx --verbose`  
Expected: PASS once copied parity is preserved.

**Step 5: Commit**

```bash
git add src/components/UiSkeleton src/test/testing-library/UiSkeletonParity.test.tsx
git commit -m "feat: copy crm skeleton baseline with animation parity"
```

## Task 1: Add Explicit Board Coverage Checklist

**Files:**
- Create: `docs/plans/2026-02-19-ui-kit-coverage-checklist.md`

**Step 1: Write checklist skeleton**

Create board sections:
1. `Ui kit.png`
2. `Ui kit-1.png`
3. `Ui kit-2.png`
4. `Ui kit-3.png`

With per-section checkboxes for each module/state.

**Step 2: Run manual review pass**

Mark all items as unchecked initially.

**Step 3: Commit**

```bash
git add docs/plans/2026-02-19-ui-kit-coverage-checklist.md
git commit -m "docs: add ui kit png coverage checklist"
```

## Task 2: Lock Export Contract First

**Files:**
- Modify: `src/components/index.ts`
- Create: `src/test/testing-library/UiExportsCoverage.test.tsx`

**Step 1: Write failing export contract test**

Add assertions for all planned modules:
- `UiPagination`
- `UiSearchInput`
- `UiSelectWithSearch`
- `UiMultiSelect`
- `UiCalendarMultiSelect`
- `UiRadioGroup`
- `UiFileUploadInput`
- `UiItemRow`
- `UiItemsList`
- `UiTaskCard`
- `UiProfileSelectCard`
- `UiIntegrationCard`
- `UiFilterChip`
- `UiPinInput`
- `UiPaymentOptionCard`
- `UiActionIconBar`
- `UiStatusBadge`
- `UiNotificationBadge`
- `UiSkeleton`

Also assert existing unexported modules needed by kit are exported.

**Step 2: Run test to verify failure**

Run: `pnpm exec jest src/test/testing-library/UiExportsCoverage.test.tsx --verbose`  
Expected: FAIL with missing exports.

**Step 3: Add temporary export stubs (path-safe scaffolding)**

Create index exports as modules are added.

**Step 4: Re-run test**

Run: `pnpm exec jest src/test/testing-library/UiExportsCoverage.test.tsx --verbose`  
Expected: still FAIL until modules exist (this is expected now).

**Step 5: Commit**

```bash
git add src/components/index.ts src/test/testing-library/UiExportsCoverage.test.tsx
git commit -m "test: add export coverage contract for full ui kit scope"
```

## Task 3: Add State Parity Tests for Existing Core Controls

**Files:**
- Modify: `src/test/testing-library/UiButton.test.tsx`
- Modify: `src/test/testing-library/UiInput.test.tsx`
- Modify: `src/test/testing-library/UiCheckBox.test.tsx`
- Modify: `src/test/testing-library/UiLink.test.tsx`

**Step 1: Write failing tests for missing board states**

Examples:
1. `UiInput` error + disabled combinations.
2. `UiButton` variant/state props used in board scenarios.
3. `UiCheckbox` disabled and checked visual semantics.
4. `UiLink` hover/active class/state behavior if exposed via props/theme.

**Step 2: Run tests**

Run:
```bash
pnpm exec jest src/test/testing-library/UiButton.test.tsx --verbose
pnpm exec jest src/test/testing-library/UiInput.test.tsx --verbose
pnpm exec jest src/test/testing-library/UiCheckBox.test.tsx --verbose
pnpm exec jest src/test/testing-library/UiLink.test.tsx --verbose
```
Expected: at least one FAIL indicating missing parity.

**Step 3: Minimal updates to existing component/theme files**

Likely files:
- `src/components/UiButton/theme.ts`
- `src/components/UiInput/theme.ts`
- `src/components/UiCheckbox/styles.ts`
- `src/components/UiLink/theme.ts`

**Step 4: Re-run tests**

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/UiButton/theme.ts src/components/UiInput/theme.ts src/components/UiCheckbox src/components/UiLink src/test/testing-library/UiButton.test.tsx src/test/testing-library/UiInput.test.tsx src/test/testing-library/UiCheckBox.test.tsx src/test/testing-library/UiLink.test.tsx
git commit -m "feat: align existing control states with ui kit boards"
```

## Task 4: Implement Search and Select Foundation

**Files:**
- Create: `src/components/UiSearchInput/index.tsx`
- Create: `src/components/UiSearchInput/types.ts`
- Create: `src/components/UiSearchInput/SearchInput.stories.tsx`
- Create: `src/components/UiSelectWithSearch/index.tsx`
- Create: `src/components/UiSelectWithSearch/types.ts`
- Create: `src/components/UiSelectWithSearch/SelectWithSearch.stories.tsx`
- Create: `src/test/testing-library/UiSearchInput.test.tsx`
- Create: `src/test/testing-library/UiSelectWithSearch.test.tsx`

**Step 1: Write failing tests**

1. Search input renders icon + value + disabled state.
2. Select-with-search filters options and emits selection callback.

**Step 2: Run failing tests**

Run:
```bash
pnpm exec jest src/test/testing-library/UiSearchInput.test.tsx --verbose
pnpm exec jest src/test/testing-library/UiSelectWithSearch.test.tsx --verbose
```

**Step 3: Minimal implementation**

Build controlled wrappers with `value`, `onChange`, `disabled`, `error`, `placeholder`.

**Step 4: Re-run tests**

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/UiSearchInput src/components/UiSelectWithSearch src/test/testing-library/UiSearchInput.test.tsx src/test/testing-library/UiSelectWithSearch.test.tsx
git commit -m "feat: add search input and select with search modules"
```

## Task 5: Implement Pagination Module

**Files:**
- Create: `src/components/UiPagination/index.tsx`
- Create: `src/components/UiPagination/types.ts`
- Create: `src/components/UiPagination/Pagination.stories.tsx`
- Create: `src/test/testing-library/UiPagination.test.tsx`

**Step 1: Write failing test**

Verify render and page-change callback.

**Step 2: Run failing test**

Run: `pnpm exec jest src/test/testing-library/UiPagination.test.tsx --verbose`

**Step 3: Minimal implementation**

Wrap MUI Pagination with toolkit API.

**Step 4: Re-run test**

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/UiPagination src/test/testing-library/UiPagination.test.tsx
git commit -m "feat: add pagination module"
```

## Task 6: Implement Multiselect Suite

**Files:**
- Create: `src/components/UiMultiSelect/index.tsx`
- Create: `src/components/UiMultiSelect/types.ts`
- Create: `src/components/UiMultiSelect/MultiSelect.stories.tsx`
- Create: `src/components/UiCalendarMultiSelect/index.tsx`
- Create: `src/components/UiCalendarMultiSelect/types.ts`
- Create: `src/components/UiCalendarMultiSelect/CalendarMultiSelect.stories.tsx`
- Create: `src/test/testing-library/UiMultiSelect.test.tsx`
- Create: `src/test/testing-library/UiCalendarMultiSelect.test.tsx`

**Step 1: Write failing tests**

1. MultiSelect chips render after selection.
2. Calendar multi-select emits selected dates/range.

**Step 2: Run failing tests**

Run:
```bash
pnpm exec jest src/test/testing-library/UiMultiSelect.test.tsx --verbose
pnpm exec jest src/test/testing-library/UiCalendarMultiSelect.test.tsx --verbose
```

**Step 3: Minimal implementation**

Implement both modules with controlled props and disabled state.

**Step 4: Re-run tests**

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/UiMultiSelect src/components/UiCalendarMultiSelect src/test/testing-library/UiMultiSelect.test.tsx src/test/testing-library/UiCalendarMultiSelect.test.tsx
git commit -m "feat: add multiselect and calendar multiselect modules"
```

## Task 7: Implement Radio Group and File Upload Modules

**Files:**
- Create: `src/components/UiRadioGroup/index.tsx`
- Create: `src/components/UiRadioGroup/types.ts`
- Create: `src/components/UiRadioGroup/RadioGroup.stories.tsx`
- Create: `src/components/UiFileUploadInput/index.tsx`
- Create: `src/components/UiFileUploadInput/types.ts`
- Create: `src/components/UiFileUploadInput/FileUploadInput.stories.tsx`
- Create: `src/test/testing-library/UiRadioGroup.test.tsx`
- Create: `src/test/testing-library/UiFileUploadInput.test.tsx`

**Step 1: Write failing tests**

1. Radio group changes selected option.
2. File upload returns selected files and supports remove UI.

**Step 2: Run failing tests**

Run:
```bash
pnpm exec jest src/test/testing-library/UiRadioGroup.test.tsx --verbose
pnpm exec jest src/test/testing-library/UiFileUploadInput.test.tsx --verbose
```

**Step 3: Minimal implementation**

Implement controlled APIs and disabled behavior.

**Step 4: Re-run tests**

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/UiRadioGroup src/components/UiFileUploadInput src/test/testing-library/UiRadioGroup.test.tsx src/test/testing-library/UiFileUploadInput.test.tsx
git commit -m "feat: add radio group and file upload modules"
```

## Task 8: Implement Items Modules

**Files:**
- Create: `src/components/UiItemRow/index.tsx`
- Create: `src/components/UiItemRow/types.ts`
- Create: `src/components/UiItemRow/ItemRow.stories.tsx`
- Create: `src/components/UiItemsList/index.tsx`
- Create: `src/components/UiItemsList/types.ts`
- Create: `src/components/UiItemsList/ItemsList.stories.tsx`
- Create: `src/test/testing-library/UiItemRow.test.tsx`
- Create: `src/test/testing-library/UiItemsList.test.tsx`

**Step 1: Write failing tests**

1. Method badge and title render.
2. Disabled and active row states render.
3. List container renders multiple rows.

**Step 2: Run failing tests**

Run:
```bash
pnpm exec jest src/test/testing-library/UiItemRow.test.tsx --verbose
pnpm exec jest src/test/testing-library/UiItemsList.test.tsx --verbose
```

**Step 3: Minimal implementation**

Implement row with method style mapping and list wrapper.

**Step 4: Re-run tests**

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/UiItemRow src/components/UiItemsList src/test/testing-library/UiItemRow.test.tsx src/test/testing-library/UiItemsList.test.tsx
git commit -m "feat: add items row and list modules"
```

## Task 9: Implement Cards Modules (`Ui kit-2.png`)

**Files:**
- Create: `src/components/UiTaskCard/index.tsx`
- Create: `src/components/UiTaskCard/types.ts`
- Create: `src/components/UiTaskCard/TaskCard.stories.tsx`
- Create: `src/components/UiProfileSelectCard/index.tsx`
- Create: `src/components/UiProfileSelectCard/types.ts`
- Create: `src/components/UiProfileSelectCard/ProfileSelectCard.stories.tsx`
- Create: `src/components/UiIntegrationCard/index.tsx`
- Create: `src/components/UiIntegrationCard/types.ts`
- Create: `src/components/UiIntegrationCard/IntegrationCard.stories.tsx`
- Create: `src/test/testing-library/UiTaskCard.test.tsx`
- Create: `src/test/testing-library/UiProfileSelectCard.test.tsx`
- Create: `src/test/testing-library/UiIntegrationCard.test.tsx`

**Step 1: Write failing tests**

Cover rest/hover/active/disabled rendering and selection callbacks.

**Step 2: Run failing tests**

Run:
```bash
pnpm exec jest src/test/testing-library/UiTaskCard.test.tsx --verbose
pnpm exec jest src/test/testing-library/UiProfileSelectCard.test.tsx --verbose
pnpm exec jest src/test/testing-library/UiIntegrationCard.test.tsx --verbose
```

**Step 3: Minimal implementation**

Implement composable cards with optional menu and selection indicator.

**Step 4: Re-run tests**

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/UiTaskCard src/components/UiProfileSelectCard src/components/UiIntegrationCard src/test/testing-library/UiTaskCard.test.tsx src/test/testing-library/UiProfileSelectCard.test.tsx src/test/testing-library/UiIntegrationCard.test.tsx
git commit -m "feat: add cards modules from ui kit cards board"
```

## Task 10: Implement Board A Micro-Components

**Files:**
- Create: `src/components/UiFilterChip/index.tsx`
- Create: `src/components/UiFilterChip/types.ts`
- Create: `src/components/UiFilterChip/FilterChip.stories.tsx`
- Create: `src/components/UiPinInput/index.tsx`
- Create: `src/components/UiPinInput/types.ts`
- Create: `src/components/UiPinInput/PinInput.stories.tsx`
- Create: `src/components/UiPaymentOptionCard/index.tsx`
- Create: `src/components/UiPaymentOptionCard/types.ts`
- Create: `src/components/UiPaymentOptionCard/PaymentOptionCard.stories.tsx`
- Create: `src/components/UiActionIconBar/index.tsx`
- Create: `src/components/UiActionIconBar/types.ts`
- Create: `src/components/UiActionIconBar/ActionIconBar.stories.tsx`
- Create: `src/components/UiStatusBadge/index.tsx`
- Create: `src/components/UiStatusBadge/types.ts`
- Create: `src/components/UiStatusBadge/StatusBadge.stories.tsx`
- Create: `src/components/UiNotificationBadge/index.tsx`
- Create: `src/components/UiNotificationBadge/types.ts`
- Create: `src/components/UiNotificationBadge/NotificationBadge.stories.tsx`
- Create: `src/test/testing-library/UiFilterChip.test.tsx`
- Create: `src/test/testing-library/UiPinInput.test.tsx`
- Create: `src/test/testing-library/UiPaymentOptionCard.test.tsx`
- Create: `src/test/testing-library/UiActionIconBar.test.tsx`
- Create: `src/test/testing-library/UiStatusBadge.test.tsx`
- Create: `src/test/testing-library/UiNotificationBadge.test.tsx`

**Step 1: Write failing tests for each micro-component**

Include render assertions and one interaction assertion.

**Step 2: Run failing tests**

Run each new test file with `pnpm exec jest <file> --verbose`.

**Step 3: Minimal implementation**

Implement reusable primitives matching board examples.

**Step 4: Re-run tests**

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/UiFilterChip src/components/UiPinInput src/components/UiPaymentOptionCard src/components/UiActionIconBar src/components/UiStatusBadge src/components/UiNotificationBadge src/test/testing-library/UiFilterChip.test.tsx src/test/testing-library/UiPinInput.test.tsx src/test/testing-library/UiPaymentOptionCard.test.tsx src/test/testing-library/UiActionIconBar.test.tsx src/test/testing-library/UiStatusBadge.test.tsx src/test/testing-library/UiNotificationBadge.test.tsx
git commit -m "feat: add board-a micro-components"
```

## Task 11: Extend Copied Skeleton Baseline for `Ui kit-3.png`

**Files:**
- Create: `src/components/UiSkeleton/index.tsx`
- Create: `src/components/UiSkeleton/types.ts`
- Create: `src/components/UiSkeleton/styles.ts`
- Create: `src/components/UiSkeleton/Skeleton.stories.tsx`
- Create: `src/components/UiSkeletonComposed/index.tsx`
- Create: `src/components/UiSkeletonComposed/types.ts`
- Create: `src/components/UiSkeletonComposed/SkeletonComposed.stories.tsx`
- Create: `src/test/testing-library/UiSkeleton.test.tsx`
- Create: `src/test/testing-library/UiSkeletonComposed.test.tsx`

**Step 1: Write failing tests**

Test variant support for:
1. image
2. textOneLine
3. textManyLines
4. block
5. menu
6. tabBar
7. button
8. list
9. input
10. checkboxText
11. radioText
12. table
13. widgetSmall
14. widgetMedium

**Step 2: Run failing tests**

Run:
```bash
pnpm exec jest src/test/testing-library/UiSkeleton.test.tsx --verbose
pnpm exec jest src/test/testing-library/UiSkeletonComposed.test.tsx --verbose
```

**Step 3: Minimal implementation**

Build variant-driven primitive and composed wrappers for repeated board layouts, reusing copied CRM animation primitives without changing keyframes/easing/durations.

**Step 4: Re-run tests**

Expected: PASS and parity tests remain green.

**Step 5: Commit**

```bash
git add src/components/UiSkeleton src/components/UiSkeletonComposed src/test/testing-library/UiSkeleton.test.tsx src/test/testing-library/UiSkeletonComposed.test.tsx
git commit -m "feat: add skeleton suite from ui kit skeletons board"
```

## Task 12: Storybook Matrix and Coverage Sync

**Files:**
- Modify/Create all new `*.stories.tsx` files above
- Modify: `docs/plans/2026-02-19-ui-kit-coverage-checklist.md`

**Step 1: Ensure every module has a story with board states**

At minimum include `Rest`, `Hover` (if represented via prop/class), `Active`, `Disabled` where applicable.

**Step 2: Run Storybook build**

Run: `pnpm run storybook-build`  
Expected: PASS.

**Step 3: Update coverage checklist**

Mark each board section as complete only when module + story + test exist.

**Step 4: Commit**

```bash
git add src/components/**/*.stories.tsx docs/plans/2026-02-19-ui-kit-coverage-checklist.md
git commit -m "docs: add story matrix and board coverage completion"
```

## Task 13: Full Verification Gate

**Files:**
- Modify: `docs/plans/2026-02-19-ui-kit-completion-prd.md` (status notes)

**Step 1: Run targeted module tests**

Run all new test files.

**Step 2: Run full unit tests and type checks**

Run:
```bash
pnpm run lint:tsc
pnpm run test:unit
```
Expected: PASS, or document pre-existing unrelated failures.

**Step 3: Re-run export coverage test**

Run: `pnpm exec jest src/test/testing-library/UiExportsCoverage.test.tsx --verbose`  
Expected: PASS.

**Step 4: Manual PNG parity check**

Visually compare Storybook examples to all four PNG boards.

**Step 5: Commit**

```bash
git add docs/plans/2026-02-19-ui-kit-completion-prd.md
git commit -m "chore: finalize verification for full ui kit png coverage"
```
