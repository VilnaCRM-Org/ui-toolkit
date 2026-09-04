# Story 2.2 — Multi-Select Interaction Workflow

- **Issue:** [#14](https://github.com/VilnaCRM-Org/ui-toolkit/issues/14)
- **PR:** [#109](https://github.com/VilnaCRM-Org/ui-toolkit/pull/109) — canonical
  (supersedes [#108](https://github.com/VilnaCRM-Org/ui-toolkit/pull/108), which the
  Epic 2 stack reorder auto-merged into its pre-reorder base
  `feat/issue-15-calendar-multi-select`)
- **Epic:** Epic 2 — Selection, Search, and Input Workflows
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 2.2: Multi-Select Interaction Workflow_
- **Definition of Done:** deferred to the shared compliance matrix — `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md` → `### Matrix`, row `2-2-multi-select-interaction-workflow.md`. This artifact predates `specs/implementation-artifacts/story-dod-template.md`, which was authored with Epic 4 (commit `3c310f9`), so its DoD is instantiated once against the shared template in that matrix rather than restated here. Raised in the PR #126 review.

## Scope

Deliver `UiMultiSelect` (`src/components/ui-multi-select`) — a multi-value searchable
combobox where selected options render as removable chips. It reuses the shared
`field-controls` internals from Story 2.1 and follows the same conventions.

Because the multi-select code depends only on Story 2.1's `field-controls` (not on
the calendar), this PR is **stacked directly on the 2.1 branch**
(`feat/issue-13-search-and-select-foundation`) in epic order, with Story 2.3
(calendar) restacked on top of it: `main ← 2.1 ← 2.2 ← 2.3`. Its diff is 2.2-only,
it stays conflict-free with the other open PRs, and it introduces no dependency on a
future Epic 2 story. This branch also adds the shared `hasText` and `ChevronDownGlyph`
exports to `field-controls` (2.2 is the first control below the calendar to need
them). GitHub retargets each PR up the stack as the one below it merges.

## Design decisions

### Figma alignment (node `535:37450` "Multiselect")

The Figma multiselect's collapsed field is visually identical to "select с поиском":
white field, `#D0D4D8` stroke, `8px` radius, `#969B9D` placeholder, a label above,
and a thin chevron-down indicator — all already in `ui-color-theme` /
`outlinedFieldTheme`. Because select and multi-select share that thin chevron, it was
extracted into `field-controls` as `ChevronDownGlyph` (select now imports it; its
local `icons.tsx` was removed) — this keeps the design consistent and avoids a
duplicated glyph (the duplication gate). The Figma frame shows only the empty state,
so the chips follow MUI + toolkit tokens.

### `UiMultiSelect` (MUI v9 `Autocomplete multiple`)

- Built on MUI `Autocomplete` with `multiple` + `disableCloseOnSelect` (the popup
  stays open per pick — the accessible multi-select default). `{label,value}`
  options; the raw `(event, value, reason, details)` change signature is adapted to
  a clean `onChange(Option[])`.
- Selected options render as removable chips via MUI v9's `renderValue` +
  `getItemProps`. `getItemProps`' fully-typed fields (`key`, `className`, `tabIndex`,
  `data-item-index`, `onDelete`) are applied **explicitly, not spread** (the repo's
  no-prop-spreading rule), so no lint exception is needed. Each chip's delete control
  is a named affordance ("Remove Kyiv"), 24×24 (WCAG 2.5.8), and out of the tab order
  (removal is via click, Backspace, or arrow-to-chip + Delete — all MUI-native).
  **Correction (2026-08-06, Story 5.2):** the control shipped at 20×20, not 24×24
  (`deleteButtonSx`, `src/components/ui-multi-select/styles.ts`). **Further correction
  (PR #126 review):** SC 2.5.8 is not met and no exception closes it — the SC's
  "Equivalent" exception needs a different control on the same page that itself meets
  24 CSS px, and the keyboard path above is not one (that is SC 2.1.1). It is an
  accepted deviation mitigated by that keyboard path, recorded as `DEV-24` in
  `specs/planning-artifacts/deviation-ledger.md`.
- Accessibility (specced up-front and reviewed by the accessibility team): listbox
  `aria-multiselectable` + `aria-selected` toggles (selected options stay in the list
  to allow deselect); field-level `error`→`aria-invalid`, `helperText`→
  `aria-describedby`, accessible name from `label` else `aria-label`; a hidden polite
  `role="status"` region announces chip add/remove (MUI is silent on those) — driven
  by diffing prev/next so the change handler stays within the complexity budget.
- Reuses `field-controls`: `outlinedFieldTheme`, `createFieldRenderInput`
  (generalised to preserve MUI's chip `startAdornment`), `hasText`, and the shared
  `ChevronDownGlyph`.

### Contract deviations (documented)

- `required` marks the control required **only while the selection is empty** — the
  filter `<input>` is always `''`, so a permanently-`required` input would report
  `:invalid` even with chips selected and spuriously block form submission. Native
  `required` therefore tracks `value.length === 0`; the primary validation is the
  consumer's (set `error` + `helperText` on empty submit).
- Chip / delete-affordance contrast hardening is deferred to the accessibility-visuals
  PR (per Story 1.3), consistent with the other Epic 2 controls.

## Shared-contract coverage

| Field      | UiMultiSelect                         |
| ---------- | ------------------------------------- |
| `value`    | ✅ `Option[]`                         |
| `onChange` | ✅ `(Option[])`                       |
| `disabled` | ✅ (input disabled + chips read-only) |
| `error`    | ✅ (`aria-invalid` + helper)          |
| `size`     | ✅                                    |
| `variant`  | ✅                                    |
| `sx`       | ✅                                    |

## Provenance

Source `new`: behaviour follows `crm`'s canonical MUI `Autocomplete multiple`.
Recorded in `component-provenance.md` under the Epic 2 section.

## Governance / CI gates addressed

- Export added to `src/components/index.ts`; `tests/unit/components-index.test.ts`
  expected surface updated.
- 100% coverage (`tests/unit/ui-multi-select.test.tsx` +
  `tests/unit/multi-select-announce.test.ts`): render, accessible name, chips +
  named delete + removal paths, listbox multi-select semantics, keyboard, status
  announcements, error/helper/required, disabled tab-order, dev-warning contract.
- Story registered in `tests/visual/stories.json`; chromium visual baseline generated
  in the pinned Playwright Docker image.
- `rca` complexity budget respected (small functions; handler kept 2-ary by diffing
  instead of using MUI's 4-ary callback; render callbacks not memoised to avoid
  dependency-array Halstead blow-up).
- The `field-controls` change (chevron extraction + adornment preservation) is
  covered by the existing search/select suites, which stay green.
