# UI Toolkit Completion Implementation Plan (Re-scoped)

**Goal:** Deliver a production-ready internal UI library for company projects (including `crm` and `website`) with complete Board A-D scope coverage, reuse-first delivery, canonical behavior consistency, and release-gate evidence.

**Architecture:** Execute in epic order with governance-first setup, then deliver components by domain: core controls, selection/input workflows, data/cards, and skeletons. Reuse already implemented components from `crm` and `website` before creating new modules. Keep `crm` as canonical behavior source and use `website` only for visual and variant gap-fill.

**Tech Stack:** React 18, TypeScript strict, MUI v5, Storybook 8, Jest + Testing Library, public npm registry publishing.

**Plan Date:** 2026-02-23  
**Input Artifacts:** `specs/planning-artifacts/prd.md`, `specs/planning-artifacts/architecture.md`, `specs/planning-artifacts/epics.md`

## Hard Constraints

1. Reuse-first is mandatory: use already implemented components from `crm` and `website` first.
2. Canonical behavior is `crm`; `website` is only for visual/variant gap-fill.
3. Skeleton baseline must be copied from `crm` and keep exact animation behavior.
4. Toolkit remains UI-layer only: no backend ownership, no domain business logic.
5. Shared contract fields are required where relevant: `value`, `onChange`, `disabled`, `error`, `size`, `variant`, `sx`.
6. New component folders are kebab-case; existing legacy `UiPascalCase` folders stay unchanged unless explicitly migrated.
7. Every story exits only when Storybook coverage, unit tests, export completeness, and provenance updates are complete.

## Current Repository Snapshot

1. This workspace snapshot currently contains planning artifacts and not the full implementation tree (`src/components`, tests, Storybook files).
2. Known existing components from architecture baseline:
   - `UiButton`, `UiInput`, `UiCheckbox`, `UiLink`
   - `UiTypography`, `UiImage`, `UiToolbar`, `UiTooltip`
   - `UiTextFieldForm`, `UiCardItem`, `UiCardList`
   - `UiFooter`, `UiBreakpoints`, `UiColorTheme`
3. Present local coverage artifacts currently include only:
   - `coverage/lcov-report/ui-toolkit/src/components/UiBreakpoints`
   - `coverage/lcov-report/ui-toolkit/src/components/UiCardList`

## Execution Preconditions

1. Execute this plan in the full toolkit source checkout containing:
   - `src/components`
   - `tests/unit`
   - `tests/integration`
   - `.storybook`
   - `package.json`
2. Ensure local source repos for reuse are available and readable:
   - `crm`
   - `website`
3. If source tree is missing, sync the implementation repository first and restart at Task 1.

### Task 1: Bootstrap Governance Artifacts

**Files:**
- Create: `specs/planning-artifacts/component-provenance.md`
- Create: `specs/planning-artifacts/board-coverage-checklist.md`
- Create: `specs/implementation-artifacts/release-readiness-report.md`
- Create: `specs/implementation-artifacts/story-dod-template.md`

**Step 1: Create provenance registry skeleton**

Add table columns:
- `component`
- `board`
- `source (crm|website|new)`
- `behavior-source`
- `visual-source`
- `notes`

**Step 2: Create board coverage checklist**

Add every scope item from Boards A-D with status fields:
- `implemented`
- `story-id`
- `storybook`
- `tests`
- `exports`
- `provenance`

**Step 3: Create release-readiness report template**

Add sections for:
- Epic closure status
- FR/NFR evidence links
- Blocking issues
- Go/No-Go decision

**Step 4: Create story DoD template**

Capture:
- changed files
- tests run
- stories added/updated
- export changes
- provenance updates

**Step 5: Commit**

```bash
git add specs/planning-artifacts/component-provenance.md \
  specs/planning-artifacts/board-coverage-checklist.md \
  specs/implementation-artifacts/release-readiness-report.md \
  specs/implementation-artifacts/story-dod-template.md
git commit -m "chore: bootstrap governance artifacts for ui-toolkit completion"
```

### Task 2: Inventory Existing Components and Map Reuse Sources

**Files:**
- Modify: `specs/planning-artifacts/component-provenance.md`
- Modify: `specs/planning-artifacts/board-coverage-checklist.md`

**Step 1: Inventory current toolkit components**

Run and capture output:

```bash
ls -1 src/components
rg -n "export \\{\\s*default\\s+as\\s+Ui" src/components/index.ts
rg -n "export \\{\\s*[^}]*Ui" src/components/index.ts
rg -n "export \\* from" src/components/index.ts
```

**Step 2: Inventory reusable candidates from `crm` and `website`**

Run equivalent component listings in both repositories and map candidates to required components.

**Step 3: Decide source per component**

For each required component:
- pick `crm` for behavior baseline whenever available
- use `website` only for missing visual variants
- mark `new` only when neither source has viable implementation

**Step 4: Update governance artifacts**

Record all decisions in provenance and set checklist status to `mapped`.

**Step 5: Commit**

```bash
git add specs/planning-artifacts/component-provenance.md \
  specs/planning-artifacts/board-coverage-checklist.md
git commit -m "docs: map board scope to crm/website/new provenance sources"
```

### Task 3: Epic 1 Story 1.1 - Core Contract and Export Baseline

**Files:**
- Modify: `src/components/UiButton/**`
- Modify: `src/components/UiInput/**`
- Modify: `src/components/UiCheckbox/**`
- Modify: `src/components/UiLink/**`
- Modify: `src/components/index.ts`
- Create/Modify: `tests/unit/ui-exports-coverage.test.tsx`

**Step 1: Add/normalize shared contract typing where relevant**

Apply typed fields and document exceptions per component semantics.

**Step 2: Ensure export completeness**

Verify core controls are exported from `src/components/index.ts`.

**Step 3: Add export contract test coverage**

Validate that expected exports exist and fail on missing exports.

**Step 4: Verify**

```bash
bunx jest tests/unit/ui-exports-coverage.test.tsx --verbose
```

**Step 5: Commit**

```bash
git add src/components/UiButton src/components/UiInput src/components/UiCheckbox \
  src/components/UiLink src/components/index.ts \
  tests/unit/ui-exports-coverage.test.tsx
git commit -m "feat: align core control contracts and export baseline"
```

### Task 4: Epic 1 Stories 1.2 and 1.3 - State Parity + Accessibility Consistency

**Files:**
- Modify: `src/components/UiButton/**`
- Modify: `src/components/UiInput/**`
- Modify: `src/components/UiCheckbox/**`
- Modify: `src/components/UiLink/**`
- Modify: `tests/unit/ui-button.test.tsx`
- Modify: `tests/unit/ui-input.test.tsx`
- Modify: `tests/unit/ui-checkbox.test.tsx`
- Modify: `tests/unit/ui-link.test.tsx`

**Step 1: Implement missing state parity**

Cover required states:
- button: rest, hover, active, disabled
- input: rest, hover, active, disabled, error
- checkbox: rest/checked/disabled combinations
- link: rest, hover, active, disabled when applicable

**Step 2: Harden accessibility behavior**

Ensure keyboard focus visibility and disabled/error interaction consistency.

**Step 3: Align behavior with `crm`**

Use `crm` behavior as source of truth; record any justified deviations in provenance notes.

**Step 4: Verify**

```bash
bunx jest tests/unit/ui-button.test.tsx --verbose
bunx jest tests/unit/ui-input.test.tsx --verbose
bunx jest tests/unit/ui-checkbox.test.tsx --verbose
bunx jest tests/unit/ui-link.test.tsx --verbose
```

**Step 5: Commit**

```bash
git add src/components/UiButton src/components/UiInput src/components/UiCheckbox \
  src/components/UiLink tests/unit/ui-button.test.tsx \
  tests/unit/ui-input.test.tsx \
  tests/unit/ui-checkbox.test.tsx \
  tests/unit/ui-link.test.tsx \
  specs/planning-artifacts/component-provenance.md
git commit -m "feat: complete core state parity and accessibility consistency"
```

### Task 5: Epic 1 Story 1.4 - Quality Gate Closure

**Files:**
- Modify: `src/components/UiButton/*.stories.tsx`
- Modify: `src/components/UiInput/*.stories.tsx`
- Modify: `src/components/UiCheckbox/*.stories.tsx`
- Modify: `src/components/UiLink/*.stories.tsx`
- Create: `specs/implementation-artifacts/epic-1-dod.md`

**Step 1: Add/normalize stories for required states**

Represent required interactive states and edge behaviors.

**Step 2: Validate story and tests coverage for Epic 1**

Run story build and core control tests.

**Step 3: Update board checklist and DoD artifact**

Mark Epic 1 rows and link evidence.

**Step 4: Verify**

```bash
bun run storybook-build
bunx jest tests/unit/ui-button.test.tsx \
  tests/unit/ui-input.test.tsx \
  tests/unit/ui-checkbox.test.tsx \
  tests/unit/ui-link.test.tsx --verbose
```

**Step 5: Commit**

```bash
git add src/components/UiButton src/components/UiInput src/components/UiCheckbox \
  src/components/UiLink specs/planning-artifacts/board-coverage-checklist.md \
  specs/implementation-artifacts/epic-1-dod.md
git commit -m "test: close epic 1 quality gates with story and test evidence"
```

### Task 6: Epic 2 Stories 2.1 and 2.2 - Search/Select Foundation + Multi-Select

**Canonical module location for Tasks 6-11:** `src/shared/ui/<component>`

**Files:**
- Create: `src/shared/ui/ui-search-input/index.tsx`
- Create: `src/shared/ui/ui-search-input/types.ts`
- Create: `src/shared/ui/ui-search-input/UiSearchInput.stories.tsx`
- Create: `src/shared/ui/ui-select-with-search/index.tsx`
- Create: `src/shared/ui/ui-select-with-search/types.ts`
- Create: `src/shared/ui/ui-select-with-search/UiSelectWithSearch.stories.tsx`
- Create: `src/shared/ui/ui-multi-select/index.tsx`
- Create: `src/shared/ui/ui-multi-select/types.ts`
- Create: `src/shared/ui/ui-multi-select/UiMultiSelect.stories.tsx`
- Create: `tests/unit/ui-search-input.test.tsx`
- Create: `tests/unit/ui-select-with-search.test.tsx`
- Create: `tests/unit/ui-multi-select.test.tsx`
- Modify: `src/components/index.ts`

**Step 1: Reuse implementations from `crm` and `website`**

Start from existing source modules and adapt into toolkit contract patterns.

**Step 2: Implement shared contract and disabled/error handling**

Ensure consistent callback signatures and value handling.

**Step 3: Add stories and tests**

Cover render, selection/search interaction, and disabled/error behavior.

**Step 4: Verify**

```bash
bunx jest tests/unit/ui-search-input.test.tsx --verbose
bunx jest tests/unit/ui-select-with-search.test.tsx --verbose
bunx jest tests/unit/ui-multi-select.test.tsx --verbose
```

**Step 5: Commit**

```bash
git add src/shared/ui/ui-search-input src/shared/ui/ui-select-with-search \
  src/shared/ui/ui-multi-select src/components/index.ts \
  tests/unit/ui-search-input.test.tsx \
  tests/unit/ui-select-with-search.test.tsx \
  tests/unit/ui-multi-select.test.tsx \
  specs/planning-artifacts/component-provenance.md
git commit -m "feat: deliver epic 2 search/select foundation and multi-select"
```

### Task 7: Epic 2 Stories 2.3, 2.4, and 2.4A - Calendar Multi-Select + Radio/File Upload

**Files:**
- Create: `src/shared/ui/ui-calendar-multi-select/index.tsx`
- Create: `src/shared/ui/ui-calendar-multi-select/types.ts`
- Create: `src/shared/ui/ui-calendar-multi-select/UiCalendarMultiSelect.stories.tsx`
- Create: `src/shared/ui/ui-radio-group/index.tsx`
- Create: `src/shared/ui/ui-radio-group/types.ts`
- Create: `src/shared/ui/ui-radio-group/UiRadioGroup.stories.tsx`
- Create: `src/shared/ui/ui-file-upload-input/index.tsx`
- Create: `src/shared/ui/ui-file-upload-input/types.ts`
- Create: `src/shared/ui/ui-file-upload-input/UiFileUploadInput.stories.tsx`
- Create: `tests/unit/ui-calendar-multi-select.test.tsx`
- Create: `tests/unit/ui-radio-group.test.tsx`
- Create: `tests/unit/ui-file-upload-input.test.tsx`
- Modify: `src/components/index.ts`

**Step 1: Implement components with reuse-first policy**

Start from `crm` and `website` implementations when available.

**Step 2: Standardize contract and interaction semantics**

Align disabled/error behavior and callback contracts.

**Step 3: Add story and test coverage**

Include keyboard behavior for calendar and radio where relevant.

**Step 4: Verify**

```bash
bunx jest tests/unit/ui-calendar-multi-select.test.tsx --verbose
bunx jest tests/unit/ui-radio-group.test.tsx --verbose
bunx jest tests/unit/ui-file-upload-input.test.tsx --verbose
```

**Step 5: Commit**

```bash
git add src/shared/ui/ui-calendar-multi-select src/shared/ui/ui-radio-group \
  src/shared/ui/ui-file-upload-input src/components/index.ts \
  tests/unit/ui-calendar-multi-select.test.tsx \
  tests/unit/ui-radio-group.test.tsx \
  tests/unit/ui-file-upload-input.test.tsx \
  specs/planning-artifacts/component-provenance.md
git commit -m "feat: complete epic 2 calendar, radio, and file-upload workflows"
```

### Task 7.5: Epic 2 Story 2.5 - Pagination Delivery

**Files:**
- Create: `src/shared/ui/ui-pagination/index.tsx`
- Create: `src/shared/ui/ui-pagination/types.ts`
- Create: `src/shared/ui/ui-pagination/UiPagination.stories.tsx`
- Create: `tests/unit/ui-pagination.test.tsx`
- Modify: `src/components/index.ts`
- Modify: `specs/planning-artifacts/component-provenance.md`

**Step 1: Implement `UiPagination` with reuse-first policy**

Adapt from `crm`/`website` implementation patterns where viable and keep canonical behavior alignment.

**Step 2: Add story and unit coverage**

Document primary pagination states and test core interactions and disabled behavior.

**Step 3: Verify**

```bash
bunx jest tests/unit/ui-pagination.test.tsx --verbose
```

**Step 4: Commit**

```bash
git add src/shared/ui/ui-pagination src/components/index.ts \
  tests/unit/ui-pagination.test.tsx \
  specs/planning-artifacts/component-provenance.md
git commit -m "feat: deliver epic 2 pagination module"
```

### Task 8: Epic 2 Story 2.6 - Quality Gate Closure

**Files:**
- Modify: `specs/planning-artifacts/board-coverage-checklist.md`
- Create: `specs/implementation-artifacts/epic-2-dod.md`

**Step 1: Validate Epic 2 stories and tests**

Ensure all Epic 2 components have stories and tests linked, including `UiPagination`.

**Step 2: Validate export completeness**

Confirm all Epic 2 components are available from `src/components/index.ts`.

**Step 3: Record evidence**

Capture test command output references and checklist row completion.

**Step 4: Commit**

```bash
git add specs/planning-artifacts/board-coverage-checklist.md \
  specs/implementation-artifacts/epic-2-dod.md
git commit -m "docs: close epic 2 quality gates and evidence tracking"
```

### Task 9: Epic 3 Stories 3.1 to 3.4 - Data Rows and Card Workflows

**Files:**
- Create: `src/shared/ui/ui-item-row/**`
- Create: `src/shared/ui/ui-items-list/**`
- Create: `src/shared/ui/ui-task-card/**`
- Create: `src/shared/ui/ui-profile-select-card/**`
- Create: `src/shared/ui/ui-integration-card/**`
- Create: `tests/unit/ui-item-row.test.tsx`
- Create: `tests/unit/ui-items-list.test.tsx`
- Create: `tests/unit/ui-task-card.test.tsx`
- Create: `tests/unit/ui-profile-select-card.test.tsx`
- Create: `tests/unit/ui-integration-card.test.tsx`
- Modify: `src/components/index.ts`

**Step 1: Reuse existing components from `crm`/`website`**

Import behavior from `crm` and fill visual gaps from `website`.

**Step 2: Implement module contracts and state semantics**

Keep deterministic behavior and clear interaction callbacks.

**Step 3: Add stories and tests**

Cover method/status variants, selectable states, disabled behavior.

**Step 4: Verify**

```bash
bunx jest tests/unit/ui-item-row.test.tsx --verbose
bunx jest tests/unit/ui-items-list.test.tsx --verbose
bunx jest tests/unit/ui-task-card.test.tsx --verbose
bunx jest tests/unit/ui-profile-select-card.test.tsx --verbose
bunx jest tests/unit/ui-integration-card.test.tsx --verbose
```

**Step 5: Commit**

```bash
git add src/shared/ui/ui-item-row src/shared/ui/ui-items-list src/shared/ui/ui-task-card \
  src/shared/ui/ui-profile-select-card src/shared/ui/ui-integration-card \
  src/components/index.ts tests/unit/ui-item-row.test.tsx \
  tests/unit/ui-items-list.test.tsx tests/unit/ui-task-card.test.tsx \
  tests/unit/ui-profile-select-card.test.tsx \
  tests/unit/ui-integration-card.test.tsx \
  specs/planning-artifacts/component-provenance.md
git commit -m "feat: deliver epic 3 data rows and card workflows"
```

### Task 10: Epic 3 Stories 3.5 and 3.6 - Micro-Components + Quality Closure

**Files:**
- Create: `src/shared/ui/ui-filter-chip/**`
- Create: `src/shared/ui/ui-pin-input/**`
- Create: `src/shared/ui/ui-payment-option-card/**`
- Create: `src/shared/ui/ui-action-icon-bar/**`
- Create: `src/shared/ui/ui-status-badge/**`
- Create: `src/shared/ui/ui-notification-badge/**`
- Create: `tests/unit/ui-filter-chip.test.tsx`
- Create: `tests/unit/ui-pin-input.test.tsx`
- Create: `tests/unit/ui-payment-option-card.test.tsx`
- Create: `tests/unit/ui-action-icon-bar.test.tsx`
- Create: `tests/unit/ui-status-badge.test.tsx`
- Create: `tests/unit/ui-notification-badge.test.tsx`
- Modify: `src/components/index.ts`
- Create: `specs/implementation-artifacts/epic-3-dod.md`

**Step 1: Implement micro-components with shared conventions**

Apply contract fields only where semantically relevant and document exceptions.

**Step 2: Add story/test coverage for all micro-components**

Cover render + one core interaction assertion per component.

**Step 3: Validate exports and governance records**

Ensure all components are exported and provenance entries are complete.

**Step 4: Verify**

```bash
bunx jest tests/unit/ui-filter-chip.test.tsx --verbose
bunx jest tests/unit/ui-pin-input.test.tsx --verbose
bunx jest tests/unit/ui-payment-option-card.test.tsx --verbose
bunx jest tests/unit/ui-action-icon-bar.test.tsx --verbose
bunx jest tests/unit/ui-status-badge.test.tsx --verbose
bunx jest tests/unit/ui-notification-badge.test.tsx --verbose
```

**Step 5: Commit**

```bash
git add src/shared/ui/ui-filter-chip src/shared/ui/ui-pin-input \
  src/shared/ui/ui-payment-option-card src/shared/ui/ui-action-icon-bar \
  src/shared/ui/ui-status-badge src/shared/ui/ui-notification-badge \
  src/components/index.ts tests/unit/ui-filter-chip.test.tsx \
  tests/unit/ui-pin-input.test.tsx \
  tests/unit/ui-payment-option-card.test.tsx \
  tests/unit/ui-action-icon-bar.test.tsx \
  tests/unit/ui-status-badge.test.tsx \
  tests/unit/ui-notification-badge.test.tsx \
  specs/planning-artifacts/component-provenance.md \
  specs/implementation-artifacts/epic-3-dod.md
git commit -m "feat: complete epic 3 micro-components and quality closure"
```

### Task 11: Epic 4 Stories 4.1 to 4.3 - Skeleton Baseline, Primitive, and Composed Variants

**Files:**
- Create/Modify: `src/shared/ui/ui-skeleton/**`
- Create/Modify: `src/shared/ui/ui-skeleton-composed/**`
- Create: `tests/unit/ui-skeleton.test.tsx`
- Create: `tests/unit/ui-skeleton-composed.test.tsx`
- Modify: `src/components/index.ts`
- Modify: `specs/planning-artifacts/component-provenance.md`

**Step 1: Copy skeleton baseline from `crm`**

Reuse existing skeleton implementation and preserve animation behavior exactly.

**Step 2: Add primitive variants**

Implement image/text/block primitive placeholders.

**Step 3: Add composed variants**

Implement required composed layouts (widgets, menu, tab bar, controls, table).

**Step 4: Verify parity + behavior**

```bash
bunx jest tests/unit/ui-skeleton.test.tsx --verbose
bunx jest tests/unit/ui-skeleton-composed.test.tsx --verbose
```

**Step 5: Commit**

```bash
git add src/shared/ui/ui-skeleton src/shared/ui/ui-skeleton-composed \
  src/components/index.ts tests/unit/ui-skeleton.test.tsx \
  tests/unit/ui-skeleton-composed.test.tsx \
  specs/planning-artifacts/component-provenance.md
git commit -m "feat: deliver epic 4 skeleton baseline and variants with crm parity"
```

### Task 12: Epic 4 Story 4.4 - Skeleton Quality Gate Closure

**Files:**
- Modify: `specs/planning-artifacts/board-coverage-checklist.md`
- Create: `specs/implementation-artifacts/epic-4-dod.md`

**Step 1: Verify parity evidence**

Capture proof that animation behavior remains aligned to `crm` baseline.

**Step 2: Verify story/test/export completeness**

Ensure skeleton components are fully documented and exported.

**Step 3: Commit**

```bash
git add specs/planning-artifacts/board-coverage-checklist.md \
  specs/implementation-artifacts/epic-4-dod.md
git commit -m "docs: close epic 4 skeleton parity and quality gates"
```

### Task 13: Epic 5 Stories 5.1 to 5.4 - Adoption Readiness and Governance Closure

**Files:**
- Modify: `specs/planning-artifacts/board-coverage-checklist.md`
- Modify: `specs/planning-artifacts/component-provenance.md`
- Modify: `src/components/index.ts` (if missing exports remain)
- Modify: `specs/implementation-artifacts/release-readiness-report.md`
- Create: `specs/implementation-artifacts/epic-5-dod.md`

**Step 1: Close board coverage mapping**

Each Board A-D item must be `done` or explicitly documented as non-goal.

**Step 2: Finalize provenance and canonical compliance**

All components must have source + rationale + behavior alignment notes.

**Step 3: Finalize export integrity**

No required component missing from entrypoint exports.

**Step 4: Complete governance report**

Summarize:
- coverage closure
- provenance compliance
- export integrity
- quality-gate evidence
- compatibility notes for internal consumers (`crm`, `website`, others)

**Step 5: Commit**

```bash
git add specs/planning-artifacts/board-coverage-checklist.md \
  specs/planning-artifacts/component-provenance.md \
  src/components/index.ts \
  specs/implementation-artifacts/release-readiness-report.md \
  specs/implementation-artifacts/epic-5-dod.md
git commit -m "docs: finalize epic 5 adoption readiness governance"
```

### Task 14: Final Verification and Release Gate

**Files:**
- Modify: `specs/implementation-artifacts/release-readiness-report.md`
- Modify: `package.json`
- Modify: `CHANGELOG.md` (and/or `.changeset/**`, `bun.lock`) during version management

**Step 1: Run full verification suite**

```bash
bun run lint
bun run typecheck
bunx jest --verbose
bun run storybook-build
bun run build
```

**Step 1b: Perform version management (Changesets preferred)**

Preferred Changesets flow:

```bash
bunx changeset
bunx changeset version
git add .changeset package.json bun.lock CHANGELOG.md
git commit -m "chore: version ui-toolkit for release"
```

Fallback flow if Changesets are unavailable:

```bash
npm version <new-version> --no-git-tag-version
git add package.json bun.lock CHANGELOG.md
git commit -m "chore: bump ui-toolkit version to <new-version>"
```

**Step 2: Confirm release exit criteria**

Checklist must be true:
- board coverage fully closed
- stories exist for new/enhanced components
- unit tests pass
- strict TS checks pass
- library build succeeds
- skeleton parity verified
- export surface complete
- version bump PR includes updated `CHANGELOG.md` and package metadata
- `ci:publish` script is present in `package.json` and points to the public npm registry URL (`${NPM_REGISTRY_URL:-https://registry.npmjs.org}`)

**Step 3: Record final evidence and release decision**

Set `release-readiness-report.md` to `GO` or `NO-GO` with blocking items, and include links to verification output and the version-bump PR.

**Step 4: Commit**

```bash
git add specs/implementation-artifacts/release-readiness-report.md
git commit -m "chore: publish final release-readiness gate decision"
```

**Step 5: Publish from CI after version-bump PR merge**

Ensure `package.json` contains:

```json
{
  "scripts": {
    "ci:publish": "bun publish --registry ${NPM_REGISTRY_URL:-https://registry.npmjs.org}"
  }
}
```

After the version-bump PR is merged to the release branch, run publish in CI:

```bash
bun run ci:publish
```

Archive publish logs/artifact links in `specs/implementation-artifacts/release-readiness-report.md`.
