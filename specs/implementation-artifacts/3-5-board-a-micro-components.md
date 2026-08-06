# Story 3.5 — Board A Micro-Components Delivery

- **Issue:** [#23](https://github.com/VilnaCRM-Org/ui-toolkit/issues/23)
- **PR:** [#123](https://github.com/VilnaCRM-Org/ui-toolkit/pull/123)
- **Branch:** `feat/issue-23-board-a-micro-components`
- **Epic:** Epic 3 — Data Presentation and Cards
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 3.5: Board A
  Micro-Components Delivery_
- **Format precedent:** `specs/implementation-artifacts/3-4-integration-card-workflow.md`

This artifact is the **single source implementation agents build from**. The
measurements are the Figma extraction, carried in up front (the 3.4 lesson: the
box-model lineage in the spec is why 3.4 passed Figma parity in round one). The
accessibility clauses are a **binding contract** authored before implementation:
deviation requires an amendment to this text first (the Amendment-A1
precedent), never an in-code exception.

## Scope

Six Board A micro-components, each an independently usable and testable
toolkit export. Each lives in `src/components/<name>/` (kebab-case, one
directory per component):

| Component                | Wired root                       |
| ------------------------ | -------------------------------- |
| `ui-filter-chip`         | one `<button>` (remove)          |
| `ui-pin-input`           | N `<input>` in a `role="group"`  |
| `ui-payment-option-card` | one `<button role="radio">`      |
| `ui-action-icon-bar`     | N `<button>` in a `role="group"` |
| `ui-status-badge`        | `role="img"` or one `<button>`   |
| `ui-notification-badge`  | one `<button>` (bell)            |

### Design sources — Figma node map

File: **VilnaCRM (Copy)**, fileKey `xZ7ccrH6d4QyqLQsayFSEX`.
Board A = frame `439:19252` "Ui kit" (1234×3395) on canvas `439:19251`,
heading "Buttons and UI elements". Four state columns at frame-relative
x ≈ 56 (Rest), 348 (Hover), 640 (Active), 932 (Disabled). Verified visually
against a full-board screenshot (2026-07-31).

Figma layer names: filter-chip = "Tags"; pin-input = "2FA item";
payment-card = Frames 137–140; status-badge = Frames 419/5416–5418;
notification-badge = Frames 294/5419–5420.

| Component    | rest        | hover       | active      | disabled    | Master |
| ------------ | ----------- | ----------- | ----------- | ----------- | ------ |
| filter-chip  | `439:19370` | `439:19372` | `439:19373` | `439:19371` | 256×30 |
| pin-input    | `439:19615` | `439:19617` | `439:19619` | `439:19623` | 64×86  |
| payment-card | `439:19625` | `439:19643` | `439:19640` | `439:19658` | 279×90 |
| status-badge | `451:25843` | `451:25849` | `451:25845` | `451:25852` | 26×26  |
| notif-badge  | `451:26194` | `451:26199` | `451:26209` | `451:26214` | 48×48  |

`ui-action-icon-bar` is composed of per-icon instances (y ≈ 1412–1422):

| Icon                 | rest        | hover       | active                     | disabled    |
| -------------------- | ----------- | ----------- | -------------------------- | ----------- |
| `x-close` 24×24      | `439:19830` | `439:19832` | `439:19834`                | `439:19836` |
| `dots-horizontal` 24 | `439:19860` | `439:19862` | `439:19864`                | `439:19866` |
| `dots-vertical` 24   | `451:25809` | `451:25811` | `451:25813`                | `451:25815` |
| `eye` / `eye-off` 24 | `451:25817` | `451:25819` | `451:25821` (eye-off)      | `451:25825` |
| `settings-04` 30×30  | `451:26186` | `451:26188` | `451:26190`                | `451:26192` |
| `trash-02` 24×24     | `632:46703` | `632:46705` | `632:46709` (40×40 chrome) | `632:46710` |

Note the eye→eye-off swap in the active/disabled columns (a visibility toggle,
not a pointer state) and the red 40×40 backdrop on the active trash — the only
authored button chrome anywhere on Board A.

### Stack facts (verified in `package.json`)

MUI **9.1.0** · React **19.2.7** · Emotion **11.14.1** · Storybook **10.4.3** ·
TypeScript **6** · Jest **30**. Peer deps require `@mui/material ^9.0.0` and
`react ^19.0.0`. `@emotion/styled` is used **zero** times in `src/` and must
stay that way — every surface is `<Box component="…" sx={…}>` with `sx`
assemblers exported from a `styles.ts`.

### Palette resolution (used by every table below)

Every colour on Board A resolves to an existing `sharedPalette` token
(`src/components/ui-color-theme/index.ts`). **No new palette tokens, therefore
no `src/components/types.d.ts` module augmentation.**

| Hex       | Token                                | Line |
| --------- | ------------------------------------ | ---- |
| `#1EAEFF` | `palette.primary.main`               | 5    |
| `#DC3939` | `palette.error.main`                 | 11   |
| `#DF7878` | `palette.strokeDanger.main`          | 14   |
| `#38B386` | `palette.success.main`               | 17   |
| `#FFFFFF` | `palette.white.main`                 | 20   |
| `#1A1C1E` | `palette.darkPrimary.main`           | 23   |
| `#E1E7EA` | `palette.brandGray.main`             | 29   |
| `#404142` | `palette.grey200.main`               | 32   |
| `#57595B` | `palette.grey250.main`               | 35   |
| `#969B9D` | `palette.grey300.main`               | 38   |
| `#D0D4D8` | `palette.grey400.main`               | 41   |
| `#EAECEE` | `palette.grey500.main`               | 44   |
| `#FBFBFB` | `palette.backgroundGrey100.main`     | 47   |
| `#F4F5F6` | `palette.backgroundGrey200.main`     | 50   |
| `#0399ED` | `palette.containedButtonActive.main` | 80   |

Two decoys to watch: `#F4F5F6` is `backgroundGrey200`, **not**
`backgroundGrey300` (`#F5F6F7`); `#0399ED` also answers to
`textLinkActive.main` — prefer `containedButtonActive.main`, the
pressed-affordance token.

---

## Shared conventions — binding on all six components

### Binding accessibility clauses S1–S10

Reproduced from the accessibility-lead review (2026-07-31). These are
**binding**; the per-component contracts below may tighten them, never weaken
them.

- **S1 Native-first.** Every action is a native `<button type="button">` (the
  `type` is mandatory — an untyped button submits an enclosing form). No
  `role="button"` divs anywhere.
- **S2 Wired/static split.** Interactivity is switched on handler presence
  alone. The static branch renders **no role, no tabindex, no ARIA of any kind
  — not even `aria-disabled`** — and both branches render an identical content
  tree (reading order never changes). Exception: `ui-status-badge` static mode
  carries `role="img"` (that is its content semantics, not interactivity).
- **S3 Always-controlled.** State props are coerced (`value ?? default`) so a
  nullish start never flips a component uncontrolled (the `UiRadioGroup`
  footgun). The component NEVER self-flips state and NEVER moves focus on the
  consumer's behalf; next state is fed back through the callback.
- **S4 `aria-disabled` boundary (buttons).** A disabled control is still a
  real, focusable `<button>` with `aria-disabled="true"`; callbacks never fire;
  the hover recipe is suppressed; `cursor: default`; native `disabled` is never
  set — focus is never dropped when a focused control flips disabled
  (SC 2.4.3). Disabled is semantics-first: where Figma ships a disabled column,
  paint it; where it does not, state chrome is kept (3.4 §6.3).
- **S5 Amendment A1 focus ring.** Every focusable root uses the two-selector
  list — the bare `&:focus-visible` (covers disabled and stateful cases) plus a
  second copy repeating the **hover rule's own negations** so it ties hover's
  specificity and, declared later, wins on focused+hovered. The 3.4 reference
  shape (`ui-integration-card/styles.ts:39-40`):
  `'&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-checked="true"])'`.
  Per component, swap the negations for that component's actual hover gate
  (given in each contract). The ring is the inset recipe
  (`inset 0 0 0 2px darkPrimary`), declared **after** hover and after every
  state rule; `outline: none` only inside the ring rule. Forced-colors fallback
  is mandatory:

  ```ts
  '@media (forced-colors: active)': {
    [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
  }
  ```

  The fallback repeats the **same selector list** as the ring rule, and must. A
  media query contributes no specificity, so a bare `&:focus-visible` (0,2,0)
  loses to the ring rule's own negated copy (0,3,0 or 0,4,0) that declares
  `outline: none` — and it loses on the ENABLED control, leaving forced-colors
  users no focus indicator at all while the disabled one keeps its ring. (This
  clause previously printed the bare selector; every component built from it
  carried the defect, which is why it is spelled out here.)

  State chrome and focus chrome are orthogonal channels; neither may substitute
  for the other.

- **S6 No manual Enter/Space key handlers on buttons.** Native buttons already
  fire on both; a manual handler double-fires on Space (3.4 §4.1).
- **S7 Names.** Content-derived accessible names wherever visible text exists
  (SC 2.5.3 — visible text must be contained in the name, preferably at the
  start). Decorative glyphs/SVGs: `aria-hidden="true"` and `focusable="false"`
  on the SVG. Visually-hidden text uses the shared `srOnlySx` clip recipe
  (`field-controls/sr-only.ts`). `aria-label` is permitted only where no
  visible text exists, or where it starts with the visible text (the
  `ui-pagination` "Сторінка ${page}" precedent).
- **S8 Dev warnings.** All via the shared `useDevWarning` (`src/utils/dev-warn.ts`),
  composed as a first-applicable-warning function per component (the 3.4
  `integration-card-warnings.ts` shape), silent in production.
- **S9 No live regions and no transitions** in any state of any 3.5 component
  unless a contract below says otherwise (none does). Announcing the
  consequences of consumer-owned state changes is the consumer's concern.
- **S10 Contrast escalations.** Visual-only contrast findings (state tints,
  pale glyphs) follow the repo pattern: inventory in this artifact and route to
  the accessibility-visuals PR (3.4 Escalations 2/3). Semantics ship complete
  now; contrast debt never blocks semantics but must be logged.

### Rulings that overrule or tighten the planned contracts

1. **`ui-payment-option-card` — one mandatory deviation from "follow 3.4
   exactly."** In 3.4 the logo is decorative (`alt=""`) because the brand _name
   text_ is visible beside it. The payment card has **no visible text** — the
   wordmark image is the only content. Copying 3.4 verbatim produces a nameless
   radio (SC 4.1.2 failure, Critical). Ruling: the logo `<img>` carries
   `alt={name}` and is the accessible name. Everything else follows 3.4
   verbatim.
2. **`ui-action-icon-bar` — `role="group"`, NOT APG toolbar.** `role="toolbar"`
   contractually promises arrow-key roving-tabindex navigation; shipping the
   role without a complete, tested roving implementation is worse than no role.
   This repo has zero roving-tabindex precedent and 3.4 explicitly rejected
   composite focus managers (§4.3). With at most six controls, tab-stop
   reduction buys almost nothing. A toolbar upgrade may be a future story,
   never a partial one.
3. **`ui-pin-input` — per-cell native inputs win; disabled uses
   `readOnly` + `aria-disabled`, not no-op handlers.** The repo boundary
   pattern ("focusable, handlers no-op, native `disabled` never set") is a
   _button_ mechanism. Text inputs need `readOnly` to become non-editable while
   staying focusable. Same boundary intent (SC 2.4.3 — focus never dropped)
   with the input-appropriate mechanism. Native `disabled` remains forbidden.
4. **`ui-status-badge` — dual-mode.** Static = `role="img"` with a required
   label; interactive (when `onToggle` is present) = native toggle button with
   `aria-pressed`. The 3.4 rule "the static branch never renders state it
   cannot expose programmatically" is _satisfied_ in static mode because
   `role="img"`'s label IS the exposure channel — so static+active is legal,
   with the burden on the label text.
5. **`ui-notification-badge` — plural-free name format.** "1 unread" embeds
   English pluralization; Ukrainian plural forms make a baked plural word a
   localization defect. Default name format is `"Сповіщення: 1"`. When the
   visible counter caps at `9+`, the accessible name must use the **same
   display string** (`"Сповіщення: 9+"`), not the raw count (SC 2.5.3). No live
   region, confirmed and binding.
6. **`ui-filter-chip` — the whole chip is ONE remove button.** Removal is the
   only interaction, so a nested 24px x-button inside a non-interactive pill is
   rejected: it shrinks the target for no reason and creates a two-element tab
   experience for one action. The full 30px pill is the button (≥24px,
   SC 2.5.8 pass).
7. **Language of defaults.** Figma Board A text is Russian; repo default
   strings are Ukrainian (the `ui-pagination` defaults 'Попередня',
   'Наступна', 'Пагінація').
   All built-in default strings in 3.5 MUST be Ukrainian. User-supplied content
   in another language uses the optional `lang` passthrough where the component
   grants one (3.4 precedent, SC 3.1.2).

### Repo mechanics that apply to all six

- **Wired/static split** is switched on the single callback prop, evaluated in
  the view-model hook (`use-integration-card.ts:51` precedent). The wired
  branch and the static branch render the **same content tree**.
- **`aria-disabled` boundary idiom** — no shared helper, one line:
  `ariaDisabled: interactive && disabled ? true : undefined`. Activation is
  gated in the model (`makeActivate`), never in the DOM.
- **Always-controlled** — `selected ?? false`, `value ?? ''`, `count ?? 0`.
  No component holds its own state; the only internal state permitted anywhere
  in 3.5 is `ui-pin-input`'s DOM focus target (refs, not React state).
- **`sx` merged last** on the root, array form, the 3.4 assembler shape:

```ts
export function filterChipSx(config: FilterChipStyleConfig): SxProps<Theme> {
  const base: object = { ...CHIP_BASE, ...(config.interactive ? interactiveChipSx() : null) };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
```

- **Class hooks** are consts in `styles.ts`, format `ui-<component>__<part>`
  (e.g. `export const CHIP_GLYPH_CLASS: string = 'ui-filter-chip__glyph';`).
  Descendant chrome is driven from the root through these hooks.
- **Attribute-selector state chrome.** All state chrome keys off ARIA
  attributes (`[aria-checked]`, `[aria-pressed]`, `[aria-disabled]`,
  `[aria-invalid]`, `[aria-expanded]`), **never off classes and never off
  React-conditional style objects** — the 3.4 mechanism that makes unexposed
  state unpaintable by construction.
- **No transitions.** Figma specifies none for any of the six; ship none. No
  `prefers-reduced-motion` branch is needed as a result.
- **Geometry-stable states.** Borders are always declared and only their colour
  swaps; `minHeight` never `height`; sizes in `rem`; `letterSpacing: 0` always
  explicit; typography inline in `styles.ts`, never `<Typography variant>`.
- **Ukrainian defaults** for every built-in string (Ruling 7); the showcase and
  stories use the Figma sample content where a baseline depends on it.
- **Loaded fonts** — Golos Text 400/500/600/700/800/900; Inter **400/500/700
  only** (Inter 600 is not loaded). 3.5 needs Inter 500 and Golos 700, both
  loaded: **no font work**.
- **Images** — `<Box component="img" src alt width height decoding="async" draggable={false} sx>`
  with intrinsic attributes reserving the box.
- **No prop spreading** (`jsx-props-no-spreading` is an error and the
  exceptions list does not cover new components) — thread every prop
  explicitly. No `data-testid` in `src/` — expose a stable `id`; tests query by
  role/label/text.
- **`rca` budgets** (`config/metrics-policy.json`, hard block): per function
  `lloc_function` **10**, `nargs` **3**, `nexits` **3**, cyclomatic 10,
  cognitive 15, abc 17; per file `lloc_file` **120**, `nom_total` **15** (10
  functions / 6 closures). These force `Readonly<{config}>` single-object
  params and multi-file components — the file plans below are sized for them.
- **`dependency-cruiser`** — runtime edges between components must go through
  `index.ts`; **type-only** edges are exempt (this is what lets
  `ui-payment-option-card` reuse the `IntegrationLogo` type). Directories and
  files kebab-case; exported identifiers `Ui*` PascalCase; `displayName` set
  explicitly.

---

## 1. `ui-filter-chip`

Figma "Tags" master `397:19014`, board row y = 755. `get_metadata` returns
**byte-identical child geometry for all four states** — the frame is 256×30 in
every column and the children never move.

### Invariant box model

| Property        | Figma                 | CSS / rem                              |
| --------------- | --------------------- | -------------------------------------- |
| display         | flex row              | `inline-flex`                          |
| align-items     | **flex-start**        | `flex-start` (see A3 below)            |
| gap             | 8px                   | `0.5rem` (label row → glyph box)       |
| padding (outer) | 5px 8px               | `4px 7px` over the constant 1px border |
| border          | 1px **inside** stroke | `1px solid …` always, `border-box`     |
| border-radius   | 4px                   | `0.25rem`                              |
| height          | 30px                  | `minHeight: 1.875rem`                  |
| width           | 256px = hug contents  | auto — 256 is the sample string only   |
| overflow        | visible               | — (the 20px glyph box clips itself)    |

**Inside-stroke → CSS-border compensation.** Figma strokes inside, so the
hover/active 1px border neither grows the box nor pushes the children (they
stay at x=8 / y=5 in every state). With `box-sizing: border-box`:
`border: 1px solid <colour|transparent>; padding: 4px 7px;` →
width 1+7+212+8+20+7+1 = 256 ✓, height 1+4+20+4+1 = 30 ✓. Per the no-jitter
law keep `border: 1px solid transparent` at rest and disabled rather than
adding a border only on hover/active.

**Label row** (`Frame 377`, 212×18): flex row, `align-items: center`,
`gap: 4px` (`0.25rem`), `white-space: nowrap`. Two text nodes with **different
colours** → two props, not one string: prefix 56×18 (`Фильтр:`) and value
152×18 (`Комментар - “клиент”`, curly quotes U+201C/U+201D).

**Glyph box** (`0:7`): 20×20 (`1.25rem`), `flex-shrink: 0`, `overflow: clip`;
inner leaf inset 29.17% → 8.333px at 5.833px; painted extent 5.0 → 15.0 (a
10×10 paint box); stroke-width 1.66667px; round caps/joins; `fill: none`.

### Per-state chrome

| Part        | rest          | hover         | active                  | disabled    |
| ----------- | ------------- | ------------- | ----------------------- | ----------- |
| pill bg     | `grey500`     | `white`       | `white`                 | `grey500`   |
| pill border | transparent   | `grey400`     | `grey300`               | transparent |
| pill shadow | none          | `CHIP_SHADOW` | `CHIP_SHADOW`           | none        |
| prefix ink  | `grey250`     | `grey250`     | `grey250`               | `grey300`   |
| value ink   | `darkPrimary` | `darkPrimary` | `darkPrimary`           | `grey300`   |
| glyph ink   | `grey300`     | `primary`     | `containedButtonActive` | `grey300`   |
| geometry    | baseline      | identical     | identical               | identical   |

`CHIP_SHADOW = '0 4px 4px rgba(26, 27, 36, 0.09)'` — see the off-palette
ruling. Figma exports it as a `drop-shadow()` filter; `box-shadow` is
pixel-equivalent on an opaque rounded rect, far cheaper, and does not create a
containing block. Opacity is 1 in every state — disabled swaps colours
explicitly, it never dims. In the disabled node Figma hoists the grey onto the
label-row container; implement it as an explicit **per-segment** colour
override, not as inheritance.

### Typography

Both segments: Inter **500**, `fontSize: '0.875rem'`, `lineHeight: '1.125rem'`,
`letterSpacing: 0`. Prefix `grey250`, value `darkPrimary` (both `grey300` when
disabled).

### Glyph

All four state exports are the same path with a different stroke. Mapped into
the repo's 20px `Glyph` wrapper (`field-controls/glyph.tsx`, which already
emits `fill="none"`, `stroke="currentColor"`, round caps/joins and takes
`path`/`viewBox`/`strokeWidth`/`width`/`height`):

```ts
export const X_CLOSE_PATH: string =
  'M14.16667 5.83333L5.83333 14.16667M5.83333 5.83333L14.16667 14.16667';
// <Glyph path={X_CLOSE_PATH} viewBox="0 0 20 20" strokeWidth="1.667" width="20" height="20" />
```

Derivation: the exported 10-unit viewBox maps 1 unit = 1px inside the 20px box
offset by +5px, so `0.833333 → 5.83333` and `9.16667 → 14.16667`. **This is NOT
the stock Untitled-UI `x-close`** (`M18 6L6 18M6 6L18 18`) — the arms are one
24-unit step shorter each side. Do not silently substitute an existing 24px
x-close asset. Colour arrives through `currentColor` on the wrapper, driven by
attribute selectors on the root. No SVG asset is committed.

### Binding a11y contract

**Role.** ONE native `<button type="button">` spanning the entire 30px pill.
The chip's single action is _remove this filter_. No inner interactive
elements. No list semantics (`listitem` etc.) — the consumer owns any
surrounding list structure, exactly as the consumer owns the radiogroup in 3.4.

**Accessible name.** Content-derived, in this exact DOM order: (1) the visible
label text, (2) a visually-hidden span (`srOnlySx`) with the remove suffix —
default `', видалити фільтр'`, overridable via `removeLabel`. Name = visible
text first, removal semantics appended (SC 2.5.3 satisfied by construction).
`aria-label` on the root is **forbidden** — it would overwrite the visible
text. **Refinement (not a weakening):** Figma paints the label as two
differently-coloured segments, so the visible text is two spans (`label` then
`filterValue`) inside one label row; the name is their concatenation followed
by the hidden suffix, still fully content-derived.

**ARIA state mapping.** None. No `aria-pressed`, no `aria-checked`, no
`aria-expanded` — a plain action button. `aria-disabled` per S4 only.

**Keyboard.** Tab to the chip; Enter/Space (native) fires `onRemove`. No manual
key handlers (S6). No Delete/Backspace shortcut — undiscoverable and
unnecessary.

**Focus.** Amendment A1 (S5); hover gate `&:hover:not([aria-disabled="true"])`,
so the selector list is
`'&:focus-visible, &:focus-visible:not([aria-disabled="true"])'`.

**Focus after removal (binding consumer note in `types.ts` JSDoc).** The chip
unmounts on removal and never moves focus itself (S3). The JSDoc MUST instruct
consumers to move focus on removal to the next chip, the previous chip, or the
filter-region heading — otherwise focus drops to `<body>` (SC 2.4.3).

**Wired/static.** `onRemove` presence is the switch. Without it: a static
`<div>`, no ARIA, the × glyph still rendered decoratively (the `ui-item-row`
chevron precedent).

**Glyph.** `aria-hidden="true"`, never focusable, never an `<svg>` with a
`<title>`.

**Disabled.** S4. **Error:** N/A. **Size/variant:** N/A — one 30px master.
`onChange` → `onRemove()` (bare, payload-free — one path, one direction; close
over the filter id when mapping). `value` N/A (a chip has no value axis; its
existence is its state). `lang` passthrough supported (filter values are user
content).

**Dev warnings.** (a) blank `label` **and** blank `filterValue` → no accessible
subject for the removal action; (b) blank `removeLabel` override → the name
loses its action semantics.

### Public API sketch

```ts
export interface UiFilterChipProps {
  label: string;
  filterValue: string;
  removeLabel?: string;
  onRemove?: () => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
  sx?: SxProps<Theme>;
}
```

JSDoc obligations on `types.ts` (the 3.4 `types.ts:58-68` shape — the doc
comment carries the whole contract): the two-segment name construction and the
`aria-label` prohibition; the `removeLabel` default `', видалити фільтр'`; the
**focus-after-removal consumer duty**; the ⛔ rationale for `value`, `error`,
`size`, `variant`; `onRemove` presence as the wired/static switch.

### File plan

| File                      | Contents                                                   |
| ------------------------- | ---------------------------------------------------------- |
| `types.ts`                | Props + the full contract doc comment. Type-only.          |
| `styles.ts`               | Palette consts, `CHIP_SHADOW`, class hooks, `filterChipSx` |
| `filter-chip-content.tsx` | The shared DOM tree (label row + hidden suffix + glyph)    |
| `chip-glyph.tsx`          | `X_CLOSE_PATH` + the nullary `ChipGlyph` component         |
| `filter-chip-warnings.ts` | Pure `props -> string \| null`, default export             |
| `use-filter-chip.ts`      | View model (`interactive`, `ariaDisabled`, `activate`)     |
| `index.tsx`               | `WiredChip`/`StaticChip` shells + `forwardRef` default     |
| `filter-chip.stories.tsx` | `UiComponents/UiFilterChip`                                |

### Test plan — `tests/unit/ui-filter-chip.test.tsx`

Describe blocks (3.4 structure): wired button semantics · static chip (zero
buttons, attribute-level zero-ARIA sweep) · removal requests (exactly-once per
click/Enter/Space; declined removal leaves the chip eligible) · disabled
boundary (native `disabled` never set, focus retained when a focused chip flips
disabled, no `onRemove` while disabled — real events) · accessible name (equals
`label + filterValue + removeLabel`, visible text first; **no `aria-label`
anywhere in the tree**) · live-region prohibition sweep · dev warnings incl.
production silence · consumer `sx` merge · `filterChipSx` assembly
(mutation-killing style-literal pins: `CHIP_SHADOW` exact string, the constant
`1px solid transparent` border, `4px 7px` padding, `0.25rem` radius, Inter 500
`0.875rem`/`1.125rem`, the Amendment-A1 two-selector list verbatim) · glyph
recipe (`X_CLOSE_PATH` exact string, `strokeWidth="1.667"`, `aria-hidden`).

### Showcase plan

Group file `filter-chip-group.tsx`, Ukrainian title **«Чіп фільтра»**, width
**256** (the Figma master). Tiles: `Rest` · `Hover` (forced via
`FILTER_CHIP_HOVER_SX`) · `Active` (forced via `FILTER_CHIP_ACTIVE_SX`) ·
`Focus` (forced ring) · `Disabled` · `Static`. The fixture must use the exact
Figma sample text (`Фильтр:` / `Комментар - “клиент”`, curly quotes) so the
baseline matches the master.

### Ambiguities carried forward

- **A2 — "active" = `:active` (pressed).** Active is hover plus one darker step
  on border and glyph; treated as the pressed state throughout. There is no
  Figma source for a persistent "applied filter" variant — do not invent one.
- **A3 — 1px vertical mis-centring is faithful.** Root `align-items:
flex-start` with an 18px label row and a 20px glyph box both starting at y=5
  puts the label's optical centre 1px above the glyph's. Keep `flex-start`;
  `center` would diverge from the Figma pixels.
- **A4 — width hugs contents.** 256px is only what the sample string measures.
  `white-space: nowrap` is the operative rule (the label row also carries a
  contradictory `overflow-wrap: break-word`); truncation/ellipsis is out of
  scope — Figma specifies none.

---

## 2. `ui-pin-input`

Figma "2FA item", component-set master `72:5172` (`State = Rest | Hover |
Active | Disabled`), board row y = 895. **The 64×86 master IS one digit cell** —
a single tall rounded rectangle whose only child is the centred "0". There is
no label/hint slot in the master, and no multi-cell group spec exists.

### Invariant cell box

| Property      | Figma | rem        | Notes                                        |
| ------------- | ----- | ---------- | -------------------------------------------- |
| width         | 64    | `4rem`     | fixed                                        |
| height        | 86    | `5.375rem` | fixed (use `minHeight`)                      |
| border-radius | 12    | `0.75rem`  | uniform                                      |
| border-width  | 1     | —          | inside stroke → `border-box`, no padding fix |
| padding       | 0     | —          | the digit is optically centred, not laid out |

Digit / placeholder layer, identical typography in all four states: Golos Text
**700**, `fontSize: '1.375rem'` (22px), `lineHeight: '1.625rem'` (26px),
`letterSpacing: 0`, `text-align: center`, glyph box 15×26 at (24, 29). Figma's
`calc(50% − 0.5px)` / `calc(50% − 1px)` offsets are sub-pixel rounding —
implement as plain flex centring, do not port the half-pixel nudges.

### Per-state chrome

| Part          | rest        | hover     | active (focus)     | disabled   |
| ------------- | ----------- | --------- | ------------------ | ---------- |
| background    | `white`     | `white`   | `white`            | `grey500`  |
| border colour | `brandGray` | `grey400` | `brandGray`        | `grey500`† |
| box-shadow    | none        | none      | `PIN_FOCUS_SHADOW` | none       |
| digit ink     | `grey400`   | `grey400` | `grey400`          | `grey400`  |
| caret         | —           | —         | 2×26 `primary`     | —          |

† Figma genuinely deletes the stroke on disabled. Porting that literally would
shift the content box by 1px per edge and break the no-jitter law. **Ruling:**
keep `border: 1px solid` always and swap the colour to the disabled fill
(`grey500`), which is pixel-identical to a borderless `#EAECEE` cell (verified
by pixel histogram: the disabled PNG contains only `#EAECEE` and the `#D0D4D8`
digit).

`PIN_FOCUS_SHADOW = '0 7px 12px rgba(76, 90, 126, 0.15)'` — the module's single
tolerated raw colour literal, commented per the 3.1 recipe convention. It is a
**different** shadow from `ui-item-row`'s `LANDING_SHADOW` and from
`ui-filter-chip`'s `CHIP_SHADOW`; do not reuse either. Shadow bleed verified
independently: the active node renders 88×110 vs the 64×86 box (12px left/
right, 5px top, 19px bottom = blur 12 ± offsetY 7). Rest, hover and disabled
all render at exactly 64×86 → **no shadow on any state but active**.

**Caret.** Figma paints a 2×26 `#1EAEFF` bar at cell-relative left 21px / top
29.5px (pixel-verified: blue columns x = 21, 22; rows 29.5 → 55.5). The digit
does **not** move between rest and active (x = 24 in both). **Ruling:** because
Ruling 3 mandates real `<input>` cells, the caret is the browser's own text
cursor — set `caretColor: palette.primary.main` on the input and do **not**
paint a decorative span (a painted caret plus the native one double-draws). The
native caret is 1px wide where Figma draws 2px; recorded as a documented
deviation for the parity reviewer (open question Q3).

**Active = focus.** The caret is a text cursor, which only appears on focus.
Board A's "Active" column maps to the cell's **focused** state (shadow +
caret); no separate `:active` pressed style exists. The Amendment-A1
`:focus-visible` ring ships **in addition** to the Figma caret+shadow (Figma
provides no focus-ring spec, and a caret alone is not a 3:1 indicator).

**Entered-digit colour is unspecified by the design** — all four masters show
the same grey `#D0D4D8` "0". **Ruling:** `grey400` for the empty placeholder,
`darkPrimary` for an entered digit (matching every other text input in the
kit); recorded as a deviation-by-omission (open question Q2).

**Inter-cell gap is unspecified by the design** (the master is one cell; no
group, no gap, no separator). **Ruling:** `gap: 0.75rem` (12px), matching the
icon-bar rhythm; flagged for design confirmation (open question Q1). Do not
expose a `gap` prop — there is no variant axis.

### Binding a11y contract

**Structure.** N separate native
`<input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}>` cells
(never `type="number"`), wrapped in a `role="group"`. One-grouped-input is
rejected: the design paints discrete cells, and per-cell inputs give correct
caret, per-digit announcement and native forms-mode behaviour.
`autoComplete="one-time-code"` on the **first cell only**; OS OTP autofill plus
the paste handler covers distribution.

**Group labeling.** The `role="group"` wrapper carries the accessible name from
a required `label` prop (`aria-label`, or `aria-labelledby` when the consumer
renders a visible label — both supported, the `ui-radio-group` precedent). Each
cell carries `aria-label` from
`cellLabel?: (index: number, length: number) => string`, default
`` `Цифра ${index} з ${length}` `` (1-based). No visible per-cell text, so
`aria-label` is legal (S7).

**Value model.** Always-controlled: `value?: string` coerced `?? ''`,
`onChange(next: string)` with the full concatenated string. `length` prop,
default 6, minimum 1. **No `onComplete`** — consumers compare
`next.length === length`.

**Keyboard (binding, exhaustive).**

- Typing a digit fills the cell and moves focus to the next cell (no move from
  the last cell). Non-digit input is rejected (no value change, no advance).
- Backspace on a filled cell clears it, focus stays. Backspace on an empty cell
  moves focus to the previous cell and clears it. Delete clears the current
  cell, focus stays.
- ArrowLeft/ArrowRight move focus one cell. Cells select their content on focus
  so typing overwrites.
- Paste (into any cell): strip non-digits, distribute starting at the focused
  cell, truncate at `length`, focus the cell after the last one filled (or the
  last cell).
- All cells remain in the natural tab order. **No roving tabindex** — real
  inputs must stay reachable in screen-reader forms mode; arrows are a
  convenience layer, not the only path.

**Error semantics (field-controls contract, binding).** `error?: boolean` →
`aria-invalid="true"` on **every** cell. `helperText?: ReactNode` → rendered
once below the group as `FormHelperText`, linked via
`aria-describedby={helperTextId}` on **every** cell (per-cell announcement is
intentional). Dev-warn `error` without `helperText` (exact
`useFieldAccessibilityWarnings` semantics). Error is never colour-only: the
helper text is the non-colour signal.

**Disabled (mechanism deviation, Ruling 3).** Every cell gets `readOnly` +
`aria-disabled="true"`; `onChange` never fires; caret and hover chrome
suppressed; native `disabled` forbidden. The group wrapper itself carries no
`aria-disabled` (it is not a widget role).

**Focus.** Amendment A1 per cell; hover gate
`&:hover:not([aria-disabled="true"])` →
`'&:focus-visible, &:focus-visible:not([aria-disabled="true"])'` (add
`:not([aria-invalid="true"])` to the second copy only if the error rule uses
hover-level specificity). Forced-colors fallback per S5.

**Shared contract exceptions.** `size`/`variant` N/A (one cell master).
`required` supported → `aria-required="true"` on the **first cell only** (one
announcement, not N). Autofill/paste and typed entry MUST hit the same
validation path (the 2.4A file-upload lesson: validate both entry paths).

**Dev warnings.** (a) missing accessible group name (no `label` /
`labelledBy`); (b) `error` without `helperText`; (c) `value` longer than
`length` or containing non-digits (value is clamped/filtered, warn);
(d) `length < 1` (normalized to 1, warn).

### Public API sketch

```ts
export interface UiPinInputProps {
  label?: string;
  labelledBy?: string;
  value?: string;
  onChange?: (next: string) => void;
  length?: number;
  cellLabel?: (index: number, length: number) => string;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  sx?: SxProps<Theme>;
}
```

JSDoc obligations: the always-controlled contract and the "no `onComplete`"
rationale; the exhaustive keyboard table; `readOnly + aria-disabled` as the
disabled mechanism (native `disabled` forbidden) with the SC 2.4.3 reason; the
`error`+`helperText` pairing duty; the `required` → first-cell-only rule; the
⛔ rationale for `size`/`variant`.

### File plan

| File                    | Contents                                                      |
| ----------------------- | ------------------------------------------------------------- |
| `types.ts`              | Props + contract doc comment. Type-only.                      |
| `styles.ts`             | `PIN_FOCUS_SHADOW`, class hooks, cell + group `sx` assemblers |
| `pin-value.ts`          | Normalise/clamp/filter, `charAt`, `withDigitAt`               |
| `pin-keyboard.ts`       | Key → intent mapping (digit, Backspace, Delete, arrows)       |
| `pin-paste.ts`          | Paste distribution + resulting focus index                    |
| `pin-cell-refs.ts`      | Cell ref array + `focusCell(index)` (the only focus mover)    |
| `use-pin-input.ts`      | View model composing the above; `useDevWarning` first line    |
| `pin-input-warnings.ts` | Pure `props -> string \| null`, default export                |
| `pin-cells.tsx`         | The N `<input>` cells + caret/ink chrome                      |
| `index.tsx`             | Group wrapper + helper text + `forwardRef`                    |
| `pin-input.stories.tsx` | `UiComponents/UiPinInput`                                     |

The split is the `ui-profile-select-card` "split it further" precedent, sized
for `lloc_function 10` / `nexits 3` — the keyboard branch table alone cannot
live in one function.

### Test plan — `tests/unit/ui-pin-input.test.tsx`

Group semantics (`role="group"` named from `label`, `aria-labelledby`
alternative) · per-cell semantics (`inputMode`, `pattern`, `maxLength`,
`autoComplete` on cell 0 only, `aria-label` from the default and from a custom
`cellLabel`) · always-controlled value (nullish → `''`; over-long and non-digit
`value` clamped + warned) · typing (advance, no advance from the last cell,
non-digit rejected, `onChange` payload is the full string) · Backspace/Delete/
Arrow matrix · paste (strip, distribute, truncate, resulting focus) · error
contract (`aria-invalid` on **every** cell, `aria-describedby` on every cell,
warn without `helperText`) · disabled boundary (`readOnly` + `aria-disabled` on
every cell, **native `disabled` never set**, focus retained on flip, no
`onChange`) · `required` on the first cell only · static branch (no `onChange`
→ zero ARIA sweep) · live-region prohibition · dev warnings + production
silence · pure-module tests for `pin-value`/`pin-keyboard`/`pin-paste` ·
style pins (`PIN_FOCUS_SHADOW` exact string, `0.75rem` radius, `4rem`/`5.375rem`
box, Golos 700 `1.375rem`/`1.625rem`, `caretColor` = `#1EAEFF`, the constant
1px border with colour-only swaps, the two-selector ring).

### Showcase plan

Group file `pin-input-group.tsx`, Ukrainian title **«Поле PIN-коду (2FA)»**,
width **64** for single-cell tiles (the Figma master). Tiles: `Rest` ·
`Hover` (`PIN_CELL_HOVER_SX`) · `Active` (`PIN_CELL_FOCUS_SX` — shadow + caret)
· `Disabled` · `Error` · `Group (6 cells)` at the ruled 12px gap. The forced
tiles target the cell class hook so the group builder stays one component.

---

## 3. `ui-payment-option-card`

Board row y = 1004. **Brand ≠ state:** only the active master carries
WAYFORPAY; that is a content swap the designer made to show a second provider,
not part of the selected chrome. Every measurement is split into STATE chrome
(card box + circle) and BRAND content (logo box).

### Invariant box model

| Property             | Figma             | CSS / rem                                     |
| -------------------- | ----------------- | --------------------------------------------- |
| card size            | 279×90            | `width: 100%`, `minHeight: 5.625rem`          |
| card radius          | 8                 | `0.5rem`                                      |
| selection circle     | 20×20             | `1.25rem`, `borderRadius: '50%'`              |
| circle offset(outer) | left/top 12       | `left/top: 11px` over the constant 1px border |
| logo box — LIQPAY    | 116×24 @ (82, 33) | centred on the **card** axis                  |
| logo box — WAYFORPAY | 187×67 @ (46, 12) | centred on the **card** axis                  |
| shadow               | none              | no state has one                              |
| text                 | none              | zero text nodes — imagery only                |

**Layout consequence.** The circle is anchored top-left and the logo is centred
on the **card's own axis**, not on the space to the right of the circle (Figma
writes `left: calc(50% + 0.5px)`). A naive flex row would push the logo ~16px
off-centre. Correct structure: `position: relative` card + absolutely
positioned circle + a centred logo layer.

**Inside-stroke compensation.** `get_design_context` reports the circle at
12 / 11 / 10 for the 0 / 1 / 2px border states while `get_metadata` reports a
constant (12, 12): the circle never moves relative to the card's **outer**
edge. With a real CSS border, subtract the border width from the offset (the
3.2/3.4 precedent).

### Per-state chrome

Token names below are `palette.<name>.main`; `bgGrey200` abbreviates
`backgroundGrey200`. No state has a shadow.

| Part          | rest          | hover       | selected        | disabled      |
| ------------- | ------------- | ----------- | --------------- | ------------- |
| card bg       | bgGrey200     | white †     | white           | bgGrey200     |
| card border   | 1px bgGrey200 | 1px primary | primary +ring   | 1px bgGrey200 |
| circle bg     | white         | white       | white           | brandGray     |
| circle border | 1px grey400   | 1px primary | **5px primary** | none          |
| logo art      | full colour   | full colour | full colour     | flat grey400  |

† Frame 139 declares no fill at all. The render cannot settle transparent vs
white. **Ruling: hover is `white`** — hover is the transitional step toward
selected (which IS explicitly white), and a transparent card would inherit the
consumer surface and break the rest→hover→selected progression (open
question Q6).

**The 0/1/2px border ladder must not ship literally** (it would reflow the
content box by 2px between rest and selected). **Ruling:** always
`border: 1px solid <c>` — `c` = `backgroundGrey200` at rest/disabled (invisible
against the identical card fill), `primary` on hover and when selected — and
the selected state adds `boxShadow: 'inset 0 0 0 1px <primary>'` for the second
pixel. The focus ring composes as a further `box-shadow` layer exactly as 3.4
does. Call this out in the `styles.ts` header comment the way
`ui-integration-card/styles.ts:6-7` does.

**The circle's checked distinction is border WIDTH (1px → 5px), not colour** —
byte-identical to the 3.4 `UiIntegrationCard` radio-dot recipe
(`styles.ts:93-107` unchecked, `:44-46` `CHECKED_GLYPH`). Reuse it verbatim,
including the forced-colors reason. The **one** divergence from 3.4: the
disabled circle is a solid `brandGray` disc with no stroke, where 3.4 keeps a
stroked glyph.

```ts
// rest
{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', boxSizing: 'border-box',
  backgroundColor: palette.white.main, border: `1px solid ${palette.grey400.main}` }
// hover    -> border: `1px solid ${palette.primary.main}`
// checked  -> border: `5px solid ${palette.primary.main}`
// disabled -> backgroundColor: palette.brandGray.main, border: 'none'
```

Orthogonality: selected+hover and selected+disabled are not drawn. Following
the 3.4 contract, selected chrome wins on the card border and the circle, and
hover on a selected card is a **no-op** — the visual test asserts selected+hover
is pixel-identical to selected.

### Brand assets

Downloaded to
`…/scratchpad/story-3-5/assets/payment-logos/`:

| File                            | Intrinsic      | Purpose                               |
| ------------------------------- | -------------- | ------------------------------------- |
| `liqpay-color.svg`              | 115.229×23.792 | LIQPAY enabled mark (8 gradients)     |
| `liqpay-grey.svg`               | 115.229×23.792 | LIQPAY disabled mark (9 flat paths)   |
| `liqpay-color-2x.png`           | 232×48         | base64 payload (2× the 116×24 box)    |
| `liqpay-grey-2x.png`            | 232×48         | disabled payload                      |
| `wayforpay-active.png`          | 1214×236       | RAW composite strip — **do not ship** |
| `wayforpay-wordmark-native.png` | 661×236        | crop (553,0,1214,236) Figma displays  |
| `wayforpay-wordmark-2x.png`     | 374×134        | base64 payload (2× the 187×67 box)    |

The WAYFORPAY crop keeps ~50px of left and ~51px of right padding — that is
what Figma renders; tightening to the ink box grows the mark ~8%. Aspect check:
661/236 = 2.801 vs the 187/67 = 2.791 box (0.35% off, sub-pixel).

**Disabled logo is an ASSET swap, not a filter** — `filter: grayscale(1)` and
`opacity` both miss `#D0D4D8` badly. **Ruling:** the brand payload carries both
marks, `logoDisabled` optional and falling back to `logo`, so a brand with no
grey variant still renders sensibly (open question Q7 — this is a public API
decision, recorded in the prop table, never in `styles.ts`).

### Binding a11y contract

3.4 verbatim, plus the Ruling-1 name deviation. Binding restatement:

- The wired card is ONE native `<button type="button" role="radio">` spanning
  the whole 279×90 card, with **permanent** `aria-checked` (never removed,
  never mixed). `aria-pressed` is **forbidden**.
- The card NEVER renders `role="radiogroup"`; group role, group name,
  `aria-setsize`/`aria-posinset` belong to the consumer. A wired card with no
  `[role="radiogroup"]` ancestor dev-warns (the 3.4 §12.2 `closest()`
  mount-effect mechanism).
- Each wired card is an independent tab stop in DOM order; no roving tabindex,
  no arrow keys, no key handlers at all (S6).
- Wired/static split on `onSelect` presence; the static branch is a bare
  `<div>` (S2) and never paints `selected` (dev-warn).
- `selected` coerced `?? false` (S3); activating an already-selected card fires
  nothing; a declined selection leaves the card eligible.
- Disabled: the S4 boundary; selected+disabled keeps the full selected chrome
  (blue ring/border) — nothing is dimmed beyond what Figma's disabled master
  draws, and that master is painted where it exists.
- **Name (deviation):** `name: string` is required; the brand `<img>` carries
  `alt={name}` and is the entire accessible name. `name` must transcribe the
  visible wordmark ("LiqPay", "WayForPay") — SC 2.5.3. **No `aria-label`
  anywhere in the tree.**
- The leading selection circle is `aria-hidden` CSS paint, never an `<input>`,
  never focusable; checked state reaches AT through `aria-checked` alone. Keep
  the checked/unchecked distinction as border WIDTH — do not refactor it into a
  colour-only change (forced-colors survival).
- The selected blue ring keys off `[aria-checked="true"]` in styles — never off
  a class — so the static branch cannot paint it by construction.

**Focus.** Amendment A1 with the exact 3.4 selector list:
`'&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-checked="true"])'`;
ring declared after hover and after the checked rule; forced-colors fallback
per S5. A focused selected card shows the blue border AND the ring at once.

**Shared contract.** `value` → `selected`; `onChange` → `onSelect()` bare;
`disabled` → S4; `error` N/A (validation is the group's); `size`/`variant` N/A;
`sx` merged last. `lang` N/A — brand wordmarks are proper nouns.

**Dev warnings.** (a) `selected` without `onSelect` (static branch, not
painted); (b) blank `name` (nameless radio); (c) unusable logo bundle; (d) a
wired card without a `[role="radiogroup"]` ancestor.

### Public API sketch

```ts
import type { IntegrationLogo } from '../ui-integration-card/types';

export interface UiPaymentOptionCardProps {
  name: string;
  logo: IntegrationLogo;
  logoDisabled?: IntegrationLogo;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  id?: string;
  sx?: SxProps<Theme>;
}
```

`IntegrationLogo` is reused, not cloned — a **type-only** cross-component edge,
explicitly exempt from the `components-public-api` dep-cruiser rule, and it
keeps "a dimensionless logo is unrepresentable by construction". The type is
re-exported from the payment card's barrel line only if the drift-guard test
needs it; prefer the existing `ui-integration-card/types` export.

JSDoc obligations: the Ruling-1 `alt={name}` name channel and why it differs
from 3.4; the consumer-owned radiogroup boundary; the bare `onSelect` payload
rationale; the border-WIDTH forced-colors property; the ⛔ rationale for
`error`/`size`/`variant`/`lang`.

### File plan

| File                              | Contents                                           |
| --------------------------------- | -------------------------------------------------- |
| `types.ts`                        | Props + contract doc comment. Type-only.           |
| `styles.ts`                       | Card/circle/logo recipes, `paymentOptionCardSx`    |
| `payment-logo.ts`                 | Bundle validation + enabled/disabled resolution    |
| `payment-card-content.tsx`        | Circle + centred logo layer (both branches)        |
| `payment-card-warnings.ts`        | Pure `props -> string \| null`, default export     |
| `use-payment-card.ts`             | View model                                         |
| `use-payment-card-ref.ts`         | Ref plumbing + the radiogroup-ancestor mount check |
| `index.tsx`                       | `WiredCard`/`StaticCard` + `forwardRef`            |
| `payment-option-card.stories.tsx` | `UiComponents/UiPaymentOptionCard`                 |

### Test plan — `tests/unit/ui-payment-option-card.test.tsx`

Mirrors the 3.4 suite: wired radio semantics (`role="radio"`, `aria-checked`
mirrors `selected` across controlled re-renders, **no `aria-pressed`**, exactly
one focusable element) · static card (zero buttons, zero ARIA sweep, rest
presentation even with `selected`, plus the warning) · selection requests
(exactly-once per click/Enter/Space; already-selected fires nothing; declined
selection stays eligible) · disabled boundary with focus retention · accessible
name **equals `name`** and comes from `alt`, with the image hygiene set
(`width`/`height` attributes, `decoding="async"`, `draggable={false}`, no
`loading="lazy"`) and **no `aria-label` anywhere** · disabled logo resolution
(`logoDisabled` used when present, fallback when absent, unusable bundle paints
no `<img>` and warns) · live-region sweep · the four dev warnings incl. the
radiogroup-context matrix and production silence · `paymentOptionCardSx`
assembly with mutation-killing pins (constant `1px` border, the selected
`inset 0 0 0 1px` second pixel, the `5px` checked circle, `0.5rem` radius,
`5.625rem` minHeight, the exact two-selector ring list).

### Showcase plan

Group file `payment-option-card-group.tsx`, Ukrainian title **«Картка способу
оплати»**, width **279**. Tiles: `Rest` (LiqPay) · `Hover` (forced via
`PAYMENT_CARD_HOVER_SX`, keeping the `:not([aria-checked="true"])` gate) ·
`Selected` (WayForPay, the Figma active master) · `Selected + Hover` (must be
pixel-identical to `Selected`) · `Disabled` (LiqPay grey mark) · `Static`.
Wired tiles sit inside a consumer-owned `role="radiogroup"` wrapper so the
dev-warning stays silent and the composition is modelled correctly.

---

## 4. `ui-action-icon-bar`

Six loose, hand-placed icon instances parented directly to the board frame:
**there is no auto-layout container, therefore no Figma-authored gap or padding
token**. Everything below is derived from measured positions — the single
biggest judgment call in this story.

### Derived layout

Rest-column measurements (frame-relative):

| #   | Icon              | slot x | slot y | slot w×h  | glyph bbox (no stroke) |
| --- | ----------------- | ------ | ------ | --------- | ---------------------- |
| 1   | `x-close`         | 56     | 1421   | 24×24     | 6, 6, 12×12            |
| 2   | `dots-horizontal` | 92     | 1421   | 24×24     | 4, 11, 16×2            |
| 3   | `dots-vertical`   | 120    | 1421   | 24×24     | 11, 4, 2×16            |
| 4   | `eye`             | 149    | 1422   | 24×24     | 2.15625, 5, 19.6883×14 |
| 5   | `settings-04`     | 183    | 1417   | **30×30** | 3.75, 6.25, 22.5×17.5  |
| 6   | `trash-02`        | 225    | 1420   | 24×24     | 3, 2, 18×20            |

The slot-box gaps (12 / 4 / 5 / 10 / 12) are **not** design intent — they are
the arithmetic consequence of six glyphs with 1.16→10px of differing internal
padding eyeballed onto one optical rhythm. Only the optical ink-gap series
clusters (20 / 17 / 16.16 / 13.66 / 16.5; mean 16.66, median 16.5, σ ≈ 2.1).
Vertical ink centres are 1433/1433/1433/1434/1432/1432 → one centreline, ±1px
board noise.

**Ruling (recipe):**

```
row:   display flex; align-items center; gap 0.75rem (12px)
slot:  1.5rem × 1.5rem button; glyph centred; no border/background/radius at rest
glyph: stroke-only, strokeWidth 2, round caps/joins, fill none, currentColor
```

12px is the modal measured gap, reproduces `x-close → dots-horizontal` and
`settings-04 → trash-02` exactly, and lands on the ≈16px optical target for
four of five pairs while normalising the two collapsed `dots-vertical` gaps
that read as a board mistake. **The implementation intentionally does NOT
reproduce the 4px and 5px gaps** (open question Q4). `settings-04` is
normalised from 30×30 to 24×24 by rendering its 30-unit viewBox in a 24px box —
the 2.5 stroke resolves to exactly 2 and no coordinate rewrite is needed.

### The active-trash backdrop — `Frame 5441` (`632:46709`)

The only authored button chrome anywhere on Board A:

| Property      | Value                                 | Token                            |
| ------------- | ------------------------------------- | -------------------------------- |
| size          | 40×40                                 | `2.5rem`                         |
| padding       | 8px on all four sides                 | `0.5rem`                         |
| child         | `trash-02` 24×24 at (8, 8)            | —                                |
| border-radius | 8px                                   | `0.5rem`                         |
| fill          | `rgba(220, 57, 57, 0.1)`              | `alpha(palette.error.main, 0.1)` |
| flattened     | `#FBEBEB` over white (pixel-verified) | do **not** hardcode              |
| border/shadow | none                                  | —                                |

**Ruling:** paint it as an absolutely-positioned, `aria-hidden`, class-hooked
2.5rem × 2.5rem layer centred behind the 24px glyph, painted only for the
danger lane on `&:active:not([aria-disabled="true"])`. This keeps the 24px slot
rhythm (no reflow, no jitter) while reproducing Frame 5441 exactly. `alpha()`
precedent: `ui-item-row/recipe.ts:6,89`.

### Per-state ink

Nothing but **stroke colour** changes across states (paths byte-identical,
verified by hashing each SVG with the stroke attribute stripped) — plus the two
structural swaps noted.

`btnActive` below abbreviates `containedButtonActive`. Neutral lane =
x-close, dots-horizontal, dots-vertical, settings-04.

| Lane           | rest    | hover        | active            | disabled |
| -------------- | ------- | ------------ | ----------------- | -------- |
| neutral (×4)   | grey300 | primary      | btnActive         | grey400  |
| eye (toggle)   | grey300 | grey200      | grey300 + eye-off | grey400  |
| trash (danger) | error   | strokeDanger | strokeDanger +bg  | grey400  |

Global invariants across all four columns: geometry frozen (slot size, glyph
bbox, position, stroke-width, caps/joins); opacity 1; no fills, borders or
shadows anywhere except the active-trash backdrop; **no transition declared**.

**Two Figma anomalies, both ruled deliberate.** (1) `eye` hover is `grey200`,
not `primary` — a visibility toggle is a neutral affordance, not a primary
action; keep `#404142`. (2) `eye` active is `grey300` (= rest) with the
`eye-off` glyph, i.e. a **pressed/checked toggle** rendering, not a pointer
`:active`. The eye therefore gets `aria-pressed` semantics. **Amended after
review (2026-08-04):** Q5's inferred `containedButtonActive` pointer-press was
overruled — the design ships no blue anywhere on the visibility toggle, so the
eye's press ink stays the rest `grey300` (the toggle row never leaves the grey
family). The disabled column also shows `eye-off` — a board
copy-paste artefact; disabled must render whichever glyph the toggle is
currently in.

### Glyph data

All glyphs are stroke-only (`fill="none"`), round caps/joins, stroke 2
(`settings-04`: 2.5 in its native 30-unit space). Ship **one** `currentColor`
path constant per glyph (7 total) in `icon-paths.ts`, using the 24-unit forms
below. Path `d` strings are wrapped at whitespace to satisfy the line-length
limit — SVG treats newlines as separators, so re-join the fragments with a
single space. A new path constant starts at an unindented line; two-space
indented lines are continuations of the path above.

`x-close` (1 path):

```
M18 6L6 18M6 6L18 18
```

`dots-horizontal` (3 paths; 1-unit-radius circles stroked at 2, centres
x = 5/12/19, y = 12):

```
M12 13C12.55228 13 13 12.55228 13 12C13 11.44772 12.55228 11 12 11C11.44772 11 11 11.44772 11
  12C11 12.55228 11.44772 13 12 13Z
M19 13C19.5523 13 20 12.55228 20 12C20 11.44772 19.5523 11 19 11C18.4477 11 18 11.44772 18 12C18
  12.55228 18.4477 13 19 13Z
M5 13C5.55228 13 6 12.55228 6 12C6 11.44772 5.55228 11 5 11C4.44772 11 4 11.44772 4 12C4 12.55228
  4.44772 13 5 13Z
```

`dots-vertical` (3 paths; identical circles, centres x = 12, y = 5/12/19):

```
M12 13C12.55228 13 13 12.55228 13 12C13 11.44772 12.55228 11 12 11C11.44772 11 11 11.44772 11
  12C11 12.55228 11.44772 13 12 13Z
M12 6C12.55228 6 13 5.55228 13 5C13 4.44772 12.55228 4 12 4C11.44772 4 11 4.44772 11 5C11 5.55228
  11.44772 6 12 6Z
M12 20C12.55228 20 13 19.5523 13 19C13 18.4477 12.55228 18 12 18C11.44772 18 11 18.4477 11 19C11
  19.5523 11.44772 20 12 20Z
```

`eye` (2 paths — lid outline, then pupil):

```
M2.42012 12.71318C2.28394 12.49754 2.21584 12.38972 2.17772 12.22342C2.14909 12.0985 2.14909
  11.9015 2.17772 11.77658C2.21584 11.61028 2.28394 11.50246 2.42012 11.28682C3.54553 9.50484 6.8954
  5 12 5C17.10545 5 20.45525 9.50484 21.58065 11.28682C21.71685 11.50246 21.78495 11.61028 21.82305
  11.77658C21.85175 11.9015 21.85175 12.0985 21.82305 12.22342C21.78495 12.38972 21.71685 12.49754
  21.58065 12.71318C20.45525 14.4952 17.10545 19 12 19C6.8954 19 3.54553 14.4952 2.42012 12.71318Z
M12 15C13.65725 15 15.00045 13.65685 15.00045 12C15.00045 10.34315 13.65725 9 12 9C10.34355 9
  9.0004 10.34315 9.0004 12C9.0004 13.65685 10.34355 15 12 15Z
```

`eye-off` (1 compound path — broken lid arcs, pupil arc, and the `M3 3L21 21`
slash). Its ink is 20 tall vs the eye's 16, so keep both centred in the same
24×24 slot (Figma does: eye vector y=5, eye-off vector y=3):

```
M10.74294 5.09232C11.14936 5.03223 11.56865 5 12 5C17.10545 5 20.45525 9.50484 21.58065
  11.28682C21.71695 11.5025 21.78505 11.61034 21.82315 11.77667C21.85175 11.90159 21.85175 12.0987
  21.82305 12.2236C21.78495 12.3899 21.71635 12.4985 21.57915 12.7156C21.27935 13.1901 20.82215
  13.8571 20.21645 14.5805M6.72432 6.71504C4.56225 8.1817 3.09445 10.21938 2.42111 11.28528C2.28428
  11.50187 2.21587 11.61016 2.17774 11.77648C2.1491 11.9014 2.14909 12.0984 2.17771 12.2234C2.21583
  12.3897 2.28393 12.4975 2.42013 12.7132C3.54554 14.4952 6.89541 19 12 19C14.05885 19 15.83185
  18.2676 17.28885 17.2766M3 3L21 21M9.8791 9.87868C9.3362 10.42157 9.00042 11.17157 9.00042
  12C9.00042 13.6569 10.34356 15 12 15C12.82885 15 13.57885 14.6642 14.12175 14.1213
```

`settings-04` (1 path, **native 30-unit viewBox**, stroke 2.5. **Amended after
review, 2026-08-04:** rendered at its native **30px** in a 1.875rem slot — the
Figma instance `451:26186` is 30×30 while every sibling is 24×24, so the earlier
scale-into-24px normalisation made it visibly smaller than the board):

```
M3.75 10L18.75 10M18.75 10C18.75 12.07107 20.4289 13.75 22.5 13.75C24.5711 13.75 26.25 12.07107
  26.25 10C26.25 7.92893 24.5711 6.25 22.5 6.25C20.4289 6.25 18.75 7.92893 18.75 10ZM11.25 20L26.25
  20M11.25 20C11.25 22.0711 9.57107 23.75 7.5 23.75C5.42893 23.75 3.75 22.0711 3.75 20C3.75 17.9289
  5.42893 16.25 7.5 16.25C9.57107 16.25 11.25 17.9289 11.25 20Z
```

`trash-02` (1 path — lid handle, lid bar, body; keep the `H`/`V` commands, do
not "normalise" them):

```
M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.7157 15.2843 2.40974 14.908
  2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.07989 2 9.51984 2 9.09202 2.21799C8.71569 2.40974
  8.40973 2.7157 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M3 6H21M19 6V17.2C19 18.8802 19 19.7202
  18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2
  22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5
  19.7202 5 18.8802 5 17.2V6
```

**Blocking repo wiring note.** `field-controls/glyph.tsx:28-53` renders exactly
one `<path>`. `x-close`, `settings-04` and `trash-02` fit as-is;
`dots-horizontal`, `dots-vertical` (3 paths) and `eye` (2 paths) do not.
**Ruling:** extend `Glyph` to accept `path: string | readonly string[]` — one
additive change, six call sites, no behaviour change for existing callers — and
cover the new branch in the field-controls unit tests. Do not hand-roll a
second SVG primitive.

### Binding a11y contract

**Role (Ruling 2).** The root is `role="group"` with an accessible name from a
required bar-level `label` prop (`aria-label`; no visible text, so SC 2.5.3
does not bind). **NOT `role="toolbar"`**, and therefore **no roving tabindex
and no arrow-key handlers**. Every action is an independent tab stop in DOM
order. Do not add `role="toolbar"` later without a full APG roving-tabindex
implementation in the same change — a toolbar without arrow navigation is a
Critical defect, not an enhancement.

**Actions.** Each action is a native `<button type="button">` (S1) with:

- **Name:** a required non-blank per-action `label` → `aria-label` (icon-only
  buttons). The SVG glyph inside is `aria-hidden="true" focusable="false"`. No
  tooltips are in scope; if a consumer adds one, the name still comes from
  `aria-label`.
- **Plain actions** (x-close, dots-horizontal, dots-vertical, settings, trash):
  no state ARIA. The trash "active" red backdrop is a pointer state from the
  Figma column — it carries **no `aria-pressed`**; it is not a toggle.
- **Eye visibility toggle (binding pressed semantics):** `aria-pressed={pressed}`
  with `pressed` coerced `?? false` (S3), an `onToggle` callback, and a
  **constant** accessible name (e.g. `label: 'Видимість'`). The label NEVER
  swaps with state ("Показати"/"Приховати" plus `aria-pressed` double-signals
  and reads contradictorily). The eye/eye-off glyph swap is visual only,
  `aria-hidden` either way.
- **Menu-opening actions (dots-horizontal/vertical):** the bar fires callbacks
  only; it owns no menu. Optional per-action popup passthrough:
  `hasPopup: 'menu'` → `aria-haspopup="menu"`, `menuOpen` → `aria-expanded`
  (**both** states), and `menuId` → `aria-controls` **only while the menu is
  mounted** (the 3.3 dangling-idref rule, `profile-select-trigger.tsx`).
  Consumers needing full menu behaviour compose with the 3.3 pattern.

**Keyboard.** Tab/Shift+Tab between actions; Enter/Space native activation; no
manual key handlers (S6).

**Disabled.** Per-action `disabled` and a whole-bar `disabled` prop, both via
the S4 boundary (focusable, `aria-disabled="true"`, no-op, hover suppressed).
Disabled actions are **not** removed from the tab order.

**Focus.** Amendment A1 per action button. Hover gates: plain actions
`&:hover:not([aria-disabled="true"])` →
`'&:focus-visible, &:focus-visible:not([aria-disabled="true"])'`; the eye
toggle, if its hover rule also negates pressed, mirrors those negations exactly
in the second selector. Forced-colors fallback per S5; the trash red backdrop
must not be the only pressed/rest distinction in forced-colors — it is not (the
glyph colour and the `aria-pressed` channel carry it), and the residue is
logged per S10.

**Static.** Per S2, an action with **no** callback renders as a plain `<span>`
holding the glyph, with no role, no tabindex and no ARIA; a bar in which **no**
action is wired renders a plain `<div>` root with no `role="group"` and no
name. Both branches render the identical content tree.

**Shared contract exceptions.** `value`/`onChange` N/A at bar level (each
action has its own callback; the eye toggle's axis is `pressed`/`onToggle`).
`error` N/A. `size`/`variant` N/A (one master; the red backdrop is a state, not
a variant). `sx` on the root, merged last.

**Dev warnings.** (a) any action with a blank `label`; (b) a blank bar `label`
while at least one action is wired; (c) `pressed` supplied on a non-toggle
action (ignored, warn); (d) `menuId` supplied while `menuOpen` is undefined
(ambiguous popup wiring).

### Public API sketch

```ts
type NeutralActionIconName = 'x-close' | 'dots-horizontal' | 'dots-vertical' | 'settings';
export type ActionIconName = NeutralActionIconName | 'eye' | 'trash';

export interface UiActionIconBarAction {
  icon: ActionIconName;
  label: string;
  onActivate?: () => void;
  pressed?: boolean;
  onToggle?: () => void;
  hasPopup?: 'menu';
  menuOpen?: boolean;
  menuId?: string;
  disabled?: boolean;
  id?: string;
}

export interface UiActionIconBarProps {
  label: string;
  actions: readonly UiActionIconBarAction[];
  disabled?: boolean;
  id?: string;
  sx?: SxProps<Theme>;
}
```

JSDoc obligations: the `role="group"` (not toolbar) ruling with the
no-partial-upgrade warning; independent tab stops; the constant-label rule for
the eye toggle; the `aria-controls`-only-while-mounted idref rule; the danger
lane's backdrop being a pointer state, not a toggle; the ⛔ rationale for
`value`/`onChange`/`error`/`size`/`variant`.

### File plan

| File                          | Contents                                         |
| ----------------------------- | ------------------------------------------------ |
| `types.ts`                    | Action + bar props, contract doc comment         |
| `icon-paths.ts`               | The 7 `currentColor` path consts (24-unit)       |
| `action-glyph.tsx`            | Name → path/viewBox lookup, renders via `Glyph`  |
| `styles.ts`                   | Row/slot/backdrop recipes, per-lane ink ramps    |
| `action-button.tsx`           | One wired/static action (both branches)          |
| `action-icon-bar-content.tsx` | Maps `actions` → `ActionButton`                  |
| `action-icon-bar-warnings.ts` | Pure `props -> string \| null`, default export   |
| `use-action-icon-bar.ts`      | Bar view model (interactive, effective disabled) |
| `use-action-state.ts`         | Per-action derived ARIA (pressed/popup/disabled) |
| `index.tsx`                   | Group/static root + `forwardRef`                 |
| `action-icon-bar.stories.tsx` | `UiComponents/UiActionIconBar`                   |

Plus the additive `path: string | readonly string[]` change in
`src/components/field-controls/glyph.tsx` (barrel unchanged).

### Test plan — `tests/unit/ui-action-icon-bar.test.tsx`

Group semantics (`role="group"` named from the bar `label`; no
`role="toolbar"`; **no roving tabindex** — every button has no `tabindex`
attribute and all are reachable) · per-action names from `aria-label`, glyphs
`aria-hidden`+`focusable="false"` · plain actions carry no state ARIA · the eye
toggle (`aria-pressed` both states, coerced from nullish, constant label across
states, glyph swap keyed off `pressed`, `onToggle` exactly once per click/
Enter/Space) · popup passthrough (`aria-haspopup`, `aria-expanded` in **both**
states, `aria-controls` present only while `menuOpen`) · disabled matrix
(per-action and whole-bar; native `disabled` never set; focus retained on flip;
no callbacks fire) · static branch (no callbacks → zero-ARIA sweep on the whole
tree, `<span>` slots, no group role) · live-region sweep · the four dev
warnings + production silence · `icon-paths` pins (each of the 7 `d` strings
asserted verbatim — the mutation-killing string pins) · style pins (`0.75rem`
gap, `1.5rem` slots, `2.5rem`/`0.5rem` backdrop, `alpha(error, 0.1)`, the
per-lane colour ramps, the two-selector ring) · a `Glyph` array-path test in
the field-controls suite.

### Showcase plan

Group file `action-icon-bar-group.tsx`, Ukrainian title **«Панель піктограм
дій»**, width **193** (the measured Figma row span x 56→249). Tiles: `Rest` ·
`Hover` (`ICON_BAR_HOVER_SX`) · `Active` (`ICON_BAR_ACTIVE_SX`, including the
trash backdrop) · `Disabled` · `Eye pressed` · `Static`. Each tile renders all
six actions in Figma order so the parity reviewer sees the whole row.

---

## 5. `ui-status-badge`

Board row y = 1790. A bare check-circle: **one circular container + one stroked
check glyph**. No text, no auto-layout, no padding tokens, no shadow, no
opacity change, no transition, no typography in any state.

### Invariant box model

| Property      | Figma             | CSS / rem                         |
| ------------- | ----------------- | --------------------------------- |
| outer box     | 26×26             | `1.625rem` square                 |
| border-radius | 54                | `'50%'` (pixel-identical here)    |
| border-width  | 2 (inside stroke) | `2px` **always** — see J1         |
| glyph frame   | 16×16 at (5, 5)   | `1rem`, flex-centred              |
| glyph leaf    | 10.6667×7.3333    | inside the 16px frame             |
| glyph stroke  | 2.1333px rendered | `strokeWidth="3.2"` at viewBox 24 |

Node tree, identical in all four states:
`Frame (26×26, fill + optional stroke, clip)` → `instance "check" (16×16)` →
`vector "Icon"`. The glyph's leaf centre is (13, 12.6667) in the 26px box —
optically raised ~0.33px above the true centre. A plain flex-centred 16px icon
box reproduces this automatically **provided the SVG keeps the full 24-unit
viewBox**; cropping to the leaf bbox loses it.

### Per-state chrome (single-colour formulation)

| State    | container bg          | border      | glyph       |
| -------- | --------------------- | ----------- | ----------- |
| rest     | `white`               | `brandGray` | `brandGray` |
| hover    | `alpha(success, 0.1)` | `success`   | `success`   |
| active   | `success`             | `success`   | `white`     |
| disabled | `brandGray`           | `brandGray` | `white`     |

Every delta is **colour-only**: box size, radius, glyph geometry, glyph path,
stroke weight, glyph position and opacity are byte-identical in all four
states. Semantics: rest = "not done"; hover = the same outline
success-coloured with a 10% tint wash; active = "done"; **disabled derives from
ACTIVE, not from rest** (solid fill + white check, desaturated to `brandGray`)
— pin that in the API docs.

**J1 (binding).** Figma drops the stroke on active and disabled. Because the
stroke is inside-aligned, all four render at exactly 26×26 with the glyph at
(5, 5), so keeping `border: 2px solid <same colour as the fill>` on active and
disabled is **pixel-identical** to no border and satisfies the no-jitter law.
Always emit the 2px border; swap only its colour. Never conditionally add or
remove it.

**J2.** Pin `'50%'` in styles and in the style test; record `54px` as the Figma
source value in a comment.

### Glyph

One path, three points, round caps and joins — the Untitled-UI check at
**1.6× the standard weight** (3.2 at viewBox 24 → 2.1333px rendered). Do not
"correct" it to 2 and do not reuse `ui-item-row`'s `strokeWidth="1.667"`.

```ts
export const CHECK_PATH: string = 'M20 6L9 17L4 12';
// <Glyph path={CHECK_PATH} viewBox="0 0 24 24" strokeWidth="3.2" width="16" height="16" />
```

Normalisation proof: leaf points in the 16px frame
`(13.3333, 4) → (6, 11.3333) → (2.6667, 8)`, ×1.5 into a 24 viewBox
`(20, 6) → (9, 17) → (4, 12)`; stroke `2.13333 × 1.5 = 3.2`.
`stroke="currentColor"` lets the container's `color` drive all four state
colours — no per-state SVG, no asset import.

### Binding a11y contract

**Mode switch.** `onToggle` presence (S2).

**Static mode (default).** A `<span role="img" aria-label={label}>` wrapping
the `aria-hidden` check-circle SVG. `label` is **required** and is the ENTIRE
non-visual signal — it MUST name the state being painted (e.g.
`label="Завдання виконано"` when `active`, and
`label="Завдання не виконано"` at rest). This is the colour-only
mitigation: the green-vs-pale distinction never travels alone because the
name carries the state (SC 1.4.1, 1.1.1). The JSDoc
must state this label obligation explicitly. No tabindex, no other ARIA.

**Interactive mode.** ONE native `<button type="button">` with
`aria-pressed={active}` (`active` coerced `?? false`, S3; the component never
self-flips). The accessible name is a **constant** `label` via `aria-label`
(icon-only; no visible text, so `aria-label` is legal per S7) — in interactive
mode the label must NOT bake the state in ("Виконано" as a name plus
`aria-pressed="true"` is correct; a state-describing label plus `aria-pressed`
double-signals). SVG `aria-hidden`. `aria-checked` and `role="switch"` are
**forbidden** — this is a toggle, not a switch or a radio (the inverse of the
3.4 §1.1 ruling, same reasoning).

**Keyboard.** Native Enter/Space only (S6). **Disabled:** the S4 boundary;
active+disabled keeps the active chrome as Figma draws it. **Focus:**
Amendment A1; hover gate
`&:hover:not([aria-disabled="true"]):not([aria-pressed="true"])` (hover is an
intermediate tint between rest and active, so it must not demote an active
badge) → selector list
`'&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-pressed="true"])'`.
Forced-colors per S5. **Note:** the rest/active distinction is fill-colour-only
(the check is drawn in every state), so forced-colors flattens it — the
non-colour channel is the `role="img"` name (static) or `aria-pressed`
(interactive). The design forbids a glyph-level distinction, so this is logged
per S10 rather than invented.

**Interactive target size.** 26px is ≥24px (SC 2.5.8 pass); the button hit area
must be at least the 26px box — do not shrink it by removing inline padding.

**Shared contract exceptions.** `value` → `active`; `onChange` → `onToggle()`
bare. `error` N/A. `size`/`variant` N/A (one 26px master; rest/hover/active/
disabled are states). `lang` N/A — `label` is consumer text and the consumer
owns any language switch on an ancestor. **Static + `active` is legal**
(Ruling 4); static + no `onToggle` + no `label` is the defect.

**Dev warnings.** (a) blank `label` in either mode (nameless image / nameless
button); (b) `active` supplied without `onToggle` is **NOT** warned (legal per
Ruling 4) — do not copy 3.4's unwired-selected warning here. This asymmetry is
intentional and **must carry an explanatory comment** in
`status-badge-warnings.ts` and a test asserting the silence.

### Public API sketch

```ts
export interface UiStatusBadgeProps {
  label: string;
  active?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  id?: string;
  sx?: SxProps<Theme>;
}
```

JSDoc obligations: the two label regimes (static = state-describing; interactive
= constant) with the double-signalling rationale; the "disabled derives from
active" visual fact; the forbidden `role="switch"`/`aria-checked`; the ⛔
rationale for `error`/`size`/`variant`/`lang`; the deliberate absence of an
unwired-`active` warning.

### File plan

| File                       | Contents                                              |
| -------------------------- | ----------------------------------------------------- |
| `types.ts`                 | Props + contract doc comment                          |
| `styles.ts`                | `CHECK_PATH`-free chrome: state ramp, `statusBadgeSx` |
| `check-glyph.tsx`          | `CHECK_PATH` + the nullary `CheckGlyph`               |
| `status-badge-warnings.ts` | Pure `props -> string \| null`, default export        |
| `use-status-badge.ts`      | Mode/ARIA view model                                  |
| `index.tsx`                | `ToggleBadge`/`ImageBadge` shells + `forwardRef`      |
| `status-badge.stories.tsx` | `UiComponents/UiStatusBadge`                          |

### Test plan — `tests/unit/ui-status-badge.test.tsx`

Static mode (`role="img"` with the `label` name; **no button, no tabindex, no
other ARIA** — the sweep allows exactly `role` and `aria-label`; static+active
renders active chrome and does **not** warn) · interactive mode (`aria-pressed`
both states, coerced from nullish, `onToggle` exactly once per click/Enter/
Space, no `role="switch"`, no `aria-checked`) · disabled boundary with focus
retention · accessible name pins in both modes · live-region sweep · dev
warnings (blank label in both modes; the asserted **absence** of an
unwired-active warning) · style pins (`1.625rem` box, `'50%'` radius, the
constant `2px` border with colour-only swaps, `alpha(success, 0.1)` tint,
`CHECK_PATH` exact string, `strokeWidth="3.2"`, the two-selector ring with the
`aria-pressed` negation).

### Showcase plan

Group file `status-badge-group.tsx`, Ukrainian title **«Бейдж статусу»**, width
**26**. Tiles: `Rest` · `Hover` (forced via `STATUS_BADGE_HOVER_SX`) · `Active`
· `Disabled` · `Static`. Because a non-interactive badge has no `:hover` rule
at all, the hover tile forces the interactive recipe through the class hook —
that is the tile's whole purpose, and the group comment must say so.

---

## 6. `ui-notification-badge`

Board row y = 1841. A 48px bell button with an overhanging numeric counter
chip.

### Invariant box model

| Part             | Figma                               | CSS / rem                         |
| ---------------- | ----------------------------------- | --------------------------------- |
| button circle    | 48×48, radius 42                    | `3rem`, `borderRadius: '50%'`     |
| bell glyph frame | 20×20 at (14, 14)                   | `1.25rem`, centred                |
| counter chip     | 18×18 at (34, 30), radius 45        | `1.125rem`, `borderRadius: '50%'` |
| chip anchor      | right −4, bottom 0 vs the 48 circle | absolutely positioned             |
| counter text     | 6×18 at (6, 0) inside the chip      | centred both axes                 |
| padding / gap    | none — everything absolute          | —                                 |
| shadow           | none in any state                   | —                                 |

Rendered bounds: 52×48 at rest/hover/disabled (the chip overhangs 4px right,
bottom flush) and **54×50 on active** (the chip's 2px **outside** ring). Do not
put `overflow: hidden` anywhere — it clips the chip and its ring.

### Per-state chrome

`bgGrey100` below abbreviates `backgroundGrey100`.

| Part          | rest        | hover             | active                | disabled    |
| ------------- | ----------- | ----------------- | --------------------- | ----------- |
| circle fill   | bgGrey100   | alpha(primary,.1) | primary               | brandGray   |
| circle border | 1px grey400 | transparent       | transparent           | transparent |
| bell stroke   | grey300     | primary           | white                 | grey400     |
| chip fill     | primary     | primary           | primary               | grey400     |
| chip ring     | none        | none              | 2px bgGrey100 outside | none        |
| counter ink   | white       | white             | white                 | white       |

Rest is the only state with a border (an inside stroke). Per the no-jitter law,
declare `border: 1px solid` permanently with `boxSizing: 'border-box'` and let
the colour go `transparent` in the other three states. The active chip ring is
an **outside** stroke (proven by the 54×50 vs 52×48 bounds) → implement as
`boxShadow: '0 0 0 2px <backgroundGrey100>'`, never a CSS `border` (which would
eat into the 18px box and shrink the chip). The ring colour is `#FBFBFB`, not
`#FFF` — a "cut out of the grey page background" ring, kept Figma-faithful; the
story and showcase surfaces should sit on `#FBFBFB`.

Counter typography: Inter **500**, `fontSize: '0.75rem'`,
`lineHeight: '1.125rem'`, `letterSpacing: 0`, `color: white`.

**"Active" semantics.** The Figma column is the pressed visual, but a
solid-blue bell also reads as "panel open". **Ruling:** key the active chrome
off `&:active:not([aria-disabled="true"])` **and** `&[aria-expanded="true"]`,
both attribute selectors on the root — no separate prop is invented.

### Glyph

One glyph, `bell-01` (Untitled UI), identical in all four states; only the
stroke differs. Ship one inline `currentColor` path via the repo `Glyph`
wrapper with `viewBox="0 0 24 24"`, `strokeWidth="1.667"`, `width="20"`,
`height="20"` (the `ui-item-row/item-icons.tsx` precedent). Wrapped at
whitespace (indented lines are continuations); re-join with a single space:

```
M9.3542 21.0001C10.0593 21.6224 10.9855 22 12 22C13.0144 22 13.9407 21.6224 14.6458
  21.0001M17.9999 8C17.9999 6.4087 17.3678 4.8826 16.2427 3.7574C15.1174 2.6322 13.5913 2 12
  2C10.4087 2 8.8826 2.6322 7.7573 3.7574C6.6321 4.8826 6 6.4087 6 8C6 11.0902 5.2204 13.2059 4.3496
  14.6054C3.6151 15.7859 3.2478 16.3761 3.2613 16.5407C3.2762 16.7231 3.3148 16.7926 3.4617
  16.9016C3.5944 17 4.1926 17 5.3888 17H18.6111C19.8074 17 20.4055 17 20.5382 16.9016C20.6851
  16.7926 20.7237 16.7231 20.7387 16.5407C20.7521 16.3761 20.3848 15.7859 19.6503 14.6054C18.7795
  13.2059 17.9999 11.0902 17.9999 8Z
```

Verification: the export's stroke-width 1.66667 = 2 × (20/24), i.e. a 24px /
2px-stroke icon rendered at 20px — consistent with the derived viewBox
(reproduces canonical `bell-01` to ≤0.03px).

### Binding a11y contract

**Role.** ONE native `<button type="button">` — the 48px bell. It fires
`onActivate` (opening the consumer's panel/menu). If the consumer wires a
popup, the same optional passthrough as `ui-action-icon-bar` applies
(`aria-haspopup="menu"`, `aria-expanded` in both states, `aria-controls` only
while the menu is mounted).

**Accessible name (Ruling 5).** Props: `count: number` (required, coerced to a
non-negative integer), `label` default `'Сповіщення'`, `max` default `9`.
Display string: `String(count)`, or `` `${max}+` `` when `count > max`. Name: `count > 0` →
`` `${label}: ${display}` `` (e.g. "Сповіщення: 1", "Сповіщення: 9+");
`count === 0` → `label` alone. The name is applied via `aria-label` on the
button and MUST use the **display string**, never the raw count, so the visible
"9+" is contained in the name (SC 2.5.3). No plural words in the default
format; consumers needing prose override `label`.

**`getName` is NOT shipped in 3.5** (the contract makes it optional — "if that
prop ships"). Consumers override `label`. Dev-warning (d) is therefore N/A;
recorded in the exceptions table. Adding `getName` later must also add the
"output must contain the display string" dev-warning in the same change.

**Counter and bell.** The numeric counter span is `aria-hidden="true"` (its
content is duplicated into the name); at `count === 0` the counter is **not
rendered at all**. The bell SVG is `aria-hidden="true" focusable="false"`.

**Live announcements (binding).** NO live region, no `aria-live`, no
`role="status"` anywhere in the component, in any state (S9). A count that
changes while the user is elsewhere is the consumer's editorial decision; the
component re-rendering its `aria-label` is sufficient for on-focus/on-demand
reading. The JSDoc must state this boundary so consumers neither double-wrap it
in their own live region **nor** file bugs here.

**Keyboard.** Native Enter/Space (S6). **Disabled:** the S4 boundary.
**Focus:** Amendment A1; hover gate `&:hover:not([aria-disabled="true"])` →
`'&:focus-visible, &:focus-visible:not([aria-disabled="true"])'`; forced-colors
per S5. 48px target (SC 2.5.8 passes with margin). Because the rest/hover/
active circle fills differ sharply, the ring uses the **two-layer** task-card
recipe `inset 0 0 0 2px darkPrimary, inset 0 0 0 4px white`
(`ui-task-card/styles.ts:25-27`), exported so the unit test can pin it — still
the S5 inset recipe, with a separator layer.

**Shared contract exceptions.** `value` → `count` (numeric, the `ui-pagination`
numeric-value precedent); `onChange` N/A — the button does not change the
count, it announces intent (`onActivate()`); `error`/`size`/`variant` N/A; `sx`
merged last.

**Dev warnings.** (a) negative or non-finite `count` (normalized to 0, warn);
(b) `max < 1` (normalized, warn); (c) blank `label` override (nameless button).

### Public API sketch

```ts
export interface UiNotificationBadgeProps {
  count: number;
  label?: string;
  max?: number;
  onActivate?: () => void;
  hasPopup?: 'menu';
  menuOpen?: boolean;
  menuId?: string;
  disabled?: boolean;
  id?: string;
  sx?: SxProps<Theme>;
}
```

JSDoc obligations: the exact name format and the display-string rule (with the
Ukrainian-plural rationale); the live-region prohibition as a **consumer-facing
boundary**; `count === 0` renders no chip; the idref rule for `menuId`; the ⛔
rationale for `onChange`/`error`/`size`/`variant`.

### File plan

| File                             | Contents                                      |
| -------------------------------- | --------------------------------------------- |
| `types.ts`                       | Props + contract doc comment                  |
| `notification-count.ts`          | Count/max normalisation + display string      |
| `notification-name.ts`           | Name composition from label + display         |
| `styles.ts`                      | Circle/chip/counter recipes, focus ring const |
| `bell-glyph.tsx`                 | `BELL_PATH` + the nullary `BellGlyph`         |
| `notification-badge-warnings.ts` | Pure `props -> string \| null`                |
| `use-notification-badge.ts`      | View model                                    |
| `index.tsx`                      | Wired/static shells + `forwardRef`            |
| `notification-badge.stories.tsx` | `UiComponents/UiNotificationBadge`            |

### Test plan — `tests/unit/ui-notification-badge.test.tsx`

Wired button semantics (name format at `count` 0 / 1 / 9 / 10 / 99 with
`max` 9 and a custom `max`; the name uses the **display** string; the counter
span is `aria-hidden`; no chip at 0) · count normalisation (negative,
non-finite, fractional → warn + normalise) · popup passthrough (`aria-expanded`
both states, `aria-controls` only while open) · `onActivate` exactly once per
click/Enter/Space · disabled boundary with focus retention · static branch
(zero-ARIA sweep) · **live-region prohibition sweep across every state** (the
contract's headline assertion) · dev warnings + production silence · style pins
(`3rem` circle, `'50%'` radius, the constant 1px border with `transparent`
swaps, the `0 0 0 2px` outside chip ring, `alpha(primary, 0.1)`, Inter 500
`0.75rem`/`1.125rem`, the exact two-layer focus-ring string, the two-selector
list).

### Showcase plan

Group file `notification-badge-group.tsx`, Ukrainian title **«Бейдж
сповіщень»**, width **54** (the active master's painted bounds; the tile must
not clip the ring). Tiles: `Rest` · `Hover` (`NOTIFICATION_HOVER_SX`) ·
`Active` (`NOTIFICATION_ACTIVE_SX`) · `Disabled` · `Count 9+` · `Static`. Tile
surface `#FBFBFB` so the active chip ring reads as Figma draws it.

---

## Integration

### Barrel exports — `src/components/index.ts` (2 lines per component)

```ts
export { default as UiActionIconBar } from './ui-action-icon-bar';
export type {
  UiActionIconBarProps,
  UiActionIconBarAction,
  ActionIconName,
} from './ui-action-icon-bar/types';
export { default as UiFilterChip } from './ui-filter-chip';
export type { UiFilterChipProps } from './ui-filter-chip/types';
export { default as UiNotificationBadge } from './ui-notification-badge';
export type { UiNotificationBadgeProps } from './ui-notification-badge/types';
export { default as UiPaymentOptionCard } from './ui-payment-option-card';
export type { UiPaymentOptionCardProps } from './ui-payment-option-card/types';
export { default as UiPinInput } from './ui-pin-input';
export type { UiPinInputProps } from './ui-pin-input/types';
export { default as UiStatusBadge } from './ui-status-badge';
export type { UiStatusBadgeProps } from './ui-status-badge/types';
```

Insert each pair in the roughly-alphabetical neighbourhood it belongs to (match
the surrounding ordering rather than appending). `src/index.ts` needs no change
(`export * from './components';`). Both barrels stay coverage-excluded and
dep-cruiser non-orphan allow-listed.

### Drift guard — `tests/unit/components-index.test.ts`

Add the six runtime names to the alphabetised `expectedPublicExports` array
(:4-47): `UiActionIconBar`, `UiFilterChip`, `UiNotificationBadge`,
`UiPaymentOptionCard`, `UiPinInput`, `UiStatusBadge`. Add the eight type-only
exports to the compile-time binding test (:75-85) — the runtime key sweep
cannot see them: `UiActionIconBarProps`, `UiActionIconBarAction`,
`ActionIconName`, `UiFilterChipProps`, `UiNotificationBadgeProps`,
`UiPaymentOptionCardProps`, `UiPinInputProps`, `UiStatusBadgeProps`.

### Showcase board — `src/showcase/new-components-board/`

Six new group modules, spread into `groups.tsx` **in Figma board order** (the
board's own y-order), appended after `INTEGRATION_CARD_GROUPS`:

```ts
export const GROUPS: GroupSpec[] = [
  ...FIELD_GROUPS,
  ...MEDIA_GROUPS,
  ...ITEM_ROW_GROUPS,
  ...TASK_CARD_GROUPS,
  ...PROFILE_SELECT_CARD_GROUPS,
  ...INTEGRATION_CARD_GROUPS,
  ...FILTER_CHIP_GROUPS,
  ...PIN_INPUT_GROUPS,
  ...PAYMENT_OPTION_CARD_GROUPS,
  ...ACTION_ICON_BAR_GROUPS,
  ...STATUS_BADGE_GROUPS,
  ...NOTIFICATION_BADGE_GROUPS,
];
```

| Group file                      | Title (Ukrainian)     | width |
| ------------------------------- | --------------------- | ----- |
| `filter-chip-group.tsx`         | Чіп фільтра           | 256   |
| `pin-input-group.tsx`           | Поле PIN-коду (2FA)   | 64    |
| `payment-option-card-group.tsx` | Картка способу оплати | 279   |
| `action-icon-bar-group.tsx`     | Панель піктограм дій  | 193   |
| `status-badge-group.tsx`        | Бейдж статусу         | 26    |
| `notification-badge-group.tsx`  | Бейдж сповіщень       | 54    |

**Builders.** `nodes.tsx` is already ~6 KB and would blow the `lloc_file` 120 /
`nom_total` 15 budget with six more builders. **Ruling:** add a new
`micro-nodes.tsx` module (the `media-nodes.tsx` precedent) holding
`filterChipNode`, `pinInputNode`, `paymentOptionCardNode`, `actionIconBarNode`,
`statusBadgeNode`, `notificationBadgeNode`. Each takes a single
`Readonly<{…}>` options object (`nargs` 3), forces pointer/media states through
`sx` on the class hooks, and drops the wiring callback for static tiles.

**Forced-state `sx` consts.** Showcase `styles.ts` is already ~9 KB — add a
sibling `micro-styles.ts` with `FILTER_CHIP_HOVER_SX`, `FILTER_CHIP_ACTIVE_SX`,
`PIN_CELL_HOVER_SX`, `PIN_CELL_FOCUS_SX`, `PAYMENT_CARD_HOVER_SX`,
`ICON_BAR_HOVER_SX`, `ICON_BAR_ACTIVE_SX`, `STATUS_BADGE_HOVER_SX`,
`NOTIFICATION_HOVER_SX`, `NOTIFICATION_ACTIVE_SX`. Each re-applies the exact
Figma hover/active values **through the component's own class hooks** and
**preserves the component's own gates** (e.g. the payment card's
`'&:not([aria-checked="true"])'`, styles.ts:177-181 precedent) so the
Selected+Hover tile proves the precedence rule on the board.

**Board smoke test.** Append the six Ukrainian titles to `GROUP_HEADINGS` in
`tests/unit/new-components-board.test.tsx:22-34` (board order) and extend the
builder-totality renders (:88-100).

### Payment logo payloads → `board-logos.json`

Following the 3.4 precedent exactly (payloads are data, not code; raw base64
with **no** `data:` prefix, prefixed once in `fixtures.ts`):

| JSON key     | Source file                 | Intrinsic (1×) | Notes            |
| ------------ | --------------------------- | -------------- | ---------------- |
| `liqpay`     | `liqpay-color-2x.png`       | 116×24         | enabled mark     |
| `liqpayGrey` | `liqpay-grey-2x.png`        | 116×24         | disabled mark    |
| `wayforpay`  | `wayforpay-wordmark-2x.png` | 187×67         | cropped wordmark |

Assets are staged at
`…/scratchpad/story-3-5/assets/payment-logos/`. Add to `fixtures.ts` beside
`HUBSPOT_LOGO_SRC`/`AMOCRM_LOGO_SRC`:

```ts
export const LIQPAY_LOGO_SRC: string = `data:image/png;base64,${boardLogos.liqpay}`;
export const LIQPAY_GREY_LOGO_SRC: string = `data:image/png;base64,${boardLogos.liqpayGrey}`;
export const WAYFORPAY_LOGO_SRC: string = `data:image/png;base64,${boardLogos.wayforpay}`;
```

plus a `PAYMENT_OPTIONS` master-data fixture (`{ name, logo, logoDisabled }`
with the intrinsic Figma sizes) shared by the stories and the board tiles.
Extend the drift guard (`tests/unit/new-components-board.test.tsx:69-86`) to
pin each brand to its own mark **and** intrinsic size, assert the `data:` URI
prefix, and assert the three sources are pairwise distinct. Brand names and
marks travel as **consumer data** (SC 3.1.2).

### Stories, `stories.json` and visual baselines

- One `.stories.tsx` per component beside it, title
  `'UiComponents/Ui<Name>'`, `tags: ['autodocs']`, argTypes from
  `'../../../.storybook/field-story-arg-types'` builders, module-level named
  render functions (no prop spreading), controlled props through a stateful
  wrapper that adopts Controls changes. The primary story is named after the
  component; then the state stories. Payment-card stories nest the card in a
  consumer `role="radiogroup"` wrapper so the §12.2-class warning stays silent.
- **Regenerate `tests/visual/stories.json`** per `tests/visual/README.md:44-53`
  (build Storybook, read `storybook-static/index.json`, filter
  `type === 'story'`, map `{id, title, name}`, sort by id, write with a
  trailing newline) and verify by diffing against the emitted `index.json` —
  the completeness test in both `tests/visual/visual.spec.ts` and
  `tests/e2e/stories.smoke.spec.ts` fails on any drift.
- **Baselines.** New `<story-id>-chromium-linux.png` files under
  `tests/visual/visual.spec.ts-snapshots/`, generated in the **pinned
  Playwright Docker image** with `tests/` bind-mounted (`make test-visual-update`).
  CI runs `retries=0`; image-actions recompresses new PNGs, so commit the
  recompressed versions.
- **`tests/visual/states.spec.ts`** gains one `test.describe` per component:
  rest / real pointer hover / active or selected (assert the ARIA state
  **before** the shot) / selected+hover where a precedence rule exists (must be
  pixel-identical to selected) / disabled / real-keyboard `:focus-visible`
  (`keyboard.press('Tab')` — **never** programmatic `.focus()`, the 3.3
  gotcha). Absolute-positioned overhang (the notification chip ring) needs a
  root-screenshot clip, not an element shot (the 3.3 gotcha).
- **Playwright `-g` filters match display titles, not story ids** — filter on
  the display title exactly (the 3.4 gotcha).

---

## Documented exceptions — shared contract fields not applicable

Epic AC: "documented exceptions are captured where shared contract fields are
not applicable." Every "N/A" below must also carry its rationale in the
component's `types.ts` (the 3.1–3.4 precedent).

#### `ui-filter-chip`

| Field      | Ruling                                                     |
| ---------- | ---------------------------------------------------------- |
| `value`    | N/A — a chip has no value axis; its existence is its state |
| `onChange` | as `onRemove()`, bare and payload-free                     |
| `disabled` | supported — the S4 boundary                                |
| `error`    | N/A — no error master; a filter chip does not validate     |
| `size`     | N/A — one 30px master                                      |
| `variant`  | N/A — four states, zero variants                           |
| `sx`       | supported — root, merged last                              |
| `lang`     | supported — filter text is user content                    |

#### `ui-pin-input`

| Field      | Ruling                                              |
| ---------- | --------------------------------------------------- |
| `value`    | supported — `string`, always controlled             |
| `onChange` | supported — `(next: string) => void`, the full code |
| `disabled` | supported — `readOnly` + `aria-disabled` (Ruling 3) |
| `error`    | supported — the full field-controls contract        |
| `size`     | N/A — one cell master                               |
| `variant`  | N/A — four states, zero variants                    |
| `sx`       | supported — root, merged last                       |
| `lang`     | N/A — digits are language-neutral                   |

#### `ui-payment-option-card`

| Field      | Ruling                                           |
| ---------- | ------------------------------------------------ |
| `value`    | as `selected` — always-controlled boolean        |
| `onChange` | as `onSelect()`, bare — one path, one direction  |
| `disabled` | supported — the S4 boundary                      |
| `error`    | N/A — validation belongs to the consumer's group |
| `size`     | N/A — fluid width, `minHeight` height            |
| `variant`  | N/A — four states, zero variants                 |
| `sx`       | supported — root, merged last                    |
| `lang`     | N/A — brand wordmarks are proper nouns           |

#### `ui-action-icon-bar`

| Field      | Ruling                                               |
| ---------- | ---------------------------------------------------- |
| `value`    | N/A at bar level; the eye toggle's axis is `pressed` |
| `onChange` | N/A — per-action `onActivate()` / `onToggle()`       |
| `disabled` | supported — per-action **and** whole-bar, both S4    |
| `error`    | N/A — no error master; actions do not validate       |
| `size`     | N/A — one master (settings-04 normalised to 24)      |
| `variant`  | N/A — the trash backdrop is a state, not a variant   |
| `sx`       | supported — root, merged last                        |
| `lang`     | N/A — icon-only; action labels are consumer-owned    |

**Amended after review (2026-08-06):** the `size` row above is stale and is kept
verbatim as the historical record. The bar does not ship a single normalised 24px
master — `settings-04` renders at its native 30px:
`src/components/ui-action-icon-bar/styles.ts:139-141` sizes the settings slot at
`1.875rem` (30px) while every other action stays at `1.5rem`, and
`src/components/ui-action-icon-bar/action-glyph.tsx:46` renders that glyph with
`viewBox: '0 0 30 30'` at `size: '30'`. The normalisation the row describes was
reversed by commit `e248c4b` ("render settings-04 at its native 30px and keep the
eye toggle grey under press"). The shipped ruling is enumerated as **DEV-35** in
`specs/planning-artifacts/deviation-ledger.md`.

#### `ui-status-badge`

| Field      | Ruling                                                    |
| ---------- | --------------------------------------------------------- |
| `value`    | as `active` — always-controlled boolean                   |
| `onChange` | as `onToggle()`, bare; its presence is the mode switch    |
| `disabled` | supported — the S4 boundary                               |
| `error`    | N/A — a status marker has no error axis                   |
| `size`     | N/A — one 26px master                                     |
| `variant`  | N/A — four states, zero variants                          |
| `sx`       | supported — root, merged last                             |
| `lang`     | N/A — `label` is consumer text; set `lang` on an ancestor |

#### `ui-notification-badge`

| Field      | Ruling                                                      |
| ---------- | ----------------------------------------------------------- |
| `value`    | as `count` — the `ui-pagination` numeric-value precedent    |
| `onChange` | N/A — `onActivate()` announces intent, never a count change |
| `disabled` | supported — the S4 boundary                                 |
| `error`    | N/A — no error master                                       |
| `size`     | N/A — one 48px master                                       |
| `variant`  | N/A — four states, zero variants                            |
| `sx`       | supported — root, merged last                               |
| `lang`     | N/A — the default label is Ukrainian; override `label`      |

Additional documented exceptions:

- `ui-status-badge` deliberately has **no** unwired-`active` dev-warning (the
  3.4 asymmetry, Ruling 4) — commented in code and asserted by a test.
- `ui-notification-badge` ships **no** `getName` formatter prop, so the
  contract's dev-warning (d) is N/A until that prop lands.
- `ui-pin-input` uses `readOnly + aria-disabled` instead of the button-shaped
  no-op boundary (Ruling 3) — same intent, input-appropriate mechanism.
- `ui-action-icon-bar` is `role="group"`, **not** `role="toolbar"` (Ruling 2) —
  no roving tabindex, no arrow keys, by contract.

---

## Out of scope — documented non-goals

Board A elements visible on the frame but **not** in the issue #23 AC list.
Recorded here so a future story can pick them up without re-discovery:

| Element                                    | Board location         |
| ------------------------------------------ | ---------------------- |
| «Выбрать фон доски» background dropdown    | Frames 141–144, y=1114 |
| Red Cancel button (Buttons instances)      | y=1354                 |
| "Analytics API"/"Reporting" labeled input  | Frames 212–215, y=1486 |
| «Добавить столбец +» chip                  | y=1640                 |
| «× Очистить фильтры» clear-filters control | y=1699                 |
| Copy-code field "5POLGOPWQZFCCFEI"         | y=1729                 |
| Circled ">" chevron button                 | y≈1600                 |

Also out of scope for 3.5:

- **A toolbar upgrade** for `ui-action-icon-bar` (roving tabindex + arrow
  keys) — Ruling 2 forbids a partial one.
- **A payment-option group component** (`radiogroup`, set size/pos in set) —
  the same boundary 3.4 drew for integration cards.
- **`onComplete`** on `ui-pin-input` — consumers compare
  `next.length === length`.
- **A `getName` formatter** on `ui-notification-badge`.
- **Contrast remediation** — inventoried below and routed to the
  accessibility-visuals PR (Story 1.3 policy).
- **Focus-ring pixel hardening / forced-colors visual design** — no Figma
  design exists; the toolkit's ring recipe applies by policy.

---

## S10 contrast-escalation inventory

Inventory only — the design is unchanged and every row is routed to the
**accessibility-visuals PR**. Semantics ship complete now; contrast debt never
blocks semantics but must never be silently dropped. Ratios are computed
against the stated surface.

Hex values are given bare (no backticks) to keep the rows narrow.
"FAIL (log)" = below requirement, inventoried and routed, never fixed here.

| Surface                               | Ratio   | Req        | Verdict         |
| ------------------------------------- | ------- | ---------- | --------------- |
| chip: hover glyph #1EAEFF on white    | 2.46:1  | 3:1 state  | FAIL (log)      |
| chip: active glyph #0399ED on white   | 3.10:1  | 3:1 state  | pass (marginal) |
| chip: rest glyph #969B9D on #EAECEE   | 2.42:1  | 3:1 bound  | FAIL (log)      |
| chip: hover border #D0D4D8 on white   | 1.49:1  | decoration | recorded        |
| chip: disabled ink #969B9D on #EAECEE | 2.20:1  | exempt     | exempt (log)    |
| pin: placeholder #D0D4D8 on white     | 1.49:1  | 4.5:1 text | FAIL (log)      |
| pin: rest border #E1E7EA on white     | 1.25:1  | 3:1 bound  | FAIL (log)      |
| pin: caret #1EAEFF on white           | 2.46:1  | 3:1 focus  | FAIL (A1 ring)  |
| pay: selected ring #1EAEFF on white   | 2.46:1  | 3:1 state  | FAIL (3.4 E2)   |
| pay: rest circle stroke #D0D4D8       | 1.49:1  | 3:1 bound  | FAIL (3.4 E3)   |
| bar: rest glyph #969B9D on white      | 2.81:1  | 3:1 bound  | FAIL (log)      |
| bar: hover glyph #1EAEFF on white     | 2.46:1  | 3:1 state  | FAIL (log)      |
| bar: active glyph #0399ED on white    | 3.10:1  | 3:1 state  | pass (marginal) |
| bar: eye hover #404142 on white       | 10.23:1 | 3:1 state  | pass            |
| bar: trash rest #DC3939 on white      | 4.48:1  | 3:1 bound  | pass            |
| bar: trash hover/active #DF7878       | 2.96:1  | 3:1 state  | FAIL (log)      |
| bar: trash glyph on #FBEBEB backdrop  | 2.56:1  | 3:1 bound  | FAIL (log)      |
| bar: backdrop #FBEBEB vs white        | 1.15:1  | n/a        | not a sole cue  |
| badge: rest check #E1E7EA on white    | 1.20:1  | 3:1 bound  | FAIL (log)      |
| badge: active white check on #38B386  | 2.46:1  | 3:1 bound  | FAIL (log)      |
| badge: disabled white on #E1E7EA      | 1.30:1  | exempt     | exempt (log)    |
| notif: counter white on #1EAEFF       | 2.60:1  | 4.5:1 text | FAIL (mitig.) † |
| notif: rest bell #969B9D on #FBFBFB   | 2.70:1  | 3:1 bound  | FAIL (log)      |
| notif: rest border #D0D4D8 on #FBFBFB | 1.45:1  | 3:1 bound  | FAIL (log)      |
| notif: active white bell on #1EAEFF   | 2.60:1  | 3:1 bound  | FAIL (log)      |
| notif: disabled inks                  | ≤1.6:1  | exempt     | exempt (log)    |
| all six: focus ring darkPrimary inset | 17.09:1 | 3:1 focus  | pass            |

† Mitigated, not excused: the counter span is `aria-hidden` duplication and the
accessible name carries the same display string, so the count never depends on
that 2.60:1 text. The visual remains logged for the accessibility-visuals PR.

Two structural escalations beyond the ratio table:

1. **`ui-status-badge` rest-vs-active is fill-colour-only** (the check glyph is
   drawn in every state), so forced-colors flattens the visual distinction. The
   non-colour channel is the `role="img"` accessible name (static) or
   `aria-pressed` (interactive) — the design forbids a glyph-level
   distinction, so this is **logged, not invented**. Escalate to the designer:
   a state-differentiating glyph or border-style would close it.
2. **`ui-action-icon-bar` rest/hover/destructive states fall below 3:1** — a
   design-source defect, not an extraction error (Story 2.3 deferred an
   identical finding). Escalate rather than silently re-colouring. The
   active-trash backdrop (1.15:1) must never be relied on as the sole state
   indicator, and the eye's glyph swap is the only non-colour state cue in the
   whole component — preserve it deliberately.

---

## Off-palette and font-weight flags — with rulings

### Colours

**`rgba(26, 27, 36, 0.09)`** — filter-chip hover/active shadow.
**Ruling: raw literal.** `#1A1B24` is six blue-channel steps off
`darkPrimary` `#1A1C1E`; at 9% alpha it is indistinguishable, but
`alpha(darkPrimary, 0.09)` would shift the channel and break the pixel
baseline. Ship as the module's one tolerated raw colour literal with the 3.1
recipe comment: `const CHIP_SHADOW: string = '0 4px 4px rgba(26, 27, 36, 0.09)';`.
**No new palette token** — shadows never get one.

**`rgba(76, 90, 126, 0.15)`** — pin-input active/focus shadow.
**Ruling: raw literal.** `#4C5A7E` has no near token (the nearest opaque
`grey250` `#57595B` is ΔE ≈ 12 and hue-wrong: neutral vs blue-violet). Ship as
`const PIN_FOCUS_SHADOW: string = '0 7px 12px rgba(76, 90, 126, 0.15)';` with
the same comment. Distinct from `ui-item-row`'s `LANDING_SHADOW` and from
`CHIP_SHADOW` — do not reuse either.

**`rgba(56, 179, 134, 0.1)`** — status-badge hover fill.
**Ruling: token.** `alpha(palette.success.main, 0.1)`, the
`ui-item-row/recipe.ts:89` idiom.

**`rgba(30, 174, 255, 0.1)`** — notification-badge hover fill.
**Ruling: token.** `alpha(palette.primary.main, 0.1)`.

**`rgba(220, 57, 57, 0.1)`** — icon-bar active-trash backdrop.
**Ruling: token.** `alpha(palette.error.main, 0.1)`. Do **not** hardcode the
flattened `#FBEBEB` — it is only correct over a white surface.

Every other colour across all six components maps 1:1 to an existing token (see
the palette-resolution table). **Two raw literals total, both shadows, both
covered by the existing one-literal-per-module convention. Zero new palette
tokens, therefore zero `src/components/types.d.ts` module-augmentation work** —
the fourth consecutive Epic 3 story with no token additions.

### Font weights

| Usage                | Figma               | Loaded | Action              |
| -------------------- | ------------------- | ------ | ------------------- |
| chip prefix + value  | Inter Medium 500    | yes    | `fontWeight: 500`   |
| notification counter | Inter Medium 500    | yes    | `fontWeight: 500`   |
| pin-input digit      | Golos Text Bold 700 | yes    | `fontWeight: 700` † |
| pay / bar / status   | no text nodes       | —      | N/A                 |

† plus `fontFamily: "'Golos Text'"` (the repo idiom).

**No Inter 600 anywhere in Story 3.5** — the recurring
"Inter SemiBold is not loaded" hazard does not bite. No `fonts.css` or
`.storybook/main.ts` `staticDirs` change is required.

### Glyph stroke-weight flags

- `ui-status-badge`'s check is **1.6× the standard Untitled-UI weight** (3.2 at
  viewBox 24 → 2.1333px rendered). It is what the design renders and what the
  exported asset carries, so it **is** the spec. Do not "correct" it to 2 and
  do not reuse `ui-item-row`'s `strokeWidth="1.667"`.
- `ui-filter-chip`'s × is **not** the stock `x-close` — its arms are one
  24-unit step shorter each side. Do not substitute an existing asset.
- `settings-04` carries stroke 2.5 in its native 30-unit space; rendering that
  viewBox in a 24px box resolves it to exactly 2, matching the other five.

---

## Open questions for the orchestrator

Every one has a **ruling recorded above** so implementation is never blocked;
these are the items a designer or reviewer may overturn.

- **Q1 — pin-input inter-cell gap is unspecified** (the master is one cell).
  Ruled `0.75rem` (12px), matching the icon-bar rhythm.
- **Q2 — pin-input has no "entered digit" colour in Figma** (all four masters
  show the grey placeholder). Ruled `grey400` placeholder / `darkPrimary`
  entered.
- **Q3 — pin-input caret.** Figma paints 2px; a real input's native caret is
  1px. Ruled `caretColor: primary` on the input, no painted span.
- **Q4 — icon-bar has no authored container or gap.** Ruled uniform 24px slots
  at `0.75rem`; the board's 4px and 5px gaps are deliberately NOT reproduced.
- **Q5 — icon-bar eye has no pointer-`:active` cell in Figma.** Ruled: give it
  the siblings' `containedButtonActive` press colour — invented by extension.
- **Q6 — payment-card hover fill is undeclared** in Frame 139. Ruled `white`
  (the rest→hover→selected progression).
- **Q7 — payment-card disabled logo is an asset swap, not a filter.** Ruled a
  `logoDisabled?` prop falling back to `logo` — a public API decision.
- **Q8 — notification-badge `getName` formatter.** Ruled not shipped in 3.5;
  consumers override `label`.
- **Q9 — filter-chip's two differently-coloured text segments.** Ruled two
  props, `label` + `filterValue`; the name is their concatenation.
- **Q10 — status-badge rest-vs-active is colour-only in forced-colors.** Ruled
  logged as structural escalation 1 above, not invented around.
- **Q11 — icon-bar `settings-04` is 30×30 on the board.** Ruled normalised to
  24×24 via its 30-unit viewBox (the 2.5 stroke resolves to exactly 2).
- **Q12 — status-badge radius `54px` vs `50%`.** Ruled pin `'50%'`; the Figma
  literal is recorded in a styles comment.

---

## Definition of Done

| DoD item                                                       | AC  |
| -------------------------------------------------------------- | --- |
| Six components exist with defined contracts + behaviour        | AC1 |
| Shared styling/contract conventions followed                   | AC1 |
| disabled/error/state semantics consistent + predictable        | AC2 |
| Documented exceptions captured for every ⛔ field              | AC2 |
| Each component individually usable and testable                | AC3 |
| No future Epic 3 story required for baseline function          | AC3 |
| Binding a11y contract honoured clause by clause                | —   |
| Barrel exports + drift guard updated                           | —   |
| Stories + showcase tiles + regenerated `stories.json`          | —   |
| Visual baselines generated in the pinned Playwright image      | —   |
| 100% coverage, `rca`, `tsc`, ESLint, Prettier, depcruise green | —   |
| Contrast inventory logged and routed (S10)                     | —   |
