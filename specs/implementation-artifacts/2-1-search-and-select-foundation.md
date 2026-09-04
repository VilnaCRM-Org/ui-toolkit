# Story 2.1 — Search and Select Foundation

- **Issue:** [#13](https://github.com/VilnaCRM-Org/ui-toolkit/issues/13)
- **PR:** [#106](https://github.com/VilnaCRM-Org/ui-toolkit/pull/106)
- **Epic:** Epic 2 — Selection, Search, and Input Workflows
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 2.1: Search and Select Foundation_
- **Definition of Done:** deferred to the shared compliance matrix — `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md` → `### Matrix`, row `2-1-search-and-select-foundation.md`. This artifact predates `specs/implementation-artifacts/story-dod-template.md`, which was authored with Epic 4 (commit `3c310f9`), so its DoD is instantiated once against the shared template in that matrix rather than restated here. Raised in the PR #126 review.

## Scope

Deliver the two foundational search/select controls named in the acceptance
criteria:

1. `UiSearchInput` (`src/components/ui-search-input`)
2. `UiSelectWithSearch` (`src/components/ui-select-with-search`)

`UiMultiSelect` is **out of scope** — it belongs to Story 2.2 (issue #14). The
`implementation-plan.md` Task 6 bundles 2.1 + 2.2; this story ships 2.1 only so
the PR maps 1:1 to issue #13.

## Design decisions

### Directory / structure

New components live in `src/components/ui-*` (kebab folder, `UiPascalCase`
export), matching **100 %** of existing components and every enforced gate:

- `.dependency-cruiser.js` lowercase-dir + public-API rules are hard-scoped to
  `src/components/`.
- `no-restricted-imports` forbids `@/features/*/*`.
- The public barrel is `src/components/index.ts`.

The `src/features/*` tree in `architecture.md` is aspirational/transitional (not
one component uses it yet — `architecture.md` marks `src/components/index.ts` the
boundary "until migration is complete"), and the doc forbids opportunistic
migration inside feature tasks. A `features/` migration is its own future story.

### `UiSearchInput` (aligned to Figma "Search")

Built on MUI `Autocomplete` (`freeSolo`) — a free-text search with an optional
typeahead suggestions dropdown, matching the Figma "Search" component.

- Leading magnifier adornment (decorative inline SVG — no `@mui/icons-material`
  dependency), **grey at rest and brand-blue (`#1EAEFF`) on focus** (per Figma),
  `aria-hidden` + `focusable="false"`.
- No clear `×` button and no dropdown chevron (`clearIcon={null}`,
  `popupIcon={null}`) — matches the design.
- `options` optional: with none it is a plain search box; with `options` it
  surfaces selectable suggestions. `value` (`inputValue`) is controlled;
  `onChange(text)` fires on every change — typing or picking a suggestion.
- Role is `combobox` (ARIA autocomplete pattern). MUI supplies the combobox
  wiring; `error`→`aria-invalid`, `helperText`→`aria-describedby`, native
  `required`, and the accessible name (`label`/`aria-label`/`id`) are field-level.
- Tokens: white field, `8px` radius, `#D0D4D8` stroke, `#969B9D` placeholder —
  all from the shared `ui-color-theme`, so the design colours match exactly.

### `UiSelectWithSearch`

MUI `Autocomplete` (canonical ARIA `combobox`) + a themed `TextField` via
`renderInput` (the documented, prop-forwarding-safe pattern).

- Options are objects: `{ label: string; value: string }` — real CRM data needs
  a label/value split. `getOptionLabel`/`isOptionEqualToValue` are derived from
  that shape.
- Clean single-select contract: `value: Option | null`,
  `onChange(value: Option | null)` — the raw MUI `(event, value, reason)`
  signature is adapted so consumers depend on the shared contract, not MUI
  internals.
- `error` → `TextField error` (`aria-invalid` + `aria-describedby` helperText
  wiring). `disabled`, `size`, `variant`, `sx` forwarded. Accessible name from
  `label`, or `aria-label` when there is no visible label.
- Custom thin **chevron-down** popup indicator (inline SVG) to match the Figma
  "select с поиском" glyph instead of MUI's default triangle arrow.
- Own `theme.ts` (per-component theme is the repo pattern; the depcruiser
  barrel rule forbids importing `ui-input/theme` directly) reusing the shared
  `ui-color-theme` tokens for outline/focus/error/disabled parity with
  `UiInput`.

## Shared-contract coverage

| Field      | UiSearchInput                | UiSelectWithSearch    |
| ---------- | ---------------------------- | --------------------- |
| `value`    | ✅ `string` (inputValue)     | ✅ `Option \| null`   |
| `onChange` | ✅ `(text: string)`          | ✅ `(Option \| null)` |
| `disabled` | ✅                           | ✅                    |
| `error`    | ✅                           | ✅                    |
| `size`     | ✅                           | ✅                    |
| `variant`  | — (outlined only per design) | ✅                    |
| `sx`       | ✅                           | ✅                    |

## Provenance

Source `new`: no direct `crm`/`website` equivalent exists in the provenance
registry. Behaviour follows `crm`'s canonical UI library (MUI) — `TextField`
for search, `Autocomplete` for select-with-search — with `ui-color-theme`
tokens. Recorded in `component-provenance.md` under a new _Epic 2_ section.

## Governance / CI gates addressed

- Exports added to `src/components/index.ts`; `tests/unit/components-index.test.ts`
  expected surface updated.
- Unit tests target the 100 % coverage gate and Stryker mutation gate (state
  matrix + a11y + clear/select interaction + edge branches).
- Stories registered in `tests/visual/stories.json`; chromium visual baselines
  generated in the pinned Playwright Docker image; e2e/visual manifest-
  completeness tests stay green.
- `rca` complexity budget respected (small single-purpose functions; helpers
  split into their own modules).
