# Story 3.1 — Item Row and List Data Presentation

- **Issue:** [#19](https://github.com/VilnaCRM-Org/ui-toolkit/issues/19)
- **PR:** [#117](https://github.com/VilnaCRM-Org/ui-toolkit/pull/117)
- **Epic:** Epic 3 — Data Presentation and Cards
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 3.1: Item Row and List Data Presentation_

## Scope

Deliver the first two Epic 3 data-presentation primitives:

- `UiItemRow` (`src/components/ui-item-row`) — one REST-API endpoint row (the
  Figma "atom switcher"): an HTTP-method badge, the endpoint path, a short
  description, a trailing chevron expand affordance and a decorative open
  padlock. Wiring `onToggle` turns the whole row into an always-controlled
  WAI-ARIA **disclosure** button; without it the row is static content. Desktop
  and mobile share one DOM tree (CSS-only layout switch).
- `UiItemsList` (`src/components/ui-items-list`) — a pure composition wrapper
  that stacks `UiItemRow` children as a semantic `<ul role="list">`, one `<li>`
  per row, 8px apart, with no chrome of its own.

The **expandable panel content itself is out of scope for 3.1** — the row only
exposes the disclosure contract (`expanded`/`onToggle`/`panelId`) and the list
stacks rows; downstream card stories consume both.

Epic 3 is the first epic on `main` after Epic 2; this work is on
`feat/issue-19-item-row-and-list`.

## Delivered API

### `UiItemRow`

| Prop          | Type                                   | Notes                                                                                    |
| ------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `method`      | `'get' \| 'put' \| 'post' \| 'delete'` | Selects the badge label and the whole colour recipe. The only variant axis.              |
| `path`        | `string`                               | Endpoint path shown after the badge.                                                     |
| `description` | `string?`                              | Optional short description shown after the path.                                         |
| `muted`       | `boolean?`                             | Muted/inactive status — grey recipe + `aria-disabled` boundary pattern.                  |
| `expanded`    | `boolean?`                             | Disclosure state (wired rows only). Always controlled; defaults to `false`.              |
| `onToggle`    | `(() => void)?`                        | Optional — its presence makes the row a button; called on activation of a non-muted row. |
| `panelId`     | `string?`                              | Surfaced as `aria-controls` **only while expanded**.                                     |
| `sx`          | `SxProps<Theme>?`                      | Applied to the row root.                                                                 |

### `UiItemsList`

| Prop         | Type              | Notes                                                                     |
| ------------ | ----------------- | ------------------------------------------------------------------------- |
| `children`   | `ReactNode?`      | `UiItemRow` elements; each is wrapped in its own `<li>`. Empty → nothing. |
| `aria-label` | `string?`         | Optional accessible name; not a landmark, so there is no default.         |
| `sx`         | `SxProps<Theme>?` | Applied to the `<ul>` root.                                               |

## Design decisions

### Figma alignment (atom-switcher masters — no `crm`/`website` row exists)

The repo's `ui-card-item`/`ui-card-list` are the unrelated marketing-site cards,
so the row is composed 1:1 from the Figma "atom switcher" REST-endpoint masters
on the "Docs Rest API" screens, with interaction from the WAI-ARIA APG
**disclosure** pattern on `crm`'s canonical MUI primitives:

| Element          | Figma node(s)                                                                                  | Applied                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Row masters      | GET `439:19720`, GREY/muted `439:19721`, PUT `439:19722`, POST `439:19723`, DELETE `439:19724` | 52px row, `8px` radius, `1px` accent border over an accent-at-10% (`alpha()`) tint                                              |
| Method badge     | (per master)                                                                                   | White pill, Golos DemiBold 16/26, per-method accent ink, `0 8px 13.5px` per-method drop shadow                                  |
| Path             | (per master)                                                                                   | Golos DemiBold 18 `#1A1C1E` (`darkPrimary`)                                                                                     |
| Description      | (per master)                                                                                   | Golos Medium 15/18 `#404142` (`grey200`)                                                                                        |
| Trailing chevron | (per master)                                                                                   | `#1B2327` (`darkSecondary`); `#E1E7EA` (`brandGray`) on grey rows                                                               |
| Open padlock     | (per master)                                                                                   | `#57595B` (`grey250`) — the only lock glyph in the whole file, identical on every use; decorative                               |
| Hover masters    | `439:19772`–`439:19776`, grey hover `439:19773`                                                | Accent border/badge ink darkens + a per-method `0 4px 9px` row shadow                                                           |
| Expanded header  | `192:8298`                                                                                     | Chevron flips up and tints to the method accent                                                                                 |
| Mobile master    | `205:7840`                                                                                     | `≤480px` two-line layout, Golos→Inter (path 16/18, desc 12/18), 20px icons, badge shadow re-expressed as a `drop-shadow` filter |
| List usage       | "Frame 152" `187:7990`                                                                         | Rows on a 60px pitch (52px row + 8px gap) → the list's `8px` gap                                                                |

**No new base palette** — path/description/chevron/padlock inks and the muted
recipe all resolve to existing `ui-color-theme` tokens, and the border/badge/row
tints derive from them via MUI `alpha()`. The one addition is the **hover ink
set** the Figma hover masters introduce, added to `ui-color-theme`:
`getMethodHover #0091E2`, `putMethodHover #DD9F00`, `postMethodHover #00AE70`,
`deleteMethodHover #C72C2C`, and the muted `mutedInkHover #1C2022`. (`deleteMethodHover`
is a genuine darken of the `#DC3939` DELETE base, matching the DELETE row-hover
shadow tone `rgb(199, 44, 44)`, so every method's accent darkens on hover.)

### `UiItemRow` behaviour

- **APG disclosure, always controlled.** With `onToggle`, the entire row is one
  native `<button type="button">` carrying `aria-expanded` (default `false`).
  The component **never self-flips** — the next state is fed back through
  `onToggle`, exactly as `UiPagination` feeds pages through `onChange`.
  `aria-controls` (`panelId`) is surfaced **only while expanded**, so a
  collapsed/unmounted panel leaves no dangling idref. Without `onToggle` the row
  is static, non-focusable content (no button role, no `aria-expanded`); the
  chevron still renders, decoratively. The **expanded chevron flip/tint is gated
  to wired rows** — a static row exposes no `aria-expanded`, so it never shows the
  expanded affordance even if `expanded` is passed (which also dev-warns).
- **Muted = the `aria-disabled` boundary pattern.** A muted wired row stays a
  focusable `<button>` with `aria-disabled="true"`, and `onToggle` is a no-op
  (never fired while muted); native `disabled` is never set, so keyboard focus
  is never dropped to `<body>` on a state change — the same SC 2.4.3 treatment
  used by `UiPagination`'s boundary prev/next. `muted` and `expanded` are
  independent axes.
- **Content-derived accessible name.** The button name comes straight from the
  visible text, "{METHOD} {path} {description}" (description dropped when
  omitted) — no `aria-label`, so the visible label is always in the name
  (WCAG 2.5.3).
- **New shared-style chevron glyph** baked at the Figma export's `1.667@20`
  stroke weight; the existing `field-controls` `ChevronDownGlyph` is `1.5` and
  did not match, so a new `Glyph` variant was added rather than transforming the
  wrong path.
- **One DOM tree for both breakpoints** — the mobile layout is a CSS-only switch
  (same reading order at every width); the transparent mobile badge re-expresses
  its per-method shadow as a `drop-shadow` **filter** (not `box-shadow`) to match
  Figma's no-fill frame effect.
- Decomposed into single-purpose modules (`recipe.ts` colour maps,
  `styles.ts` layout/interactive/expanded assembly, `row-content.tsx`,
  `item-icons.tsx`, `use-item-row.ts` view model, `index.tsx` wired/static split)
  to stay inside the `rca` per-function budgets.
- Dev-only guidance via the shared `useDevWarning` when `expanded`/`panelId`
  arrive without `onToggle` (stripped in production).

### `UiItemsList` behaviour

- A semantic `<ul role="list">` with one `<li>` per row (the row is the list
  item's sole child), full width, `8px` apart, and **no chrome of its own**.
  Children are **flattened through React Fragments**, so grouping rows in a
  `<>…</>` still yields one `<li>` per row rather than a single item holding
  several rows.
- The explicit `role="list"` is a **sanctioned redundant-ARIA exception**:
  Safari/VoiceOver strip list semantics from a `list-style: none` list.
- **Empty collection renders NOTHING** — no `<ul>`, so a `list` role never
  appears for a zero-row collection.
- Adds **no interactive behaviour** (no keydown, no tabindex) — composition only;
  optional `aria-label` names the list (it is not a landmark, so no default).

### Contract deviations (documented)

- `value`/`onChange` are **not applicable** — a row is not a value control. The
  analogue is the disclosure contract `expanded`/`onToggle` (a boolean fed back
  by the consumer, like `UiPagination`'s numeric page).
- `disabled` maps to **`muted`** — realised via the `aria-disabled` boundary
  pattern rather than native `disabled`, so focus is retained.
- `error` is **not applicable** — a row/list is presentation, not a form field.
- `size`/`variant` are **not applicable** — the single Figma design; `method` is
  the only variant axis (documented in `types.ts`), like `UiRadioGroup`/`UiCheckbox`.
- Hover/expanded/focus visuals come straight from the Figma masters; the
  focus-visible ring is the toolkit's established two-layer recipe. Contrast /
  focus-ring pixel hardening stays deferred to the accessibility-visuals PR per
  Story 1.3.

## Shared-contract coverage

| Field      | UiItemRow                                                      | UiItemsList                             |
| ---------- | -------------------------------------------------------------- | --------------------------------------- |
| `value`    | ⛔ N/A — disclosure contract instead (`expanded`)              | ⛔ N/A — composition wrapper            |
| `onChange` | ⛔ N/A — disclosure contract instead (`onToggle`)              | ⛔ N/A — composition wrapper            |
| `disabled` | ✅ as `muted` (grey recipe + `aria-disabled` boundary pattern) | ⛔ N/A — no interactive state           |
| `error`    | ⛔ N/A — presentation, not a form field (documented)           | ⛔ N/A — presentation, not a form field |
| `size`     | ⛔ N/A — single Figma design (documented)                      | ⛔ N/A — single Figma design            |
| `variant`  | ⛔ N/A — `method` is the only variant axis (documented)        | ⛔ N/A — single Figma design            |
| `sx`       | ✅ (on the row root)                                           | ✅ (on the `<ul>` root)                 |

## Accessibility semantics

- **APG disclosure (`UiItemRow`).** A wired row is a single native
  `<button type="button">` with `aria-expanded`; `aria-controls` is present only
  while expanded. Always controlled — no self-flip — so assistive-tech state
  matches the consumer's rendered state.
- **`aria-disabled` boundary pattern (muted).** Muted wired rows stay focusable
  buttons with `aria-disabled="true"` and a no-op activation; native `disabled`
  is never used, preventing focus loss (SC 2.4.3). A muted **unwired** row is
  plain static content with no `aria-disabled`. Keyboard focus is retained when a
  focused row becomes muted on re-render (regression-tested).
- **Content-derived accessible name.** "{METHOD} {path} {description}", no
  `aria-label` — the visible label is always in the name (WCAG 2.5.3).
- **Decorative icons.** The chevron and the open padlock are the row's only
  glyphs and both carry no role / are hidden from assistive tech. The padlock is
  the single lock glyph in the whole Figma file, identical on every use and never
  paired with a locked/auth semantic in the design, so exposing it would add
  meaningless noise — it stays decorative for Story 3.1 (there is intentionally
  no auth/locked prop). Like the pagination chevron-glyph precedent, the tests
  reach these glyphs by node query rather than a semantic one.
- **List semantics (`UiItemsList`).** `<ul role="list">` with one `<li>` per row;
  the redundant `role="list"` is the sanctioned Safari/VoiceOver workaround. An
  empty collection renders nothing at all, so no bare/zero-row `list` role is
  ever exposed. No toggle/live-region announcement is emitted on expand (the
  row's visible state change is sufficient; verified — no `status`/`alert`
  region appears before or after toggling).

## Design fidelity

Both components went through the measured Figma-parity loop: **all controllable
geometry, colours, typography and states were verified against the Figma
atom-switcher masters (`439:19720`–`439:19776`, expanded header `192:8298`) and
the mobile master (`205:7840`)** by two independent methods — computed-style
readback in the live render and pixel measurement against the Figma PNG exports.
The row's 52px height, `8px` radius, `1px` accent border + 10% tint, badge
typography and per-method drop shadow, path/description inks, chevron/padlock
colours, the hover ink set + `0 4px 9px` row shadow, the expanded chevron
flip+tint, the muted grey recipe, and the mobile two-line/`drop-shadow`-filter
switch all match their masters; the list's `8px` gap is measured from the "Frame
152" 60px row pitch.

Residuals on record (sub-pixel, not fixable in CSS): font-rasterizer text-advance
variance between the browser and Figma's renderer, and a few Figma-internal 0.5px
glyph nudges inside the badge/icon frames. These are documented, not open work.

## Acceptance-criteria completion

| Source AC (epics.md Story 3.1)                                                                                                                   | Status | Evidence                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC1** — `ui-item-row`/`ui-items-list` render structured data with clear semantics; state/interaction stays consistent with toolkit conventions | ✅     | Row = content-named disclosure button (or static content); list = `<ul role="list">`/`<li>`. Disclosure "always controlled, never self-flips" and the `aria-disabled` boundary pattern mirror `UiPagination`. |
| **AC2** — method/status visual distinctions supported; row interaction predictable and testable                                                  | ✅     | Four per-method colour recipes + the muted/grey recipe (exact, mutation-killing `resolveRecipe` assertions); disclosure/muted/keyboard behaviour covered by the unit suites and forced-state tiles.           |
| **AC3** — independently completable; usable without future-story dependencies; contracts + usage examples ready for downstream cards             | ✅     | No dependency on later stories; panel content explicitly deferred; public API documented in `types.ts`; Storybook stories + the showcase board group act as usage examples for the card stories.              |

## Provenance

Both components are source `new` (no `crm`/`website` item-row or list container
existed; the repo's `ui-card-item`/`ui-card-list` are unrelated marketing-site
cards). Visuals come from the design's own atom-switcher masters and the "Frame
152" list usage; behaviour from the WAI-ARIA APG disclosure pattern on `crm`'s
canonical MUI primitives. Recorded in `component-provenance.md` under the new
Epic 3 section.

## Governance / CI gates addressed

- Exports added to `src/components/index.ts` (`UiItemRow`, `ItemRowMethod`,
  `UiItemsList` + prop types); `tests/unit/components-index.test.ts` expected
  surface updated.
- New hover-ink tokens added to `src/components/ui-color-theme`
  (`getMethodHover`/`putMethodHover`/`postMethodHover`/`deleteMethodHover`/`mutedInkHover`)
  — the only palette additions; every other value reuses an existing token or an
  `alpha()` tint.
- **100% coverage** (global gate) via:
  - `tests/unit/ui-item-row.test.tsx` — 49 specs across 14 describe blocks:
    wired disclosure semantics + display name, the `aria-expanded` lifecycle
    (never self-flips), the `aria-controls` lifecycle (only while expanded),
    the unwired static row, keyboard Enter/Space activation + DOM-order
    traversal, the muted `aria-disabled` boundary (no-op activation, focus
    retention), decorative-glyph geometry/colour, the no-live-region guarantee,
    the dev-warning contract, consumer `sx`, and the pure `resolveRecipe` /
    `rowContainerSx` / `iconGroupSx` / `useItemRow` helpers (full-value,
    mutation-killing assertions).
  - `tests/unit/ui-items-list.test.tsx` — 13 specs: `role="list"` with one
    `listitem` per child, the row nested as the sole child, the `8px` gap, the
    optional `aria-label`, `sx` passthrough, and the empty→renders-nothing
    behaviour.
- Storybook: 7 `UiItemRow` stories (`Item Row`/GET, `Put Method`, `Post Method`,
  `Delete Method`, `Muted`, `Static`, `Expanded`) + 1 `UiItemsList` story, all
  registered in `tests/visual/stories.json` → **8 chromium story baselines**;
  plus real-state snapshots in `tests/visual/states.spec.ts`
  (`item-row-hover.png` real `:hover`, `item-row-focus.png` focus-visible ring).
  A 12-tile "Рядок ендпоінта (REST API)" group was added to the Figma-parity
  showcase board (GET/PUT/POST/DELETE/Grey rest + the five hover variants +
  Expanded + Mobile). All new baselines generated in the pinned Playwright
  Docker image.
- Figma parity verified by live measurement (computed styles + bounding boxes vs
  the master node geometry).
- `rca` complexity budget respected by every new `ui-item-row`/`ui-items-list`
  module (view-model derivation in `use-item-row.ts`; pure recipe/style helpers);
  `tsc`, ESLint (no suppressions), Prettier and `depcruise` clean.

## Definition of Done

| DoD item                                              | AC  | Status                                                                              |
| ----------------------------------------------------- | --- | ----------------------------------------------------------------------------------- |
| Both components render structured data with semantics | AC1 | ✅ disclosure button / static content + `<ul role="list">`/`<li>`                   |
| State/interaction consistent with toolkit conventions | AC1 | ✅ always-controlled disclosure + `aria-disabled` boundary (mirrors `UiPagination`) |
| Method/status visual distinctions                     | AC2 | ✅ 4 per-method recipes + muted/grey recipe (exact `resolveRecipe` tests)           |
| Interaction predictable and testable                  | AC2 | ✅ 49 + 13 unit specs at 100% coverage; forced-state tiles + state snapshots        |
| Independently usable, no future-story dependency      | AC3 | ✅ panel content deferred; no downstream coupling                                   |
| Contracts + usage examples ready for card stories     | AC3 | ✅ `types.ts` documented; Storybook + showcase board group                          |
| Export + provenance recorded                          | —   | ✅ `src/components/index.ts`, `component-provenance.md` Epic 3 section              |
| Quality gates green (this story's files)              | —   | ✅ coverage/`rca`/`tsc`/ESLint/Prettier/`depcruise`; visual baselines committed     |

## Out of scope / deferred

- **Details-panel content** — the expandable panel's contents are a future Epic 3
  story; 3.1 delivers only the disclosure contract (`expanded`/`onToggle`/
  `panelId`) and the list stacking.
- **Auth/locked semantics** — the open padlock is decorative only; there is
  intentionally no locked/auth prop (no such semantic exists in the design).
- **Contrast palette inventory / focus-ring pixel hardening** — the colour/
  contrast audit of the new per-method and muted inks (including the new hover
  tokens) and the focus-ring appearance are routed to the dedicated
  accessibility-visuals PR, per the Story 1.3 policy that keeps this delivery
  free of colour/visual-remediation scope.
