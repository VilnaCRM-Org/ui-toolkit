# Story 2.5 — Pagination Workflow Component Delivery

- **Issue:** [#18](https://github.com/VilnaCRM-Org/ui-toolkit/issues/18)
- **PR:** [#116](https://github.com/VilnaCRM-Org/ui-toolkit/pull/116)
- **Epic:** Epic 2 — Selection, Search, and Input Workflows
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 2.5: Pagination Workflow Component Delivery_

## Scope

Deliver `UiPagination` (`src/components/ui-pagination`) — a controlled page
navigator: a `<nav>` landmark wrapping a previous-page link, the page-cell row
(boundary/sibling pages with start/end ellipses), and a next-page link. Page
cells are real `<button>`s with `aria-current="page"` on the current page;
prev is disabled on the first page, next on the last, and the whole bar via
`disabled`.

Stacked in epic order `main ← 2.2 (#109) ← 2.3 (#107) ← 2.4A (#114) ← 2.5
(this)`; based on `feat/issue-17-file-upload-input`. GitHub retargets the PR up
the stack as the one below it merges.

## Design decisions

### Figma alignment (composed bar node `360:12218` "Frame 391", state atoms `439:19463`–`439:19478`)

Unlike most Epic 2 controls, the design file has both the pagination **atoms**
(Ui-kit page: a 48×48 page cell and a chevron+label link, each in
rest/hover/active/disabled) and a **composed bar** (Design CRM page: prev link,
page cells, next link). Both were measured and mapped 1:1:

- Bar: horizontal flex, vertically centred, **48px** between the three groups;
  **6px** between page cells; chevron leads the "Попередня" label and trails
  "Наступна" (same chevron rotated 180°), 6px from its label.
- Page cell: 48×48, 8px radius, Inter Medium 16/18 — rest white/`#E1E7EA`
  stroke/`#57595B` ink; hover primary@10% fill/`#1EAEFF` ink; current `#1EAEFF`
  fill/white ink; disabled `#E1E7EA` fill/`#969B9D` ink. The border stays 1px
  (colour flips to transparent in filled states) so geometry never shifts.
- The skipped-pages marker is itself a rest-styled 48×48 cell — non-interactive.
- Link: Inter Medium 16/18 — rest label `#1A1C1E` with a **`#969B9D` chevron**
  (pixel-verified against the Figma render: the rest-state chevron is grey, not
  ink-coloured); hover `#00A3FF`; pressed `#1EAEFF`; disabled `#969B9D`.
- Chevron: 20×20 box, ~5×10 leaf, 1.67px stroke, round caps — drawn via the
  shared `field-controls` `Glyph` primitive with exact-path left/right variants
  (`ChevronDownGlyph` bakes a 1.5 stroke pointing down, so it could not hit the
  Figma geometry without a transform).

**No new colours** — every value resolves to an existing `ui-color-theme` token
(`primary`, `darkPrimary`, `brandGray`, `grey250`, `grey300`, `white`,
`containedButtonHover`), and the 10% hover tint derives via MUI `alpha()`.

### `UiPagination` behaviour

- **Always controlled:** `value` (current page, 1-based) + `onChange(page)` —
  the numeric analogue of the toolkit contract. `count` is the total pages.
- Page range follows MUI `usePagination` semantics (`boundaryCount` /
  `siblingCount`, default 1 each, start/end ellipsis, full collapse when
  everything fits) — implemented as a pure, dependency-free `page-range.ts`
  so the logic is directly unit-testable; outputs were runtime-verified against
  known MUI outputs.
- Accessible names: the `<nav>` defaults to "Пагінація" (overridable via
  `aria-label`); each page cell is "Сторінка N" (visible number in-name per
  WCAG 2.5.3); prev/next take their names from the visible labels
  (`previousLabel`/`nextLabel`, defaulting to the Figma Ukrainian strings);
  chevrons are `aria-hidden`.
- Native `<button>` activation only — no roving tabindex; focus-visible ring
  follows the calendar's established two-layer recipe.
- **Boundary prev/next self-disable via `aria-disabled`** (focusable, inert —
  the model's range guard no-ops out-of-range pages): a natively-disabled,
  still-focused link would drop keyboard focus to `<body>` on activation
  (WCAG 2.4.3, flagged by the accessibility review). Native `disabled` is
  reserved for the whole-bar `disabled` prop, consistent with `UiRadioGroup`.
- Under global `disabled`, every cell renders the Figma Disabled visual —
  including the current page (documented deviation: a disabled bar reads
  uniformly disabled; `aria-current` is still exposed to assistive tech).

### Contract deviations (documented)

- `value`/`onChange` carry a **number** (a page), not a string.
- `size`/`variant` are **not applicable** — single Figma design (documented,
  as for `UiRadioGroup`/`UiCheckbox`).
- `error` is **not applicable** — navigation, not a form field (documented).
- Hover/pressed/disabled visuals come straight from the Figma state atoms; the
  focus ring is the toolkit's established recipe (Figma draws no focus state);
  contrast hardening stays deferred to the accessibility-visuals PR per
  Story 1.3.

## Shared-contract coverage

| Field      | UiPagination                              |
| ---------- | ----------------------------------------- |
| `value`    | ✅ current page, 1-based number           |
| `onChange` | ✅ `(page: number)`                       |
| `disabled` | ✅ (whole navigator)                      |
| `error`    | ⛔ N/A — navigation control (documented)  |
| `size`     | ⛔ N/A — single Figma design (documented) |
| `variant`  | ⛔ N/A — single Figma design (documented) |
| `sx`       | ✅ (on the `<nav>` root)                  |

## Provenance

Source `new`: no `crm`/`website` pagination existed; visuals come from the
design's own atoms and composed bar, behaviour from the MUI `usePagination`
range semantics. Recorded in `component-provenance.md` under the Epic 2
section.

## Governance / CI gates addressed

- Export added to `src/components/index.ts`;
  `tests/unit/components-index.test.ts` expected surface updated
  (`UiPagination`).
- 100% coverage: `tests/unit/ui-pagination.test.tsx` (nav landmark + names,
  aria-current placement and controlled movement, page/prev/next activation,
  boundary and global disabled, non-interactive ellipsis, custom/default
  labels, keyboard activation, chevron geometry, sx passthrough, model guard
  branches) and `tests/unit/pagination-page-range.test.ts` (exhaustive range
  enumeration: no-ellipsis counts, start/end/both ellipsis, sibling/boundary
  variations, count=1, out-of-range clamps — full-array assertions for
  mutation killing).
- Storybook: interactive controlled story + ManyPagesWithEllipsis, FirstPage,
  LastPage, Disabled; registered in `tests/visual/stories.json`; chromium
  baselines generated in the pinned Playwright Docker image; a Pagination tile
  added to the Figma-parity showcase board.
- Figma parity verified by live measurement (computed styles + bounding boxes
  vs the Figma node geometry) in a dedicated verification pass; see PR body
  for the property-by-property table.
- `rca` complexity budget respected by every new `ui-pagination` module
  (0 findings — pure range builder decomposed into single-purpose helpers;
  view-model derivation in `use-pagination-model.ts`); `tsc`, ESLint (no
  suppressions), Prettier and `depcruise` clean. **Note:** the branch-wide
  `lint-metrics` run is red from pre-existing Epic 2 files (multi-select ghost
  internals, search/select hooks, calendar helpers, the showcase board file
  budgets) introduced by earlier stack commits — that remediation is owned by
  Story 2.6 (Epic 2 Quality Gate Closure), matching how the pre-existing
  coverage gap was handled in Story 2.4A. The same applies to 11 pre-existing
  stale visual baselines (June-era button/link/radio/file-upload state shots
  and the CardList story) that fail on the base branch independently of this
  story — e.g. the committed `radio-error` baseline still shows the English
  labels the radio story dropped in the 2026-07-21 parity pass; every
  pagination/showcase baseline added here passes.
