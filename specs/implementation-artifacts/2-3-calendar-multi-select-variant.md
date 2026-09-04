# Story 2.3 — Calendar Multi-Select Variant

- **Issue:** [#15](https://github.com/VilnaCRM-Org/ui-toolkit/issues/15)
- **PR:** [#107](https://github.com/VilnaCRM-Org/ui-toolkit/pull/107)
- **Epic:** Epic 2 — Selection, Search, and Input Workflows
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 2.3: Calendar Multi-Select Variant_
- **Definition of Done:** deferred to the shared compliance matrix — `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md` → `### Matrix`, row `2-3-calendar-multi-select-variant.md`. This artifact predates `specs/implementation-artifacts/story-dod-template.md`, which was authored with Epic 4 (commit `3c310f9`), so its DoD is instantiated once against the shared template in that matrix rather than restated here. Raised in the PR #126 review.

## Scope

Deliver `UiCalendarMultiSelect` (`src/components/ui-calendar-multi-select`) — a
calendar-style control for selecting **many discrete dates** (not a single date
and not a range). It reuses the established Epic 2 patterns (shared contract,
per-component theme tokens, dev-only accessibility warnings, the shared
`field-controls` internals) where relevant, and introduces no dependency on
future Epic 2 stories.

This story is the top of the Epic 2 stack `main ← 2.1 ← 2.2 ← 2.3`: it targets the
Story 2.2 branch (`feat/issue-14-multi-select`), which is itself on Story 2.1
(`feat/issue-13-search-and-select-foundation`). It reuses the shared `field-controls`
module (`outlinedFieldTheme`, `hasText`) and follows the same conventions; its diff is
2.3-only and, as a linear stack, there is no merge conflict with the PRs below it.
GitHub retargets each PR up the stack as the one below it merges.

## Design decisions

### Directory / structure

New component lives in `src/components/ui-calendar-multi-select` (kebab folder,
`UiCalendarMultiSelect` export), matching every existing component and enforced
gate — same rationale as Story 2.1 (the `src/features/*` tree remains aspirational;
the public barrel is `src/components/index.ts`).

Logic is split so the presentational `.tsx` files stay trivial (they are the only
files Stryker mutates) and all branching lives in pure, fully-covered `.ts`
modules. The **`rca` complexity gate** (`config/metrics-policy.json`: per-function
`lloc ≤ 10`, `nexits ≤ 3`, `nargs ≤ 3`, `halstead_volume ≤ 1000`; per-file
`≤ 10` functions / `≤ 6` closures) forces fine-grained decomposition — many tiny
single-purpose modules rather than a few large ones:

- Pure date logic: `date-utils.ts` (arithmetic/parse) + `calendar-month.ts`
  (matrix, comparisons, labels, weekday/month constants).
- Pure interaction logic: `keyboard.ts` (key → next-focused-date, map-based to
  keep exits ≤ 3), `selection.ts` (sanitize + toggle), `view-model.ts` (cell
  descriptors), `calendar-actions.ts` (context-object handlers), `calendar-init.ts`
  (state seeds).
- Hooks: `use-calendar-model.ts` (state), `use-roving-focus.ts` (focus-on-attach
  ref), `use-calendar-actions.ts` (bound handlers), `use-calendar.ts` (composes
  them), `use-calendar-field.ts` (ids/flags/sx), `use-warnings.ts` (dev guidance).
- Presentational `.tsx`: `index.tsx`, `calendar-label.tsx`, `calendar-surface.tsx`,
  `calendar-messages.tsx`, `calendar-header.tsx`, `calendar-grid.tsx`,
  `calendar-body.tsx`, `weekday-header.tsx`, `day-cell.tsx`, `padding-cell.tsx`,
  `icons.tsx` — each a thin attribute map, with `field`/`calendar` bundles threaded
  down to keep prop-passing (and Halstead volume) small.

### Accessibility review outcomes

The accessibility team specced the ARIA/keyboard model up-front and reviewed the
implementation. Behavioural findings were fixed: `id` no longer counts as an
accessible name (a `<label for>` can't target a `role="group"`); `required` is
folded into the accessible name in the `aria-label` path too; the error uses a
dedicated always-present visually-hidden `role="alert"` region (a `role` toggled
onto static helper text does not announce); the month caption is a `span`, not a
fixed-level heading. **Colour-contrast findings are deferred** to the dedicated
accessibility-visuals PR, consistent with Story 1.3's governance — the selected-day
brand-blue fill, today ring and muted greys are the toolkit's shared design tokens
(the same white-on-`#1EAEFF` the repo already ships and Lighthouse CI treats as a
known `warn`), so hardening them belongs to a toolkit-wide colour pass, not this
component story.

### `UiCalendarMultiSelect` (WAI-ARIA APG grid pattern)

Built from MUI primitives (`Box`, `IconButton`, `Typography`) + native `Date` —
no `@mui/x-date-pickers` and no date library, matching the toolkit's lean-
dependency ethos (the same reason `ui-search-input` avoided `@mui/icons-material`).

The accessibility model was specified up-front by the accessibility team and is
implemented as follows:

- Two-level structure: an outer `role="group"` (the field — carries the accessible
  name and `aria-disabled`) wrapping a `role="grid"` month table
  (`aria-multiselectable="true"`, named by the month caption, `aria-describedby`
  the helper text).
- The **gridcell itself is the operable element** (no nested button). Selected
  days carry `aria-selected="true"`, selectable-but-unselected days
  `aria-selected="false"` (explicit, so deselect announces); padding
  (adjacent-month) and out-of-range days are `aria-disabled` gridcells with no
  `aria-selected`.
- Roving `tabIndex` (the grid is a single tab stop). Full keyboard map: arrows
  (±1 day / ±1 week), `Home`/`End` (week edges), `PageUp`/`PageDown` (±1 month),
  `Shift+PageUp`/`PageDown` (±1 year), `Enter`/`Space` (toggle, focus stays).
  Arrow navigation across a month boundary switches the displayed month and
  focus follows. Focus after a prev/next **button** click stays on the button;
  a hidden polite live region announces the new month for that path only (arrow/
  page nav self-announces via the focused cell).
- Today is marked with `aria-current="date"` (+ a ring); `value`/`onChange` use
  ISO `YYYY-MM-DD` strings so the value is timezone-safe and serialisable. The
  displayed month is uncontrolled (`defaultMonth` → first selected → today).

### Contract deviations (documented)

- `variant` is **N/A** — a calendar surface has no outlined/filled/standard
  rendering. Intentionally omitted.
- `error` conveys via the `role="alert"` helper text + `aria-describedby` +
  error border, **not** `aria-invalid` (which ARIA does not support on
  `role="grid"`; `jsx-a11y` enforces this). `error` is suppressed while
  `disabled` (mirrors native controls).
- `required` conveys via a visible asterisk plus a visually-hidden "required"
  folded into the group's accessible name, **not** `aria-required` (not
  supported on `role="group"`). Native `<form>` serialization is a consumer
  concern (this control is controlled via `value`/`onChange`), consistent with
  the "form-level concerns belong to the consuming form" stance of the sibling
  controls.
- `minDate`/`maxDate` bound the selectable range; out-of-range days are
  focusable-but-inert (`aria-disabled`, per APG) so keyboard users can still
  discover them.

## Shared-contract coverage

| Field      | UiCalendarMultiSelect                              |
| ---------- | -------------------------------------------------- |
| `value`    | ✅ `string[]` (ISO `YYYY-MM-DD`)                   |
| `onChange` | ✅ `(value: string[])`                             |
| `disabled` | ✅                                                 |
| `error`    | ✅ (via alert helper + border, not `aria-invalid`) |
| `size`     | ✅ (`small` \| `medium`)                           |
| `variant`  | — (N/A for a calendar surface — documented)        |
| `sx`       | ✅                                                 |

## Provenance

Source `new`: no direct `crm`/`website` equivalent exists in the provenance
registry. Behaviour follows `crm`'s canonical UI library (MUI primitives) and the
WAI-ARIA APG grid pattern. Recorded in `component-provenance.md` under the Epic 2
section.

## Governance / CI gates addressed

- Export added to `src/components/index.ts`; `tests/unit/components-index.test.ts`
  expected surface updated.
- Unit tests target the 100% coverage gate and the Stryker mutation gate (state
  matrix + a11y roles/names + full keyboard model + selection + disabled +
  min/max + dev-warning contract). Pure logic modules are tested directly.
- Story registered in `tests/visual/stories.json`; a chromium visual baseline is
  generated in the pinned Playwright Docker image; e2e/visual manifest-
  completeness tests stay green. `defaultMonth` is pinned in the story so the
  today marker never shifts the baseline.
- `rca` complexity budget respected (small single-purpose functions; branch logic
  pushed into pure modules).
