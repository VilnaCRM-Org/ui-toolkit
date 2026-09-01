# Story 3.4 — Integration Card Workflow

- **Issue:** [#22](https://github.com/VilnaCRM-Org/ui-toolkit/issues/22)
- **Epic:** Epic 3 — Data Presentation and Cards
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 3.4: Integration Card Workflow_

## Scope

Deliver the Epic 3 integration/brand selection card:

- `UiIntegrationCard` (`src/components/ui-integration-card`) — the Figma UI-kit
  "Cards" integration masters (frame `439:19893`): a 312×142, radius-12 card
  holding a 20px radio glyph beside the brand name and the brand's logo centred
  below. Wiring `onSelect` turns the whole card into one native
  `<button type="button" role="radio">` with a permanent `aria-checked`; without
  it the card is static content. The card is fluid (`width: 100%`,
  `minHeight: 8.875rem`) — the consumer sizes it; the stories and the showcase
  tiles render the master's 312px.

Deliberately an **ARIA radio** (not a toggle button, not a checkbox): the design
paints the literal `UiRadioGroup` glyph master, and the design language is
single-choice-among-sibling-cards. The card never renders its own group —
`role="radiogroup"`, its accessible name, `aria-setsize`/`aria-posinset` and any
roving-tabindex focus model belong to the **consumer** (or a future group
story), the same boundary as the `UiItemRow`/`UiItemsList` split.

The whole delivery is governed by a **binding accessibility contract** authored
before implementation and reproduced §-by-§ below; every module cites it by
section number in its own comments.

## Delivered API

### `UiIntegrationCard`

| Prop       | Type              | Notes                                                                                       |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------- |
| `name`     | `string`          | Brand name. The only text in the card and **is** its whole accessible name.                 |
| `logo`     | `IntegrationLogo` | Required `{ src, width, height }` bundle — see below. Decorative (`alt=""`).                |
| `selected` | `boolean?`        | Selected state, **always controlled** (default `false`). The component never self-flips it. |
| `onSelect` | `(() => void)?`   | Bare selection request. Its presence is the wired/static switch.                            |
| `disabled` | `boolean?`        | `aria-disabled` boundary pattern — focusable, activation a no-op, hover suppressed.         |
| `id`       | `string?`         | Lands on the `<button>` so focus can be re-resolved on refetch-heavy screens.               |
| `lang`     | `string?`         | BCP 47 tag on the root, only when the card's language differs from the page (3.1.2).        |
| `sx`       | `SxProps<Theme>?` | Merged last on the root (`[base, ...consumerSx]`).                                          |

`IntegrationLogo` is `{ src: { src: string } | string; width: number; height:
number }` — the image and its intrinsic size travel as one object so a
dimensionless logo is unrepresentable by construction (the `TaskAssignee`
type-level trick). An unusable bundle (blank `src`, non-positive/non-finite
dimensions) paints no `<img>` and dev-warns; `minHeight` keeps the geometry.
`forwardRef<HTMLButtonElement>` lands on the wired button.

The `onSelect` payload is **deliberately bare**, the inverse of 3.3's documented
payload rationale: this widget has exactly one state-change path (activation) in
exactly one direction (false→true), so nothing can race; the consumer closes
over its own integration id when mapping cards. Activating an already-selected
card fires nothing (native radio `change` semantics); a declined selection
leaves the card eligible, so the next activation fires again.

## Design decisions

### Figma alignment (UI-kit "Cards" integration masters — no `crm`/`website` card exists)

The card is composed 1:1 from the Cards frame's three integration state nodes:

| Element  | Figma node  | Applied                                                                                                                                      |
| -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Rest     | `451:26264` | 312×142, radius **12**, white fill, `1px` `brandGray` (`#E1E7EA`) border, no shadow                                                          |
| Radio    | (in master) | 20×20 glyph at outer (16, 18.5) — the exact `UiRadioGroup` dot recipe: white circle, unchecked `1px` `grey400`, checked `5px` `primary` ring |
| Name     | (in master) | Golos Text 400 16/26, letter-spacing 0, `darkPrimary` (`#1A1C1E`), starts at outer x=45 (16 + 20 glyph + 9 gap), first line top y=15.5       |
| Logo     | (in master) | Consumer imagery, horizontally centred, vertical rule `logoTop = (142 − h/2)/2` — HubSpot 139×40 at (87, 61.5), AmoCRM 181×52 at (66, 58.5)  |
| Hover    | `451:26277` | Border darkens `brandGray` → `grey400`; card gains "Landing shadow" `0 8px 27px rgba(49, 59, 67, 0.14)`                                      |
| Selected | `451:26269` | Border → `primary` (`#1EAEFF`), Landing shadow retained, radio flips to the checked 5px ring; "Active state" in the Figma canvas             |
| Disabled | —           | **No Figma master** — semantics-only disabled (Escalation 1, the 3.2 precedent)                                                              |

(The Figma canvas mislabels `451:26277` as "Rest state"; its Landing shadow —
the exact 3.2/3.3 hover recipe — identifies it as the hover master.)

**No new palette tokens** — every ink resolves to an existing `sharedPalette`
token (`brandGray`/`grey400`/`primary`/`darkPrimary`/`white`). The Landing
shadow stays a raw rgba literal with the 3.1 recipe-comment convention. The
radius-12 chrome is this card's own (the task and profile cards are radius 8) —
a design fact, not a deviation.

### Box-model notes (the recurring Figma-inside-stroke lineage)

Figma strokes **inside** the frame; CSS draws `border` **outside** the padding
box. The header row sits at outer (16, 15.5), so the content-box padding is
`14.5px 15px` over the constant 1px border. The border is **constant 1px in
every state** — the states swap only its colour, never geometry, so nothing
jitters between rest, hover, selected and disabled (the `UiPagination`/3.2/3.3
no-jitter precedent). The radio glyph rides the 26px first text line at +3
(first-line anchored, not block-centred, so a wrapping name never drags it
down). The logo's vertical rule `logoTop = (142 − h/2)/2` fits both masters
within half a pixel and is expressed as a computed top gap from `logo.height`
(HubSpot 20px, AmoCRM 17px below the header line), floored at 0 for
taller-than-master logos.

### Behaviour

- **ARIA radio, always controlled.** With `onSelect`, the card is one native
  `<button type="button" role="radio">` (mandatory `type` — an untyped button
  submits enclosing forms) carrying a permanent `aria-checked`. `aria-pressed`
  is forbidden: a toggle button does not imply mutual exclusivity, so a
  screen-reader user who "pressed" card A and then card B would still believe A
  is pressed, while the radio role carries the exclusivity contract the glyph
  already promises to sighted users.
- **The card never renders its own group** — see Scope. A wired card mounting
  with no `[role="radiogroup"]` ancestor dev-warns (ARIA 1.2 imposes no required
  context on `radio`, so standalone stays valid and independently completable;
  the stories model the correct consumer wrapper).
- **The radio glyph is paint, never a control**: an `aria-hidden` CSS-drawn
  `<span>` reproducing the `ui-radio-group` dot recipe byte-for-byte — never an
  `<input>`, never focusable, never nested-interactive. The card is a single
  control; exactly one focusable element exists wired, zero static.
- **No key handlers where the platform already works.** Enter and Space activate
  through the native button; the component never calls `.focus()` anywhere.
  Each wired card is an independent tab stop in DOM order — the APG radio-group
  roving-tabindex model is deliberately out of scope (§4.3, on record) until a
  group story exists.
- **`disabled` = the `aria-disabled` boundary pattern**: focusable, activation
  returns before any model work, hover suppressed, native `disabled` never set
  (SC 2.4.3). A selected + disabled card keeps its full selected chrome —
  no Figma disabled master exists, so the component invents zero disabled
  visuals (Escalation 1).
- **Wired/static split** (3.1/3.2/3.3 precedent): unwired → a plain `<div>`
  with no role, no `tabindex` and **no ARIA of any kind**, painting the rest
  presentation even when `selected` is passed (dev-warn) — the static branch
  never renders state it cannot expose programmatically (SC 1.3.1).
- Decomposed into 8 single-purpose modules to stay inside the `rca`
  per-function budgets: `types.ts`, `styles.ts`, `integration-logo.ts` (logo
  validation + geometry), `integration-card-warnings.ts`, `use-card-ref.ts`
  (the §12.2 radiogroup-ancestor check), `use-integration-card.ts` (view
  model), `integration-card-content.tsx`, `index.tsx`.
- Dev-only guidance via the shared `useDevWarning`, silent in production.

### Contract deviations (documented)

- `value`/`onChange` map to **`selected`/`onSelect()`** — the state axis is a
  boolean radio check; the callback is bare (rationale above, and in
  `types.ts`).
- `error` is **not applicable** — the design ships no error master; validation
  belongs to the consumer/group.
- `size`/`variant` are **not applicable** — a single master; rest, hover,
  selected and disabled are **states**, not variants.
- **The logo is decorative (`alt=""`)**, the 3.3 §5.2 lineage: the brand name is
  adjacent visible text inside the same control.

## Shared-contract coverage

| Field      | UiIntegrationCard                                   |
| ---------- | --------------------------------------------------- |
| `value`    | ✅ as `selected` — always-controlled boolean        |
| `onChange` | ✅ as `onSelect()` — bare, one path, one direction  |
| `disabled` | ✅ as `disabled` (`aria-disabled` boundary pattern) |
| `error`    | ⛔ N/A — no error master; validation is the group's |
| `size`     | ⛔ N/A — single master; height is a `minHeight`     |
| `variant`  | ⛔ N/A — three states, zero variants                |
| `sx`       | ✅ on the root, merged last                         |

Every ⛔ carries its rationale in `types.ts` (3.1/3.2/3.3 precedent).

## Binding accessibility contract — as delivered

The contract was authored **before** implementation and is binding: deviation
requires an amendment, not a silent divergence. Token resolution was verified
against `ui-color-theme` up front — `#E1E7EA` = `brandGray`, `#D0D4D8` =
`grey400`, `#1EAEFF` = `primary`, `#1A1C1E` = `darkPrimary` — so **no new
palette tokens** were needed. Every section below shipped as written, plus one
amendment (A1) accepted during implementation.

### §1 — Widget pattern: an ARIA radio inside a consumer-owned group

- **§1.1** The wired card is **one native `<button type="button" role="radio">`
  spanning the whole card**, carrying a permanent `aria-checked` (`"true"`/
  `"false"`, never absent, never mixed). `aria-pressed` was considered and
  **rejected**: a toggle button does not imply mutual exclusivity — the radio
  role carries the exclusivity contract for free, exactly matching what sighted
  users infer from the glyph. A plain button with visual-only selection was
  **rejected** outright (SC 4.1.2). `aria-pressed` is **forbidden** anywhere in
  the tree.
- **§1.2** **The card never renders its own group.** `role="radiogroup"` (with
  its accessible name), `aria-setsize`/`aria-posinset`, and the APG radio-group
  roving-tabindex/arrow-key model all belong to the **consumer** or a future
  group story. In ARIA 1.2 `radio` has **no required context role**, so a
  standalone card is valid and independently completable (AC3); it is
  nonetheless suboptimal AT context, so a wired card that mounts with no
  `[role="radiogroup"]` ancestor **dev-warns** (§12.2) — the stories model the
  correct wrapper.
- **§1.3** The radio glyph is **paint, never a control**: a CSS-drawn
  `aria-hidden="true"` `<span>` using the exact `ui-radio-group` dot recipe
  (20px white circle; unchecked = `1px` `grey400` stroke; checked = `5px`
  `primary` ring leaving the white centre). Never an `<input type="radio">`,
  never a MUI `Radio`, never focusable, never a nested interactive element. The
  recipe constants move to the shared `field-controls` barrel only if the
  duplication detector flags the clone — it did not (`qlty` reports zero new
  clones), so the recipe lives in the card's `styles.ts`, byte-identical to
  `ui-radio-group`'s `dotBase`/`checkedDot`.
- **§1.4** Selection is **one-directional at the card**: activation requests
  selection; a radio cannot unselect itself. Deselection happens only when the
  consumer selects a sibling (§3).

### §2 — DOM topology and roles

- **§2.1** Wired root = the `<button type="button" role="radio">` itself — no
  positioning wrapper (nothing floats; the 3.3 wrapper existed for its menu).
  `id`, `lang`, consumer `sx` and the forwarded `ref`
  (`forwardRef<HTMLButtonElement>`) all land on this button.
- **§2.2** Content tree, identical in both branches: a header row (`<span>`
  layout) holding the `aria-hidden` glyph and the brand name as plain text;
  below it the brand logo `<img>`. No landmark, **no heading role** on the brand
  name, no baked-in natural-language literal of any kind (SC 3.1.2) — the only
  text is the consumer's `name`.
- **§2.3** Static (unwired) root = a `<div>` with **no role, no `tabindex`, and
  no ARIA of any kind**, rendering the identical content tree in the **rest**
  presentation (§3.4).
- **§2.4** Exactly **one focusable element** exists in the wired tree and
  **zero** in the static tree — a mandatory regression (§13.3, §13.5).

### §3 — Controlled-ness, API, wired/static split

- **§3.1** `selected?: boolean` is **always controlled**, default `false`; a
  nullish value is coerced to `false` (the `UiRadioGroup` `value ?? ''` footgun
  precedent). The component **never** self-flips it.
- **§3.2** `onSelect?: () => void` — a **bare, payload-free** selection request,
  fired on activation of a wired, non-disabled, **unselected** card. Activating
  an already-selected card fires nothing; a **declined** selection leaves the
  card eligible, so the next activation fires again (§13.2).
- **§3.3** **`onSelect` presence is the wired/static switch** (3.1/3.2/3.3
  lineage). Unwired → the §2.3 static `<div>`.
- **§3.4** On an unwired card, a truthy `selected` is **not painted** (rest
  glyph, rest border) and **dev-warns** — the 3.3 `open`-without-`onOpenChange`
  ruling transplanted (SC 1.3.1).
- **§3.5** `logo: IntegrationLogo` is **required** and bundles
  `{ src, width, height }`. An unusable logo renders **no `<img>`** and
  dev-warns (§12.4); `minHeight` keeps the geometry.
- **§3.6** Remaining props: `name`, `disabled?`, `id?`, `lang?`, `sx?` (merged
  last on the root, `[base, ...consumerSx]`).

### §4 — Keyboard and focus management

- **§4.1** **No key handlers anywhere. No `keyup` handlers (SC 2.5.2 stays
  native).** Enter and Space activate through the native button — a benign,
  on-record superset of the APG radio model (which specifies Space); a manual
  keydown handler would double-fire on Space (3.2 precedent).
- **§4.2** **The component never moves focus.** No `.focus()` call exists in any
  code path. The forwarded `ref` and `id` are the consumer's focus-return API.
- **§4.3** Each wired card is an **independent tab stop in DOM order**. This
  deviates from the APG radio-group roving-tabindex model **on record**: a
  composite focus manager cannot live inside a single card, and this story
  delivers only the card (§1.2). A future group story that introduces roving
  tabindex must amend this contract.
- **§4.4** Selection feedback for AT is the `aria-checked` flip on the
  **focused** element (announced natively); the deselected sibling flips
  silently, exactly as native radios do. No focus is moved and nothing else
  announces (§8).

### §5 — Accessible names and imagery

- **§5.1** The accessible name is **content-derived: the visible brand name,
  exactly**. **No `aria-label` anywhere in the tree** (WCAG 2.5.3 house rule) —
  a mandatory regression (§13.6).
- **§5.2** **The brand logo is decorative: `alt=""`** — the brand name is
  adjacent visible text inside the same control, so an informative `alt` would
  say the brand twice in one accessible name. Hygiene set (mirrors 3.3): real
  `<img>`, `width`/`height` attributes from the bundle, `decoding="async"`,
  `draggable={false}`, no `onError`, no `loading="lazy"` (selection cards are
  above-the-fold setup-flow content).
- **§5.3** The radio glyph is `aria-hidden="true"` (§1.3). The checked/unchecked
  change reaches AT **only** through `aria-checked`; no substitute or additional
  visual may be invented (design-first policy).
- **§5.4** `lang` on the root, only when the card's language differs from the
  page (SC 3.1.2). Brand names are consumer data.

### §6 — Disabled

- **§6.1** The repo **`aria-disabled` boundary pattern, end to end**: still a
  real, focusable `<button>` with `aria-disabled="true"`; native `disabled`
  **never** set (SC 2.4.3); the activation handler returns **before** any model
  work; hover suppressed via `:hover:not([aria-disabled="true"])`;
  `cursor: default`. `role="radio"` and `aria-checked` remain.
- **§6.2** A disabled **unwired** card is plain static content with **no**
  `aria-disabled` (3.3 §6.2).
- **§6.3** **Selected + disabled preserves the full selected chrome unchanged**
  — primary border, checked glyph, Landing shadow — with both `aria-checked`
  and `aria-disabled` present. Grounded in the `UiRadioGroup` styles comment
  ("a radio is often pre-selected + disabled — preserve the indicator") and the
  design-first policy: no Figma disabled master exists (Escalation 1), so the
  component invents **zero** visual changes for disabled. No dimming may be
  invented here.
- **§6.4** `disabled` and `selected` are **not** in conflict — no dev-warning
  for the combination.

### §7 — Focus indication and state-chrome precedence

- **§7.1** `:focus-visible` → `outline: none` + **single-layer inset ring**
  `box-shadow: inset 0 0 0 2px darkPrimary` (the 3.3/`UiItemRow` recipe — the
  card paints its own white fill). Inset because the card is r12 and consumer
  contexts may clip outset paint. Declared **after** the hover rule **and after
  the selected rule**, so it wins at equal specificity. **See Amendment A1.**
- **§7.2** **The ring dominates the selected chrome without erasing it**: the
  inset shadow paints just inside the constant 1px border, so a focused selected
  card shows both the primary border (state) and the `darkPrimary` ring (focus)
  — state and focus are orthogonal channels (the 3.3 §7.2 lineage).
  `darkPrimary` on white = 17.09:1.
- **§7.3** **Forced-colors branch mandatory**: `@media (forced-colors: active)`
  re-expresses the ring as `outline: 2px solid Highlight; outline-offset: -2px`
  (box-shadow is discarded in that mode). The card border stays a **real
  border**; the Landing shadow is decorative and may vanish. **State survival
  analysis (binding):** in forced-colors both border _colours_ flatten, but
  checked vs unchecked remains perceivable because the glyph's distinction is
  border **width** (5px vs 1px), not colour alone — this geometry channel must
  not be refactored away.
- **§7.4** **State-chrome precedence — selected dominates hover.** No
  hover-on-selected Figma master exists; the hover recipe (border → `grey400`,
  - Landing shadow) is gated
    `:hover:not([aria-disabled="true"]):not([aria-checked="true"])`, mirroring
    3.3's open-state gate: hover's grey border is _lower_ emphasis than the
    selected primary border, so letting hover win would visually demote the
    selected card mid-flow. Disabled suppresses hover entirely (§6.1).
    `cursor: pointer` on all non-disabled wired cards, selected included.
- **§7.5** The border is a **constant 1px in every state** — the states swap
  only its colour (`brandGray` → `grey400` → `primary`), never geometry (the
  `UiPagination`/3.2/3.3 no-jitter precedent).

#### Amendment A1 — the focus ring survives a hovered card (implementation round)

**Provenance:** core implementation agent, accepted by the contract owner.

As authored, §7.1's plain `&:focus-visible` rule is specificity (0,2,0) while
the §7.4 hover rule is (0,4,0) — so on a card that is **both** keyboard-focused
and pointer-hovered, the hover recipe would outrank the ring and the Landing
shadow would replace it: a live SC 2.4.7 hole (one the 3.3 precedent also has).
Amended: the focus rule is emitted as a **two-selector list** —
`&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-checked="true"])`
— whose second selector ties the hover rule's specificity and, declared later,
wins; the bare selector still covers disabled and selected cards, whose gated
hover rule never applies. Verified in the emitted CSS and locked by a hard
assertion in the unit suite that pins the exact selector list (amending that
test is part of any future change to this rule).

### §8 — Live regions: none, prohibited

- **§8.1** Zero live regions in any state. Selection changes are announced by
  the `aria-checked` flip on the focused element (§4.4); nothing else may
  announce. The attribute-level `expectNoLiveRegion` sweep runs across rest,
  selected, disabled, selected+disabled and static (§13.7).

### §9 — Motion

- **§9.1** No transitions or animations anywhere; state chrome swaps instantly,
  so no `prefers-reduced-motion` branch is needed. Adding any motion later
  requires both a branch and a contract amendment.

### §10 — Geometry, zoom, reflow, targets

- **§10.1** Master 312×142, radius 12, white fill. **Fluid-width convention**
  (3.2/3.3): `width: 100%`, `minHeight: 8.875rem` — **never `height`**.
- **§10.2** The brand name wraps naturally — no clamp, no ellipsis, no
  `overflow` clipping; the glyph aligns to the **first** text line, not the
  block centre, so a wrapped name never drags the glyph down. The logo carries
  `max-width: 100%; height: auto` so narrow consumer widths scale it (aspect
  preserved by the `width`/`height` attributes) instead of shearing it. Nothing
  breaks at 200% zoom or 320px reflow (SC 1.4.4 / 1.4.10).
- **§10.3** Target size: the whole card is the target — SC 2.5.8 passes
  trivially; no shrinking below 24×24 ever.
- **§10.4** SC 1.4.13 does not apply — no hover- or focus-triggered content
  exists, and none may be added (standing prohibition).

### §11 — Shared prop-contract mapping

The Shared-contract coverage table above; every ⛔ carries its rationale in
`types.ts`.

### §12 — Dev-warnings (shared `useDevWarning`, silent in production)

1. Truthy `selected` without `onSelect` — unwired card; the state is not painted
   (§3.4).
2. A **wired** card mounting with no `[role="radiogroup"]` ancestor — teaches
   the §1.2 composition; static cards never check. Implemented, per the
   contract's own prescription, as a `closest()` check in a dev-only mount
   effect (`use-card-ref.ts`) emitting through the shared dev-warn primitive —
   the one warning that must read the DOM and therefore cannot go through the
   render-time `useDevWarning` wrapper; production silence is identical.
3. Blank `name` — the accessible name would be empty.
4. Unusable `logo` (blank `src`, non-positive/non-finite dimensions) — renders
   no `<img>` (§3.5).

### §13 — Mandatory regression assertions (beyond the 100%-coverage gate)

All delivered in `tests/unit/ui-integration-card.test.tsx` (85 specs across 13
describe blocks), except §13.10 which lives in the visual suite:

1. **Exactly-once `onSelect`** per activation for click, Enter and Space each.
2. **Already-selected activation fires nothing**; a **declined** selection
   leaves the card eligible, so the next activation fires again.
3. Wired semantics: `role="radio"` with `aria-checked` mirroring `selected`
   across controlled re-renders; **no `aria-pressed`**; glyph `aria-hidden`;
   **exactly one focusable element** in the tree.
4. `aria-disabled` boundary: native `disabled` never set; **focus retained**
   when a focused card flips disabled; no `onSelect` while disabled — proven
   with real events.
5. Static card: **zero buttons, zero ARIA** (attribute-level sweep); rest
   presentation even with `selected` passed, plus the dev-warning.
6. Accessible name equals `name` exactly; logo `alt=""` with the full §5.2
   hygiene set; **no `aria-label` anywhere in the tree**.
7. The `expectNoLiveRegion` sweep across rest, selected, disabled,
   selected+disabled and static.
8. The four-warning dev contract, including production silence.
9. Radiogroup-context warning: a standalone wired card warns once; one wrapped
   in `[role="radiogroup"]` does not; a static card never does; no re-warn on
   re-render.
10. Visual state snapshots in the pinned Playwright image: rest, real hover,
    selected, **selected+hover** (the §7.4 gate — that shot must be
    pixel-identical to the selected shot; any diff between those two baselines
    is a §7.4 regression, not noise), and the real `:focus-visible` ring via
    keyboard Tab (never programmatic `.focus()` — the 3.3 gotcha), plus the
    forced-state showcase tiles. Mutation-killing assertions additionally pin
    the exact style recipes (constant 1px border with colour-only swaps, the
    Amendment-A1 two-selector ring, the hover gate, the 5px checked glyph,
    Golos Text 400 16/26, the per-height logo placement rule).

### Escalations

1. **Missing disabled visual (Major, on record — the 3.2 precedent in kind):**
   Figma ships no disabled master, so `disabled` ships **semantics-only**
   (suppressed hover + `cursor: default`); a selected+disabled card is visually
   identical to selected. Either a Disabled master gets added to Figma or this
   weak signal stays accepted; the design-first policy forbids inventing one.
2. **Selected-state indicator contrast (Major, design-first hold):** the
   `primary` `#1EAEFF` selected border and the 5px checked ring measure
   **2.46:1** on white — below the 3:1 SC 1.4.11 requirement for state
   indicators. The identical token class `UiRadioGroup` already ships with
   deferral on record. **Inventoried, not fixed** — routed to the
   accessibility-visuals PR (Story 1.3 policy).
3. **Unchecked glyph stroke (Minor, design-first hold):** `grey400` at
   **1.49:1** on white — the same `UiRadioGroup` class; inventoried for the
   accessibility-visuals PR.
4. **No focus-visible or forced-colors design exists in Figma** — the toolkit's
   ring recipe (§7) applies by policy; pixel hardening stays with the
   accessibility-visuals PR.
5. **Standing prohibitions:** a nested interactive glyph (§1.3), `aria-pressed`
   (§1.1), a self-rendered `radiogroup` or `aria-setsize`/`posinset` (§1.2),
   roving tabindex/arrow keys (§4.3), any hover- or focus-triggered content
   (§10.4), and any animation (§9). Each re-opens its section; the future group
   story amends §1.2/§4.3 explicitly.

### Contrast inventory (inventory only — design unchanged, routed to the accessibility-visuals PR)

| Surface                         | Colours (tokens)                 | Ratio    | Requirement                        | Verdict                                          |
| ------------------------------- | -------------------------------- | -------- | ---------------------------------- | ------------------------------------------------ |
| Brand name, all states          | `#1A1C1E` on `#FFF`              | 17.09:1  | 4.5:1 (16px/400 is not large text) | Pass                                             |
| Rest border                     | `#E1E7EA` on `#FFF`              | 1.25:1   | 3:1 if the boundary carries info   | Likely exempt decoration — guard comment         |
| Hover border                    | `#D0D4D8` on `#FFF`              | 1.49:1   | none (hover enhancement)           | Recorded                                         |
| Selected border                 | `#1EAEFF` on `#FFF`              | 2.46:1   | 3:1 (1.4.11 state indicator)       | **Fail — inventoried (Escalation 2)**            |
| Radio glyph, unchecked stroke   | `#D0D4D8` on `#FFF`              | 1.49:1   | 3:1 (1.4.11 component boundary)    | **Fail — inventoried (Escalation 3)**            |
| Radio glyph, checked ring       | `#1EAEFF` on `#FFF` (both sides) | 2.46:1   | 3:1 (1.4.11 state indicator)       | **Fail — inventoried (Escalation 2)**            |
| Landing shadow (hover/selected) | `rgba(49,59,67,0.14)`            | n/a      | none (decorative enhancement)      | Recorded                                         |
| Focus ring, all states          | `darkPrimary` inset on `#FFF`    | 17.09:1  | 3:1                                | Pass                                             |
| Brand logo                      | consumer-supplied imagery        | n/a      | n/a — decorative (`alt=""`, §5.2)  | Out of component scope; name is the text channel |
| Disabled (all inks)             | unchanged from rest/selected     | as above | exempt (1.4.3 inactive)            | Exempt, recorded (Escalation 1)                  |

## Design fidelity

Verified by the measured Figma-parity loop — computed-style and bounding-box
readback in the live Storybook render (Chromium, dpr 1), cross-checked against
the master PNG exports of all three state nodes and the two logo ground-truth
crops — **approved in round one with zero blockers** (the first Epic 3 story to
pass the sweep without a fix round; the box-model compensation was carried in
from the 3.1–3.3 lineage up front):

- **The card renders exactly 312×142, radius 12, in every state**, with the
  border constant at 1px so the geometry is bit-identical rest → hover →
  selected → disabled (§7.5). Radio glyph 20×20 at outer (16, 18.5) riding the
  26px first text line; brand name 'Golos Text' 400 16/26 `rgb(26,28,30)`
  starting at x=45 with its line box at y=15.5; HubSpot logo 139×40 at
  (86.5, 61.5) and AmoCRM 181×52 at (65.5, 58.5) — every box inside the ±0.5
  tolerance, logo content matching the ground-truth crops.
- **Hover** matches `451:26277`: border `rgb(208,212,216)` +
  `rgba(49,59,67,0.14) 0px 8px 27px`; nothing else moves (no-jitter verified —
  every content box unchanged under a real pointer hover). **Selected** matches
  `451:26269`: border `rgb(30,174,255)`, Landing shadow retained, glyph
  `5px solid rgb(30,174,255)` with the white centre. **Selected + real hover is
  byte-identical to selected** (`cmp` on the two screenshots) — the §7.4 gate
  holds live. **Disabled is byte-identical to rest** (Escalation 1,
  semantics-only), keeps `role="radio"` + `aria-checked` + `aria-disabled`, and
  a real pointer hover produces no border or shadow change. **Static** renders
  the rest chrome with zero buttons and a clean attribute sweep.
- **Focus** (keyboard Tab, both rest and selected): `outline: none` +
  `inset 0 0 0 2px rgb(26,28,30)`, with the selected card's primary border and
  checked glyph retained — state and focus stay orthogonal channels (§7.2).
- The five showcase board tiles (Rest, forced Hover, Selected, Selected+Hover,
  Static) each match their story counterpart; the forced hover recipe keeps the
  `:not([aria-checked="true"])` gate, so the Selected+Hover tile proves §7.4 on
  the board too.

Tolerated residuals on record (the sanctioned 3.1 class, not open work):
Chromium-vs-Figma glyph rasterization in the brand-name band; minor resampling
softness in the 2× logo crops (content verified correct); and the selected+focus
combination painting the ring in the shadow slot per §7.1's single-layer recipe
(the §13.10 matrix's "may combine" is permissive, and both state channels stay
visible).

## Acceptance-criteria completion

| Source AC (epics.md Story 3.4)                                                                                  | Status | Evidence                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC1** — selection behavior and state feedback clear and consistent; aligns with toolkit interaction/contracts | ✅     | Three Figma state nodes delivered; ARIA radio on the toolkit's native-button, wired/static and `aria-disabled` conventions; no new palette tokens.                        |
| **AC2** — selected/unselected/disabled transitions predictable and testable; callback semantics well-defined    | ✅     | All states measured; `selected`/`onSelect()` specified in `types.ts`; already-selected no-op and declined-selection re-eligibility tested; four dev-warnings.             |
| **AC3** — independently usable and testable; no future-story dependency                                         | ✅     | No dependency on 3.5+; standalone-valid ARIA radio (group is consumer-owned); 85-spec suite at 100% coverage + 4 stories + a 5-tile showcase group act as usage examples. |

## Provenance

`UiIntegrationCard` is source `new` — no `crm`/`website` integration card
existed, and the repo's `ui-card-item`/`ui-card-list` are the unrelated
marketing-site cards. Visuals come from the UI-kit Cards integration state nodes
(`451:26264` rest, `451:26277` hover, `451:26269` selected) inside frame
`439:19893`, with the radio glyph reproducing the `radiobutton` masters
(`151:6437`/`151:6438`) that `UiRadioGroup` renders; behaviour comes from the
WAI-ARIA `radio` role semantics on the toolkit's established native-button,
wired/static and `aria-disabled`-boundary conventions. The
`component-provenance.md` Epic 3 row is appended by this story.

## Governance / CI gates addressed

- Exports added to `src/components/index.ts` (`UiIntegrationCard`,
  `UiIntegrationCardProps`, `IntegrationLogo`); the export-surface drift guard
  in `tests/unit/components-index.test.ts` updated, including a new
  compile-time binding test for the two type-only barrel exports (which the
  runtime key sweep cannot see).
- **No palette additions** — the third Epic 3 story with zero new tokens.
- **100% statements / branches / functions / lines** on all 8
  `ui-integration-card` modules via `tests/unit/ui-integration-card.test.tsx` —
  **85 specs across 13 describe blocks**: wired radio semantics, the static
  card, controlled-ness (already-selected no-op, declined re-eligibility), the
  `aria-disabled` boundary with focus retention, accessible names and imagery
  hygiene, the live-region prohibition, the four-warning dev contract with the
  radiogroup-context matrix, mutation-killing assertions on the pure style
  recipes, and the logo validation/geometry branches. Full repo suite: **68
  suites / 1177 tests green**, global 100% coverage gate satisfied.
- **Pre-existing coverage repair (outside this story's scope, on record):** the
  global branch gate was already red at HEAD (99.95% — the
  `refs.trigger.current?.focus()` null branch in 3.3's `menu-actions.ts`
  `closeToTrigger`). Closed with one new 3.3 spec ("closes on Escape in order
  even with no trigger node to focus") in `tests/unit/ui-profile-select-card.test.tsx`,
  the exact sibling of the existing `activateMenuItem` null-trigger spec.
- `tsc` clean; ESLint clean — including **zero** `import/prefer-default-export`
  warnings on the new component (`use-card-ref.ts` and
  `integration-card-warnings.ts` ship default exports, the
  `range-band.ts` precedent); Prettier clean; `make lint-metrics` (`rca`)
  reports **all hard checks pass** with no decomposition needed; `qlty` smells
  reports **zero new clones** (the §1.3 radio-dot recipe verified byte-identical
  to `ui-radio-group`'s but not flagged, so the conditional `field-controls`
  extraction stays unexercised); `make lint-deps` (`depcruise`) **0 errors /
  340 modules** (run under Node 24 — the host's Node 25 is outside
  dependency-cruiser's support range, the known false-repro class);
  `make build` green with no new api-extractor warning.
- Storybook: 4 `UiIntegrationCard` stories (`Integration Card`, `Selected`,
  `Disabled`, `Static`) registered in `tests/visual/stories.json` — verified
  against a real `storybook build` by diffing the emitted `index.json` (72
  stories, zero missing/extra/drift). The three wired stories nest the card in
  a consumer-owned `role="radiogroup"` wrapper (with a consumer-side
  `aria-label`, legitimate under §1.2 — the §5.1 prohibition covers the card's
  own tree) so the §12.2 dev-warning stays silent and the composition is
  modelled correctly. A 5-tile showcase group (Rest, forced Hover, Selected,
  Selected+Hover, Static) joined the Figma-parity board with its forced-state
  `sx` recipes beside the task-card/profile ones; the wired tiles sit in
  consumer `role="radiogroup"` wrappers per §12.2. `tests/visual/states.spec.ts`
  gained the five §13.10 shots. Baselines are generated in the pinned Playwright
  Docker image, per the standing procedure.
- The logo fixtures are the masters' own brand marks (2× cover-crops of the
  Figma image fills, replicating Figma's crop) committed as base64 payloads in
  `src/showcase/new-components-board/board-logos.json` — payloads are data, not
  code (the 3.3 `board-avatars.json` precedent) — exposed as
  `HUBSPOT_LOGO_SRC`/`AMOCRM_LOGO_SRC` and composed into the
  `INTEGRATION_CARDS` master-data fixture in the showcase fixtures module,
  shared by the stories and the board tiles. Brand names and marks travel as
  **consumer data** (SC 3.1.2); a brand/mark pairing drift guard in
  `tests/unit/new-components-board.test.tsx` locks each brand to its own mark
  and intrinsic Figma size.

## Definition of Done

| DoD item                                              | AC  | Status                                                                        |
| ----------------------------------------------------- | --- | ----------------------------------------------------------------------------- |
| Selection behavior and state feedback clear           | AC1 | ✅ rest/hover/selected measured; `aria-checked` is the programmatic channel   |
| Consistent with established card and control patterns | AC1 | ✅ wired/static split, `aria-disabled` boundary, always-controlled state axis |
| Selected/unselected/disabled transitions predictable  | AC2 | ✅ selected dominates hover; disabled semantics-only; no-jitter chrome        |
| Callback and contract behaviour clearly defined       | AC2 | ✅ `selected`/`onSelect()` + shared-contract table; four dev-warnings         |
| Independently usable and testable                     | AC3 | ✅ standalone-valid radio; 85 specs at 100% coverage; stories + showcase      |
| Binding a11y contract honoured §-by-§                 | —   | ✅ reproduced above; Amendment A1 on record; §13's regressions all asserted   |
| Export recorded                                       | —   | ✅ `src/components/index.ts` + drift guard                                    |
| Quality gates green (this story's files)              | —   | ✅ coverage / `rca` / `qlty` / `tsc` / ESLint / Prettier / `depcruise`        |

## Out of scope / deferred

- **A group component** (`UiIntegrationCardGroup` with `radiogroup`, roving
  tabindex, arrow keys) — §1.2/§4.3 name it a future story; adding it amends
  the contract.
- **Per-card `error`** — no design exists; validation belongs to the group.
- **Contrast remediation** — the `primary` selected chrome (2.46:1) and the
  unchecked `grey400` stroke (1.49:1) are inventoried for the dedicated
  accessibility-visuals PR per the Story 1.3 policy; the rest/hover borders are
  ruled 1.4.11-exempt decoration with guard comments at their sites.
- **Focus-ring pixel hardening / forced-colors visual design** — no Figma design
  exists; the toolkit's ring recipe applies by policy.
- **A disabled visual** — blocked on design (Escalation 1).
