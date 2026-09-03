# Story 3.7 — Board Follow-Up Controls Delivery

- **Issue:** [#149](https://github.com/VilnaCRM-Org/ui-toolkit/issues/149)
- **Epic:** Epic 3 — Data Presentation and Cards (follow-up)
- **Status:** delivered — PR [#150](https://github.com/VilnaCRM-Org/ui-toolkit/pull/150) (draft, base `feat/issue-33-export-contract`)
- **Source AC:** appendix rulings in
  `specs/planning-artifacts/board-coverage-checklist.md` — the Board A
  social-icon row (`## Appendix — board paints outside prd.md §4 scope`) and
  deferral **D-15** (Board B period segmented switcher) — plus the seven other
  board-painted controls the same audit surfaced with no delivered component.
- **Format precedent:** `specs/implementation-artifacts/3-5-board-a-micro-components.md`

This artifact is the **binding design and provenance record** for the nine
controls. Its per-component box models and per-state chrome tables were
distilled from a direct Figma MCP extraction of every painted state of every
node listed below, and they are what the implementation was built and
verified against. The intermediate extraction scratch files are not retained;
this document, together with `component-provenance.md` and the deviation
ledger, is the durable record.

## Scope

Nine board-painted controls that no toolkit component expressed before this
story. Eight are new modules under `src/components/<name>/`; one
(`ui-button-danger`) is a new `danger` variant on the existing `UiButton`
module — no new directory.

| #   | Component               | Wired root                                        | Kind        |
| --- | ----------------------- | ------------------------------------------------- | ----------- |
| 1   | `ui-background-picker`  | one `<button>` trigger + `role="menu"` popup rows | new module  |
| 2   | `ui-button-danger`      | `UiButton` `variant="danger"` (native `<button>`) | new variant |
| 3   | `ui-option-card`        | one `<button role="radio">`                       | new module  |
| 4   | `ui-chevron-button`     | one `<button>` (round, icon-only)                 | new module  |
| 5   | `ui-add-button`         | one `<button>` (label + trailing glyph)           | new module  |
| 6   | `ui-clear-button`       | one `<button>` (bare, no chrome)                  | new module  |
| 7   | `ui-copy-field`         | one `<button>` (code chip)                        | new module  |
| 8   | `ui-social-icon-button` | one `<button>` or `<a>` (round chip)              | new module  |
| 9   | `ui-segmented-control`  | N `<button role="radio">` in `role="radiogroup"`  | new module  |

This story explicitly **supersedes two open rulings** in
`specs/planning-artifacts/board-coverage-checklist.md`:

- The **Board A social-icon button row** appendix entry (four 40×40 round
  icon buttons, `github`/`facebook`/`linkedin` + Instagram, rest `439:19285` ·
  hover `439:19296` · active `439:19307` · disabled `439:19318`, y=493),
  previously flagged "board-painted, `prd.md` §4.1-absent, no delivered
  component expresses it" and routed for Component Lead confirmation — is now
  **delivered** as `ui-social-icon-button` (§8 below). It remains explicitly
  distinct from `UiFooter`'s bare glyph links and from the 189×58 Google
  `socialButton` variant (D-02); those two continue to answer to their own
  existing rows.
- **D-15**, Board B's period segmented switcher (rest `439:19868` · hover
  `439:19877`), previously ruled `Non-goal` for `v1.0.0` with a recommended
  follow-up story — is now **delivered** as `ui-segmented-control` (§9
  below), that recommended follow-up.

The orchestrator updates `board-coverage-checklist.md` to flip both rows from
`Non-goal`/appendix-flagged to `Done` once the components land; that edit is
out of scope for this artifact (see §1 below).

### Design sources — Figma node map

File: **VilnaCRM (Copy)**, fileKey `xZ7ccrH6d4QyqLQsayFSEX`. Page "Ui kit"
`439:19251`. Board A = frame `439:19252`, Board B = frame `439:19374`. Board A
state columns at frame-relative x ≈ 56 (Rest), 347 (Hover), 639 (Active), 932
(Disabled).

| Component               | rest        | hover       | active      | disabled    | Notes                               |
| ----------------------- | ----------- | ----------- | ----------- | ----------- | ----------------------------------- |
| `ui-background-picker`  | `439:19673` | `439:19677` | `439:19689` | `439:19715` | "active" column is the OPEN state   |
| `ui-button-danger`      | `439:19822` | `439:19824` | `439:19826` | `439:19828` | 98×42, y=1354                       |
| `ui-option-card`        | `439:19838` | `439:19845` | `439:19850` | `439:19855` | "active" = selected, y=1486         |
| `ui-chevron-button`     | `451:25765` | `451:25768` | `451:25771` | `451:25774` | 30×30, y=1622                       |
| `ui-add-button`         | `451:25777` | `451:25781` | `451:25785` | `451:25789` | 178×34, y=1640                      |
| `ui-clear-button`       | `451:25793` | `451:25797` | `451:25801` | `451:25805` | 152×18, y=1699                      |
| `ui-copy-field`         | `451:25827` | `451:25831` | `451:25835` | `451:25839` | 226×36, y=1729                      |
| `ui-social-icon-button` | `439:19285` | `439:19296` | `439:19307` | `439:19318` | four 40×40 chips, 48px pitch, y=493 |
| `ui-segmented-control`  | `439:19868` | `439:19877` | —           | —           | Board B, only two states painted    |

The last row is a genuine design gap, not an extraction miss: Figma paints no
active or disabled column for the segmented control (see §9, "Deviations and
rulings").

### Stack facts (carried from 3.5, re-verified for 3.7)

MUI **9.1.0** · React **19.2.7** · Emotion **11.14.1** · Storybook **10.4.3**
· TypeScript **6** · Jest **30**. `@emotion/styled` stays at zero uses in
`src/`; every surface is `<Box component="…" sx={…}>` with `sx` assemblers
exported from `styles.ts`. Loaded fonts: Golos Text 400/500/600/700/800/900,
Inter 400/500/700 (Inter 600 not loaded — none of the nine needs it; see the
font-weight table below).

### Palette resolution

Every colour across all nine components resolves to an existing
`sharedPalette` token (`src/components/ui-color-theme/index.ts`) **except**
three shadow/overlay tints, declared once each as named module constants (see
"Off-palette flags" below). **No new palette tokens, therefore no
`src/components/types.d.ts` module augmentation** for this story either.

| Hex       | Token                                | Line |
| --------- | ------------------------------------ | ---- |
| `#1EAEFF` | `palette.primary.main`               | 5    |
| `#DC3939` | `palette.error.main`                 | 11   |
| `#DF7878` | `palette.strokeDanger.main`          | 14   |
| `#FFFFFF` | `palette.white.main`                 | 20   |
| `#1A1C1E` | `palette.darkPrimary.main`           | 23   |
| `#1B2327` | `palette.darkSecondary.main`         | 26   |
| `#E1E7EA` | `palette.brandGray.main`             | 29   |
| `#57595B` | `palette.grey250.main`               | 35   |
| `#969B9D` | `palette.grey300.main`               | 38   |
| `#D0D4D8` | `palette.grey400.main`               | 41   |
| `#EAECEE` | `palette.grey500.main`               | 44   |
| `#00A3FF` | `palette.containedButtonHover.main`  | 56   |
| `#0399ED` | `palette.containedButtonActive.main` | 80   |

Figma's own style **names** are unreliable — it labels `#1B2327` "Dark
primary" while the toolkit's `darkPrimary` token is `#1A1C1E`. Every mapping
above is by **hex**, never by the Figma style name. `#1A1C1E` (`darkPrimary`)
and `#1B2327` (`darkSecondary`) are visually near-identical but are two
distinct tokens used in different components below (`ui-segmented-control`
selected ink is `darkPrimary`; `ui-background-picker` label ink and
`ui-option-card` body ink are `darkSecondary`) — do not collapse them.

---

## Shared conventions — binding on all nine

Reproduced and distilled from `00-shared.md`.

### PRIME DIRECTIVE (owner instruction — overrides every inclination)

Reproduce the Figma paint **exactly**. Do not invent colours, shadows, radii,
sizes, states, glyphs, or hover/active treatments the design does not paint.
Every hex used must appear in the state table of the component's brief. Every
state styled must be a state the brief lists. Where the design gives no value
for something, it is left unstyled and recorded in the deviations table
below — never guessed.

### Accessibility scope note (owner instruction — read before assuming a11y parity with Story 3.5)

Unlike 3.5, this story ran with **no accessibility-lead review pass**, per
explicit owner instruction. Semantics were not authored from a binding
accessibility-lead contract; they follow **existing in-repo precedent only**:

- Native elements first (`<button type="button">`, `<a>`), never
  `role="button"` divs.
- The `aria-disabled` boundary for non-native-disabled controls: a disabled
  root stays focusable, carries `aria-disabled="true"`, swallows activation,
  and never sets the native `disabled` attribute — except `ui-button-danger`,
  which inherits `UiButton`'s existing native-`disabled` mechanism unchanged.
- Content-derived accessible names wherever visible text exists; icon-only
  controls (`ui-chevron-button`, `ui-social-icon-button`) take a required
  `label`/`aria-label` prop.
- No live regions, no `aria-pressed`, no `role="switch"`, no roving
  tabindex, no set-size attributes — the same restraint 3.5's S9 codified,
  carried here by precedent rather than by a fresh review.

This is a scope note, not a quality claim: no WCAG success-criterion mapping,
no contrast escalation inventory (3.5's S10 table has no 3.7 counterpart),
and no forced-colors verification were performed for this story. Any
accessibility gap found later routes through the same accessibility-visuals
follow-up channel 3.4/3.5 already established, not through an amendment to
this artifact.

### Geometry rules

- Figma strokes are **inside** the box; CSS borders are outside unless
  `boxSizing: 'border-box'`. Every bordered root sets `border-box` so the
  outer box matches Figma exactly.
- Where a state drops the border, keep `border: '1px solid transparent'` so
  the box never shifts by 1px between states (the `ui-filter-chip`
  precedent from 3.5). Padding never changes per state.
- Figma exports shadows as `drop-shadow(0 Ypx Bpx rgba(...))` filters; the
  CSS `box-shadow` equivalent **doubles the blur** (`drop-shadow(...7.5px...)`
  → `box-shadow: 0 8px 15px ...`, `drop-shadow(...13.5px...)` →
  `box-shadow: 0 8px 27px ...`). Each brief already gives the CSS value —
  used verbatim below, never re-derived.

### Module shape

```
src/components/<kebab>/
  index.tsx      default export, React.forwardRef, displayName, sx merged LAST as [base, ...sx]
  types.ts       the exported Props interface, JSDoc per prop; TYPE-ONLY imports here
  styles.ts      sx builders + shared consts
  <name>.stories.tsx   title 'UiComponents/<UiExportName>', tags ['autodocs']
```

Copied from `src/components/ui-filter-chip/` (the 3.5 module-shape
precedent). Enforced linter rules carried unchanged from 3.5's shared
conventions: kebab-case paths, no cross-component internal imports (only
through `index.ts(x)`; `types.ts` importable only via `import type`),
explicit return types everywhere, no `any`, single quotes, `max-len` 100
**characters** (and separately qlty's UTF-8 **byte** count — lines containing
Cyrillic stay under ~50 characters), no JSX prop spreading outside the
allow-listed MUI primitives, no `data-testid` in `src/`, alphabetised import
order, and the `rust-code-analysis` ceilings (function: lloc ≤ 10, args ≤ 3,
exits ≤ 3, cyclomatic ≤ 10, cognitive ≤ 15; file: lloc ≤ 120, ≤ 10 functions,
≤ 6 closures, ≤ 15 total, MI ≥ 20 — `*.stories.tsx` under `src/` is scanned
too). No un-imported exports (coverage counts every export as a function).

### Semantics (minimal, precedent-only)

- Icon-only controls take a required `label: string` prop rendered as
  `aria-label`; glyphs use the shared `Glyph` wrapper, already `aria-hidden`
  - `focusable="false"`.
- Controls with visible text derive their name from that text — no
  `aria-label` over visible text.
- `disabled` → `aria-disabled="true"` on the root + a swallowed activation
  handler; never the native `disabled` attribute — sole exception
  `UiButton`'s `danger` variant, which is native-`disabled` because the rest
  of `UiButton` already is.
- Keyboard relies on native `<button>` — no manual Enter/Space handlers.
- Focus: the toolkit's existing ring recipe, no new colour —
  `'&:focus-visible': { outline: 'none', boxShadow: 'inset 0 0 0 2px <darkPrimary token>' }`.
  **This is the one documented non-Figma visual addition across all nine
  components** — see the ruling immediately below.

### Ruling — the shared `:focus-visible` inset ring is the sole non-Figma addition

None of the nine Figma masters paints a focus state. Per the shared brief and
consistent with 3.5's Amendment-A1 precedent, every focusable root in this
story still carries the toolkit's existing inset `:focus-visible` ring
(`boxShadow: 'inset 0 0 0 2px' + darkPrimary`, `outline: 'none'`) because
**every existing toolkit control carries it** — omitting it here would make
these nine the only focusable controls in the kit without a visible focus
indicator. This is recorded once, here, as the binding ruling that governs
all nine component sections below; it is not repeated as a per-component
deviation.

### Glyphs

Stroked glyphs go through `import { Glyph } from '../field-controls'` with
the **exact** `path`, `viewBox` and `strokeWidth` the brief gives — never a
similar existing glyph, never a redrawn path. No `.svg` file is committed for
a stroked glyph. Fill-based brand marks (`ui-social-icon-button`) cannot use
`Glyph` (stroke-only); that module declares its own
`fill="currentColor"` svg wrapper instead.

### Tests

`tests/unit/ui-<kebab>.test.tsx` (or the extended `ui-button*.test.tsx` for
the danger variant), 100% statements/branches/functions/lines. Semantic
queries only; never `*ByTestId`. Palette literals asserted as local consts so
a token swap fails the test. A pure style-assembly `describe` calls the
`styles.ts` builders directly. Console warnings (where a brief defines any)
use `mockConsoleWarn` from `./utils/mock-console-warn`.

---

## 1. `ui-background-picker`

Figma: rest `439:19673` · hover `439:19677` · **open** `439:19689` · disabled
`439:19715` (Board A y=1114). The Board A "active" state column is the
**open** menu, not a pointer-pressed state.

### Anatomy — one unified card, never a detached popper

Closed = the 220×48 trigger pill. Open = the **same** card grown downward:
trigger row → full-bleed divider → option rows → full-bleed divider → «Цвет»
heading → colour rows. Card width constant 220px, radius 12px,
`boxSizing: 'border-box'` with a 2px border.

### Invariant box model

| Part            | Figma                                                         | CSS / rem                                         |
| --------------- | ------------------------------------------------------------- | ------------------------------------------------- |
| trigger padding | 10px 19px (+2px border ⇒ content at x=21, y=12)               | `10px 19px`, `border-box`                         |
| trigger layout  | flex row, `space-between`, `gap: 9px`                         | as-is                                             |
| closed height   | 48px                                                          | fixed                                             |
| card radius     | 12                                                            | `0.75rem`                                         |
| card border     | 2px inside stroke                                             | `2px solid …`, always declared                    |
| divider         | full-bleed 2px line, spans the full 220px card                | `borderTop`, negates section padding              |
| option row      | height 32px, `gap: 8px`, left inset 21px                      | as-is                                             |
| leading media   | 32×32, `borderRadius: '50%'`                                  | `<img>` (kind `image`) or `<span>` (kind `color`) |
| row rhythm      | 12px divider→first row, **14px between rows** (see deviation) | as-is                                             |

### Per-state chrome

| state    | fill    | border (2px) | box-shadow                       | label ink     | chevron ink |
| -------- | ------- | ------------ | -------------------------------- | ------------- | ----------- |
| rest     | white   | brandGray    | `0 8px 27px rgba(49,59,67,0.14)` | darkSecondary | grey300     |
| hover    | white   | grey400      | `0 8px 15px rgba(49,59,67,0.14)` | darkSecondary | grey300     |
| open     | white   | brandGray    | `0 8px 27px rgba(49,59,67,0.14)` | darkSecondary | grey300     |
| disabled | grey500 | transparent  | none                             | grey300       | grey300     |

Figma paints **no** row hover and **no** focus ring — neither is invented;
the only addition there is the shared `:focus-visible` ring on the trigger
and on each row per the ruling above.

Figma paints no row **selected fill** either, and the master relies on the
check glyph alone to mark the chosen colour. That was overturned by the
product owner: a 10% `primary` tint now fills the selected row, keyed off
the `aria-checked` the row already exposes, so the selection is not carried
by a single 20px glyph. Filed as `DEV-64`.

### Typography

Trigger label and every row label: Golos Text 500, 15px/18px (`0.938rem` /
`1.125rem`), letter-spacing 0, ink darkSecondary (`#1B2327`).

### Glyph

Chevron: this control's own `TriggerChevronGlyph` (`trigger-chevron.tsx`,
Figma node `439:19675`), 24×24, ink grey300. It is deliberately **not** the
shared `ChevronDownGlyph`: that glyph is drawn on a 20px box at a lighter
stroke, and scaling it into the trigger's 24px footprint reads visibly
thinner than the master. The shared glyph is unchanged for its own callers. **Does not rotate when open** — the Figma open frame still points it
down (see deviations table).

### Public API sketch

```ts
export interface BackgroundOption {
  id: string;
  label: string;
  kind: 'image' | 'color';
  src?: string;
  color?: string;
}
export interface UiBackgroundPickerProps {
  groups: readonly { heading?: string; options: readonly BackgroundOption[] }[];
  label?: string; // default 'Вибрати фон дошки'
  value?: string; // controlled, `value ?? ''`
  onChange?: (id: string) => void;
  open?: boolean; // controlled, `open ?? false`
  onOpenChange?: (next: boolean) => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
  sx?: SxProps<Theme>;
}
```

Semantics mirror `src/components/ui-profile-select-card/` (read it first):
trigger `<button type="button" aria-haspopup="menu" aria-expanded={open}>`
with `aria-controls` only while the menu is mounted; popup
`<div role="menu" aria-labelledby={triggerId}>` rendered inline (no portal),
unmounted when closed; rows `<button type="button" role="menuitemradio"
aria-checked tabIndex={-1}>`; a group with a `heading` wraps its rows in
`<div role="group" aria-labelledby>`. Keyboard: ArrowDown/ArrowUp move
between rows (wrapping), Home/End jump, Escape returns focus to the trigger
then closes, outside `pointerdown` closes. Selecting the already-checked row
closes without firing `onChange`. `disabled` beats `open`.

### File plan

`index.tsx`, `types.ts`, `styles.ts`, `use-background-picker.ts`,
`picker-keyboard.ts` (own small key handler — may **not** import
`ui-profile-select-card`'s internals), `background-picker-warnings.ts`,
`background-picker.stories.tsx`.

### Test plan

`tests/unit/ui-background-picker.test.tsx` at 100%: trigger semantics
(`aria-haspopup`, `aria-expanded`, `aria-controls` only while mounted) ·
popup semantics (`role="menu"`, group `aria-labelledby`, row
`role="menuitemradio"` + `aria-checked`) · keyboard matrix (Arrow wrap,
Home/End, Escape returns focus then closes, outside pointerdown closes) ·
selection (already-checked row closes without `onChange`) · disabled beats
open · dev warnings (`open`/`value`/`onChange` without `onOpenChange`; `open`
with `disabled`; open with zero options) + production silence · style pins
(`CARD_SHADOW_TINT` exact string, 2px border, 12px radius, uniform 14px row
gap, no chevron rotation).

### Showcase plan

Ukrainian title **«Фон дошки»**, width **220**. Tiles: `Rest` · `Hover` ·
`Open` (all groups expanded) · `Disabled`. Fixture copy: trigger «Вибрати фон
дошки», image options «Назва 1/2/3», heading «Колір», colour options «Сірий»
`#E1E7EA`, «Синій» `#1EAEFF`, «Темний» `#1B2327`.

---

## 2. `ui-button-danger` (new `UiButton` variant, no new module)

Figma: rest `439:19822` · hover `439:19824` · active `439:19826` · disabled
`439:19828` (Board A y=1354, 98×42 each). Edits land **only** in
`src/components/ui-button/theme.ts` (+ `types.ts`/`index.tsx` if the variant
name needs declaring) and `src/components/ui-button/button.stories.tsx`, plus
a test block in `tests/unit/ui-button*.test.tsx`. `baseButtonStyles` already
carries Golos Text 500 / 0.938rem / 1.125rem line-height / 3.563rem radius —
all four already match Figma; nothing new is authored there.

### Invariant box model

padding `0.75rem 1.5rem` (12px/24px) ⇒ 42px tall with an 18px line box. The
24px horizontal padding is identical to the existing `size="small"`; only the
**vertical** padding differs (12px vs the existing 16px). Border declared at
1px in every state (transparent where Figma has none) so the box stays
98×42.

### Per-state chrome

| state    | background                         | border                   | text  |
| -------- | ---------------------------------- | ------------------------ | ----- |
| rest     | `alpha(error, 0.1)` — error at 10% | `1px solid` strokeDanger | error |
| hover    | error (`#DC3939`)                  | `1px solid transparent`  | white |
| active   | strokeDanger (`#DF7878`)           | `1px solid transparent`  | white |
| disabled | brandGray (`#E1E7EA`)              | `1px solid transparent`  | white |

Active is deliberately **lighter** than hover — see the deviations table; do
not "fix" it. The disabled recipe is identical to the existing
`containedStyles` disabled block. The rest fill is composed from the
existing `error` token via MUI's `alpha()` — no pasted hex.

### Public API sketch

The variant is declared the same way `socialButton` is — a `props`-matched
entry in the `MuiButton.variants` array, with a TypeScript augmentation next
to the existing declarations if the variant name needs one. `disabled` stays
MUI-native, exactly as every other `UiButton` variant — no `aria-disabled`
boundary introduced here (the one deliberate exception to this story's
`aria-disabled` default, called out in the shared semantics section above).

### File plan

`src/components/ui-button/theme.ts` (extended), `src/components/ui-button/button.stories.tsx`
(new `Danger` story), `tests/unit/ui-button-danger.test.tsx` (new) or an
appended block in the existing button test file.

### Test plan

Rest/hover/active/disabled fills, border colours and inks asserted as
literal consts against the four rows above; the `alpha(error, 0.1)`
composition asserted by computed value, not by a pasted hex; native
`disabled` attribute present (unlike every other component in this story).
100% coverage maintained on the touched files.

### Showcase plan

`Danger` story in `button.stories.tsx`, label "Cancel", `disabled` control.
No new showcase-board group — `UiButton` variants are not tiled in
`src/showcase/new-components-board/` (3.5 precedent: only new modules get a
board group).

---

## 3. `ui-option-card`

Figma: rest `439:19838` · hover `439:19845` · active/selected `439:19850` ·
disabled `439:19855` (Board A y=1486).

### Anatomy

Vertical flex, `gap: 10px`, `alignItems: 'flex-start'`, transparent
background:

1. Caption ("Analytics API"): Golos Text 500, 15px/18px, ink grey250.
2. Box: 262px wide × 60px tall, radius 8px, `boxSizing: 'border-box'`,
   `border: 1px solid …`, left padding 24px, text vertically centred. Body
   ("Reporting"): Golos Text 400, 18px/30px, ink darkSecondary.

Nothing else exists — no chevron, no caret, no radio dot, no glyph of any
kind in any state.

### Per-state chrome

| state    | box fill              | box border  | box shadow                       | body ink + weight  | caption ink |
| -------- | --------------------- | ----------- | -------------------------------- | ------------------ | ----------- |
| rest     | white                 | brandGray   | none                             | darkSecondary, 400 | grey250     |
| hover    | white                 | grey400     | `0 8px 15px rgba(49,59,67,0.14)` | darkSecondary, 400 | grey250     |
| selected | `alpha(primary, 0.1)` | transparent | none                             | primary, 600       | grey250     |
| disabled | grey500               | transparent | none                             | grey300, 400       | grey400     |

The 1px border is declared in every state (transparent where Figma drops
it). Hover chrome is gated
`'&:hover:not([aria-checked="true"]):not([aria-disabled="true"])'` so it
never applies while selected or disabled.

### Public API sketch

```ts
export interface UiOptionCardProps {
  label: string;
  valueLabel: string;
  selected?: boolean; // controlled, `selected ?? false`
  onSelect?: () => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
  sx?: SxProps<Theme>;
}
```

Semantics copy `src/components/ui-integration-card/` (read it first): the
whole tile is one `<button type="button" role="radio" aria-checked={selected}>`;
the consumer owns `role="radiogroup"`. Accessible name is content-derived:
caption span, then a literal `{' '}` text node, then the value span. No
`aria-label`. `onSelect` absent ⇒ static `<div>`, no role/tabindex/ARIA, REST
chrome even if `selected` is true.

### File plan

`index.tsx`, `types.ts`, `styles.ts`, `option-card-content.tsx`,
`use-option-card.ts`, `option-card-warnings.ts`, `option-card.stories.tsx`.

### Test plan

`tests/unit/ui-option-card.test.tsx` at 100%: wired radio semantics ·
content-derived name (caption + space + value) · hover gated off
selected/disabled · static branch renders rest chrome even when `selected`
· dev warnings (`selected` without `onSelect`; blank `label`; blank
`valueLabel`) + production silence · style pins (`alpha(primary, 0.1)`
composition, constant 1px border, `line-height: normal` on the selected
label per the deviation below).

### Showcase plan

Ukrainian title **«Картка опції»**, width **262**. Story `OptionCard` wired
with `label: 'Analytics API'`, `valueLabel: 'Reporting'`, boolean controls
for `selected`/`disabled`, plus `Static`.

---

## 4. `ui-chevron-button`

Figma: rest `451:25765` · hover `451:25768` · active `451:25771` · disabled
`451:25774` (Board A y=1622, 30×30 each).

### Anatomy

30×30 native `<button type="button">`, `borderRadius: '50%'`,
`boxSizing: 'border-box'`, centred flex, `padding: 0`, `border: 1px solid …`.
Glyph 20×20 centred (5px inset every side). A **new** local
`chevron-glyph.tsx` renders the shared `Glyph` — `UiPagination`'s
`PaginationChevron` is deliberately **not** reused (another component's
internal).

### Per-state chrome

| state    | fill      | border 1px  | box-shadow                    | glyph ink |
| -------- | --------- | ----------- | ----------------------------- | --------- |
| rest     | white     | brandGray   | none                          | grey300   |
| hover    | white     | grey300     | `0 4px 13px rgba(0,0,0,0.25)` | grey300   |
| active   | white     | grey300     | none                          | grey300   |
| disabled | brandGray | transparent | none                          | grey300   |

Glyph ink never changes — grey300 in all four states.

### Glyph

`viewBox="0 0 20 20"`, `strokeWidth="1.67"`,
`path = direction === 'left' ? 'M12.5 5L7.5 10L12.5 15' : 'M7.5 5L12.5 10L7.5 15'`.
The Figma layer is named "chevron-left" but the instance is flipped on
canvas and every rendered state points **right** — `direction` defaults to
`'right'` (see deviations table).

### Public API sketch

```ts
export interface UiChevronButtonProps {
  label: string; // required, aria-label
  direction?: 'left' | 'right'; // default 'right'; purely visual
  onActivate?: () => void;
  disabled?: boolean;
  id?: string;
  sx?: SxProps<Theme>;
}
```

`disabled` → `aria-disabled="true"` + swallowed activation. Without
`onActivate`, a static `<span>` holding the glyph, no role, no name.

### File plan

`index.tsx`, `types.ts`, `styles.ts`, `chevron-glyph.tsx`,
`chevron-button-warnings.ts`, `chevron-button.stories.tsx`.

### Test plan

`tests/unit/ui-chevron-button.test.tsx` at 100%: rest/hover/active/disabled
chrome pins (incl. `CHEVRON_HOVER_SHADOW_TINT` exact string) · glyph path
per `direction` (both directions render, default is `'right'`) · disabled
boundary · static branch (no `onActivate` ⇒ no role/name) · dev warning
(blank `label`) + production silence.

### Showcase plan

Ukrainian title **«Кнопка-шеврон»**, width **30**. Story `ChevronButton`
with `direction` select and `disabled` boolean controls.

---

## 5. `ui-add-button`

Figma: rest `451:25777` · hover `451:25781` · active `451:25785` · disabled
`451:25789` (Board A y=1640, 178×34 with the board copy).

### Anatomy

Native `<button type="button">`, width hugs content, `padding: '7px 11px'` +
the 1px border = the master's 8/12 inside-stroke inset,
`gap: 8px`, radius 4px, centred inline-flex, `boxSizing: 'border-box'`,
`border: 1px solid …`. Label first, then the trailing plus glyph.

### Per-state chrome

| state    | fill      | border 1px  | box-shadow                       | label ink | glyph ink |
| -------- | --------- | ----------- | -------------------------------- | --------- | --------- |
| rest     | white     | brandGray   | none                             | grey250   | primary   |
| hover    | white     | grey400     | `0 8px 15px rgba(49,59,67,0.14)` | grey250   | primary   |
| active   | white     | brandGray   | `0 8px 15px rgba(49,59,67,0.14)` | grey250   | primary   |
| disabled | brandGray | transparent | none                             | grey300   | grey300   |

Hover and active differ **only** by border colour, and active's border is
the **lighter** one — see deviations table.

### Typography and glyph

Label: Inter 500, 14px/18px, letter-spacing 0, `whiteSpace: 'nowrap'`.
Glyph: shared `Glyph`, `path="M9 3.75V14.25M3.75 9H14.25"`,
`viewBox="0 0 18 18"`, `strokeWidth="1.5"`, `width="18" height="18"` (the
`Glyph` wrapper's 20px default is overridden).

### Public API sketch

```ts
export interface UiAddButtonProps {
  label?: string; // default 'Додати стовпець'
  onActivate?: () => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
  sx?: SxProps<Theme>;
}
```

Name is content-derived from the visible label. `disabled` →
`aria-disabled="true"` + swallowed activation. Without `onActivate`, a
static `<span>` with the same paint, no button semantics.

### File plan

`index.tsx`, `types.ts`, `styles.ts`, `plus-glyph.tsx`,
`add-button-warnings.ts`, `add-button.stories.tsx`.

### Test plan

`tests/unit/ui-add-button.test.tsx` at 100%: four-state chrome pins
(`CARD_SHADOW_TINT`-equivalent exact string, active's lighter border
verified as distinct from hover's) · content-derived name · disabled
boundary · static branch · dev warning (explicitly blank `label`) +
production silence.

### Showcase plan

Ukrainian title **«Кнопка додавання»**, width auto (label-hugging). Story
`AddButton`, label control defaulting to «Додати стовпець», `disabled`
boolean.

---

## 6. `ui-clear-button`

Figma: rest `451:25793` · hover `451:25797` · active `451:25801` · disabled
`451:25805` (Board A y=1699, 152×18 with the board copy).

### Anatomy

Bare native `<button type="button">` — **no fill, no border, no radius, no
shadow, no padding in any state**. `display: 'inline-flex'`,
`alignItems: 'center'`, `gap: 3px`. Leading × glyph, then the label.

### Per-state ink (the complete design)

| state    | label ink     | glyph ink     |
| -------- | ------------- | ------------- |
| rest     | grey250       | grey300       |
| hover    | darkPrimary   | darkPrimary   |
| active   | darkSecondary | darkSecondary |
| disabled | grey300       | grey300       |

Rest is the **only** state where the glyph diverges from the label ink, so
the glyph needs an explicit grey300 colour at rest; the other three states
inherit `currentColor`.

### Typography and glyph

Label: Inter 500, 14px/18px, letter-spacing 0, `whiteSpace: 'nowrap'`.
Glyph: shared `Glyph`, `path="M12.75 5.25L5.25 12.75M5.25 5.25L12.75 12.75"`,
`viewBox="0 0 18 18"`, `strokeWidth="1.5"`, 18×18 — a **third** distinct
×-glyph in the toolkit, deliberately not shared with `ui-filter-chip`'s or
`ui-action-icon-bar`'s x-close.

### Public API sketch

```ts
export interface UiClearButtonProps {
  label?: string; // default 'Очистити фільтри'
  onActivate?: () => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
  sx?: SxProps<Theme>;
}
```

Content-derived name; glyph decorative; `disabled` → `aria-disabled="true"`

- swallowed activation; no `onActivate` ⇒ static `<span>`; no live region
  (announcing the clear result is the consumer's job).

### File plan

`index.tsx`, `types.ts`, `styles.ts`, `clear-glyph.tsx`,
`clear-button-warnings.ts`, `clear-button.stories.tsx`.

### Test plan

`tests/unit/ui-clear-button.test.tsx` at 100%: zero-chrome assertion (no
background/border/shadow/padding declared in any state) · four-state ink
pins, incl. the rest-only glyph-vs-label divergence · disabled boundary ·
static branch · dev warning (explicitly blank `label`) + production
silence.

### Showcase plan

Ukrainian title **«Очистити фільтри»**, width auto. Story `ClearButton`.

---

## 7. `ui-copy-field`

Figma: rest `451:25827` · hover `451:25831` · active `451:25835` · disabled
`451:25839` (Board A y=1729, 226×36 with the board copy).

### Anatomy

The **whole chip** is one native `<button type="button">` — the design
repaints the entire chip on hover/active, so the hover target is the chip
itself. Width hugs content, `padding: '7px 13px'` + the 1px border = the
master's 8/14 inside-stroke inset, `gap: 8px`, radius 4px,
`display: 'inline-flex'`, `alignItems: 'center'`, `boxSizing: 'border-box'`,
`border: 1px solid …`. Height 36px in every state.

### Per-state chrome

| state    | fill    | border 1px  | box-shadow                       | text ink    | glyph ink |
| -------- | ------- | ----------- | -------------------------------- | ----------- | --------- |
| rest     | grey500 | transparent | none                             | grey250     | grey250   |
| hover    | white   | grey400     | `0 8px 15px rgba(49,59,67,0.14)` | darkPrimary | primary   |
| active   | white   | grey400     | none                             | darkPrimary | primary   |
| disabled | grey500 | transparent | none                             | grey300     | grey300   |

### Typography and glyph

Code text: Golos Text 600, 16px, `lineHeight: 'normal'`, letter-spacing 0
(renders a 19px box). Glyph: shared `Glyph`, the copy-02 mark,
`viewBox="0 0 20 20"`, `strokeWidth="1.66667"`, 20×20, `d` taken verbatim
from the Figma SVG export of node `451:25827`; the committed path lives in
`src/components/ui-copy-field/copy-glyph.tsx`.

### Public API sketch

```ts
export interface UiCopyFieldProps {
  value: string;
  copyLabel?: string; // default 'Копіювати', visually-hidden verb suffix
  onCopy?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
  sx?: SxProps<Theme>;
}
```

Accessible name = the visible code followed by a visually-hidden `copyLabel`
span via `srOnlySx` from `../field-controls` — the exact mechanism
`ui-filter-chip` uses for its remove verb. Activation calls
`navigator.clipboard.writeText(value)` when the API exists, then
`onCopy?.(value)`; a rejected promise or missing API routes to
`onCopyError?.(error)`. **No `copied` state** — Figma paints none (see
deviations table).

### File plan

`index.tsx`, `types.ts`, `styles.ts`, `copy-glyph.tsx`, `use-copy-field.ts`,
`copy-field-warnings.ts`, `copy-field.stories.tsx`.

### Test plan

`tests/unit/ui-copy-field.test.tsx` at 100%, stubbing `navigator.clipboard`
for the success, rejection, and missing-API branches: four-state chrome
pins · accessible-name construction (visible code + hidden `copyLabel`) ·
`onCopy`/`onCopyError` dispatch per branch · disabled boundary · dev
warnings (blank `value`; explicitly blank `copyLabel`) + production
silence.

### Showcase plan

Ukrainian title **«Поле копіювання коду»**, width auto. Story `CopyField`
with `value: '5POLGOPWQZFCCFEI'` and a `disabled` control.

---

## 8. `ui-social-icon-button`

Figma rows (four 40×40 chips each, 48px pitch): rest `439:19285` · hover
`439:19296` · active `439:19307` · disabled `439:19318` (Board A y=493). This
is the appendix "Board A social-icon button row" this story delivers — see
"Scope" above for the ruling supersession.

### Anatomy — one chip is the component; a row of four is the consumer's composition

40×40, `borderRadius: '50%'`, no border, no shadow, centred inline-flex,
`padding: 0`. Glyph box 20×20 for instagram/facebook/linkedin, **22×22 for
github** (github is drawn 1px larger on each side — kept, not normalised).

The brand marks are fill-based, so the stroke-only shared `Glyph` cannot
render them. A local `social-glyph.tsx` declares a tiny
`<svg aria-hidden="true" focusable="false" fill="none">` wrapper whose single
`<path fill="currentColor">` comes verbatim from the Figma SVG exports of the
four chips in node `439:19307`; the committed paths live in
`src/components/ui-social-icon-button/social-glyph.tsx`.
`src/assets/svg/social-icons` is deliberately **not** reused — those hardcode
the footer's ink.

### Per-state chrome

| state    | chip fill             | glyph ink |
| -------- | --------------------- | --------- |
| rest     | `alpha(primary, 0.1)` | primary   |
| hover    | containedButtonHover  | white     |
| active   | containedButtonActive | white     |
| disabled | brandGray             | white     |

### Public API sketch

```ts
export type SocialNetwork = 'instagram' | 'github' | 'facebook' | 'linkedin';
export interface UiSocialIconButtonProps {
  network: SocialNetwork;
  label?: string; // aria-label; defaults to the brand name per network
  href?: string; // present -> <a>, absent -> <button>
  onActivate?: () => void;
  disabled?: boolean;
  id?: string;
  sx?: SxProps<Theme>;
}
```

Icon-only; name from `aria-label` (defaults: 'Instagram', 'GitHub',
'Facebook', 'LinkedIn'). Anchor mode follows `src/components/ui-link/index.tsx`'s
disabled pattern (`aria-disabled="true"`, `tabIndex={-1}`, suppressed
navigation); button mode uses the `aria-disabled` + swallowed-activation
boundary.

### File plan

`index.tsx`, `types.ts`, `styles.ts`, `social-glyph.tsx` (the four paths +
the wrapper), `social-icon-button-warnings.ts`,
`social-icon-button.stories.tsx`.

### Test plan

`tests/unit/ui-social-icon-button.test.tsx` at 100%: per-network glyph +
default label matrix · github's 22×22 box vs the other three's 20×20 ·
anchor vs button mode (both disabled boundaries) · dev warnings (explicitly
blank `label`; both `href` and `onActivate` supplied — anchor wins) +
production silence · style pins (`alpha(primary, 0.1)` rest fill,
containedButtonHover/Active fills).

### Showcase plan

Ukrainian title **«Кнопка соцмережі»**, width **40**. Story
`SocialIconButton` with a `network` select control and a `disabled` boolean,
plus a `Row` story rendering all four with `gap: 8px` matching the board.

---

## 9. `ui-segmented-control`

Figma (Board B `439:19374`): rest `439:19868` · hover `439:19877`. Only
these two states are painted — this is the D-15 follow-up (see "Scope"
above).

### Anatomy

Track: 50px tall, fill grey500, radius 8px, `padding: 4px`,
`display: 'inline-flex'`, `gap: 0`, no border, no shadow,
`boxSizing: 'border-box'`. Segments: native `<button type="button">`, 42px
tall, `padding: '8px 16px'`, radius 8px, `border: 'none'`,
`background: 'transparent'`, content centred, `flex: '1 1 auto'`.

The board pins segment widths at 112/102/117px for its three Cyrillic
labels; content sizing plus the equal share of slack reproduces that within
~2px (see deviations table — hardcoding per-label widths is deliberately
rejected).

### Per-state chrome (complete — nothing else is painted)

| segment condition | fill                 | radius | label ink   |
| ----------------- | -------------------- | ------ | ----------- |
| selected          | white                | 8px    | darkPrimary |
| unselected, rest  | transparent          | —      | grey300     |
| unselected, hover | `alpha(white, 0.52)` | 8px    | darkPrimary |

The selected pill has no shadow. Hover and selection coexist (the Figma
hover frame shows the selected first segment **and** a translucent hover
pill on the middle one), gated
`'&:hover:not([aria-checked="true"]):not([aria-disabled="true"])'`. Figma
paints no active and no disabled state — disabled is styled with grey300
ink only, recorded as a deviation.

### Typography

Label: Inter 500, 14px/18px, letter-spacing 0.

### Public API sketch

```ts
export interface SegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface UiSegmentedControlProps {
  options: readonly SegmentedOption[];
  value?: string; // controlled, `value ?? ''`
  onChange?: (value: string) => void;
  label?: string;
  labelledBy?: string; // wins over label
  disabled?: boolean; // group-wide
  id?: string;
  lang?: string;
  sx?: SxProps<Theme>;
}
```

Root `<div role="radiogroup">` named by `labelledBy` ?? `label`; each
segment `role="radio"` with `aria-checked`, an ordinary tab stop
(`tabIndex={0}`) — no roving tabindex, no arrow-key handler, matching the
toolkit's shipped radio-card components. Group `disabled` OR
`option.disabled` → `aria-disabled="true"` on that segment with a swallowed
`onChange`, never on the root. Without `onChange`, a static `<div>` of
`<span>`s with no roles.

### File plan

`index.tsx`, `types.ts`, `styles.ts`, `use-segmented-control.ts`,
`segmented-control-warnings.ts`, `segmented-control.stories.tsx`.

### Test plan

`tests/unit/ui-segmented-control.test.tsx` at 100%: radiogroup semantics
(name from `labelledBy`/`label`) · per-segment `role="radio"` +
`aria-checked` · hover gated off selected/disabled · re-activating the
checked segment fires nothing · per-option and group-wide disabled ·
static branch · dev warnings (`value` without `onChange`; empty `options`;
neither `label` nor `labelledBy`; duplicate option values; blank option
label; `value` matching no option) + production silence · style pins
(`alpha(white, 0.52)` hover fill exact composition, track 50px/4px padding,
segment 42px/8px 16px padding).

### Showcase plan

Ukrainian title **«Перемикач періоду»**, width auto. Story
`SegmentedControl` wired with the board's «Неделя»/«Месяц»/«Квартал»
options and a `disabled` control.

---

## Integration

### §1. Changed files

The delivery touches 103 files: 64 new module files across eight new component
directories, the `ui-button` danger styling, the barrel, the parity showcase board,
the unit suites, the visual story manifest, and the governance registers.

**New module — `ui-background-picker`**

- `src/components/ui-background-picker/background-picker-content.tsx`
- `src/components/ui-background-picker/background-picker-menu.tsx`
- `src/components/ui-background-picker/background-picker-trigger.tsx`
- `src/components/ui-background-picker/background-picker-warnings.ts`
- `src/components/ui-background-picker/background-picker.stories.tsx`
- `src/components/ui-background-picker/index.tsx`
- `src/components/ui-background-picker/picker-actions.ts`
- `src/components/ui-background-picker/picker-dom.ts`
- `src/components/ui-background-picker/picker-keyboard.ts`
- `src/components/ui-background-picker/picker-refs.ts`
- `src/components/ui-background-picker/styles.ts`
- `src/components/ui-background-picker/types.ts`
- `src/components/ui-background-picker/use-background-picker.ts`
- `src/components/ui-background-picker/use-menu-handlers.ts`
- `src/components/ui-background-picker/use-picker-effects.ts`
- `src/components/ui-background-picker/use-trigger-handlers.ts`

**New module — `ui-option-card`**

- `src/components/ui-option-card/index.tsx`
- `src/components/ui-option-card/option-card-content.tsx`
- `src/components/ui-option-card/option-card-warnings.ts`
- `src/components/ui-option-card/option-card.stories.tsx`
- `src/components/ui-option-card/styles.ts`
- `src/components/ui-option-card/types.ts`
- `src/components/ui-option-card/use-option-card.ts`

**New module — `ui-chevron-button`**

- `src/components/ui-chevron-button/chevron-button-warnings.ts`
- `src/components/ui-chevron-button/chevron-button.stories.tsx`
- `src/components/ui-chevron-button/chevron-glyph.tsx`
- `src/components/ui-chevron-button/index.tsx`
- `src/components/ui-chevron-button/styles.ts`
- `src/components/ui-chevron-button/types.ts`

**New module — `ui-add-button`**

- `src/components/ui-add-button/add-button-content.tsx`
- `src/components/ui-add-button/add-button-warnings.ts`
- `src/components/ui-add-button/add-button.stories.tsx`
- `src/components/ui-add-button/index.tsx`
- `src/components/ui-add-button/plus-glyph.tsx`
- `src/components/ui-add-button/styles.ts`
- `src/components/ui-add-button/types.ts`
- `src/components/ui-add-button/use-add-button.ts`

**New module — `ui-clear-button`**

- `src/components/ui-clear-button/clear-button-warnings.ts`
- `src/components/ui-clear-button/clear-button.stories.tsx`
- `src/components/ui-clear-button/clear-glyph.tsx`
- `src/components/ui-clear-button/index.tsx`
- `src/components/ui-clear-button/styles.ts`
- `src/components/ui-clear-button/types.ts`

**New module — `ui-copy-field`**

- `src/components/ui-copy-field/copy-field-content.tsx`
- `src/components/ui-copy-field/copy-field-warnings.ts`
- `src/components/ui-copy-field/copy-field.stories.tsx`
- `src/components/ui-copy-field/copy-glyph.tsx`
- `src/components/ui-copy-field/index.tsx`
- `src/components/ui-copy-field/styles.ts`
- `src/components/ui-copy-field/types.ts`
- `src/components/ui-copy-field/use-copy-field.ts`

**New module — `ui-social-icon-button`**

- `src/components/ui-social-icon-button/index.tsx`
- `src/components/ui-social-icon-button/social-glyph.tsx`
- `src/components/ui-social-icon-button/social-icon-button-warnings.ts`
- `src/components/ui-social-icon-button/social-icon-button.stories.tsx`
- `src/components/ui-social-icon-button/styles.ts`
- `src/components/ui-social-icon-button/types.ts`
- `src/components/ui-social-icon-button/use-social-icon-button.ts`

**New module — `ui-segmented-control`**

- `src/components/ui-segmented-control/index.tsx`
- `src/components/ui-segmented-control/segmented-control-warnings.ts`
- `src/components/ui-segmented-control/segmented-control.stories.tsx`
- `src/components/ui-segmented-control/styles.ts`
- `src/components/ui-segmented-control/types.ts`
- `src/components/ui-segmented-control/use-segmented-control.ts`

**Existing module — `ui-button` (new `danger` styling)**

- `src/components/ui-button/button.stories.tsx`
- `src/components/ui-button/theme.ts`

**Barrel**

- `src/components/index.ts`

**Showcase parity board**

- `src/showcase/new-components-board/add-button-group.tsx`
- `src/showcase/new-components-board/background-picker-group.tsx`
- `src/showcase/new-components-board/button-danger-group.tsx`
- `src/showcase/new-components-board/chevron-button-group.tsx`
- `src/showcase/new-components-board/clear-button-group.tsx`
- `src/showcase/new-components-board/copy-field-group.tsx`
- `src/showcase/new-components-board/followup-fixtures.ts`
- `src/showcase/new-components-board/followup-nodes-a.tsx`
- `src/showcase/new-components-board/followup-nodes-b.tsx`
- `src/showcase/new-components-board/followup-nodes-c.tsx`
- `src/showcase/new-components-board/followup-styles-a.ts`
- `src/showcase/new-components-board/followup-styles-b.ts`
- `src/showcase/new-components-board/groups.tsx`
- `src/showcase/new-components-board/option-card-group.tsx`
- `src/showcase/new-components-board/segmented-control-group.tsx`
- `src/showcase/new-components-board/social-icon-button-group.tsx`

**Unit tests**

- `tests/unit/components-index.test.ts`
- `tests/unit/export-contract-integrity.test.ts`
- `tests/unit/new-components-board.test.tsx`
- `tests/unit/ui-add-button.test.tsx`
- `tests/unit/ui-background-picker.test.tsx`
- `tests/unit/ui-button.test.tsx`
- `tests/unit/ui-chevron-button.test.tsx`
- `tests/unit/ui-clear-button.test.tsx`
- `tests/unit/ui-copy-field.test.tsx`
- `tests/unit/ui-option-card.test.tsx`
- `tests/unit/ui-segmented-control.test.tsx`
- `tests/unit/ui-social-icon-button.test.tsx`

**Visual manifest**

- `tests/visual/stories.json`

**Planning artifacts**

- `specs/planning-artifacts/board-coverage-checklist.md`
- `specs/planning-artifacts/component-provenance.md`
- `specs/planning-artifacts/deviation-ledger.md`
- `specs/planning-artifacts/export-contract.md`

**Implementation artifacts**

- `specs/implementation-artifacts/3-7-board-follow-up-controls.md`
- `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md`
- `specs/implementation-artifacts/sprint-status.yaml`

### Barrel exports — `src/components/index.ts`

Eight new-module pairs, plus no new pair for `ui-button-danger` (variant, not
a module). Follow the 3.5 shape: default export + type-only export per
module, inserted in the alphabetical neighbourhood, e.g.

```ts
export { default as UiAddButton } from './ui-add-button';
export type { UiAddButtonProps } from './ui-add-button/types';
export { default as UiBackgroundPicker } from './ui-background-picker';
export type { UiBackgroundPickerProps, BackgroundOption } from './ui-background-picker/types';
export { default as UiChevronButton } from './ui-chevron-button';
export type { UiChevronButtonProps } from './ui-chevron-button/types';
export { default as UiClearButton } from './ui-clear-button';
export type { UiClearButtonProps } from './ui-clear-button/types';
export { default as UiCopyField } from './ui-copy-field';
export type { UiCopyFieldProps } from './ui-copy-field/types';
export { default as UiOptionCard } from './ui-option-card';
export type { UiOptionCardProps } from './ui-option-card/types';
export { default as UiSegmentedControl } from './ui-segmented-control';
export type { UiSegmentedControlProps, SegmentedOption } from './ui-segmented-control/types';
export { default as UiSocialIconButton } from './ui-social-icon-button';
export type { UiSocialIconButtonProps, SocialNetwork } from './ui-social-icon-button/types';
```

### Drift guard — `tests/unit/components-index.test.ts`

Add the eight runtime names to `expectedPublicExports` and the associated
type-only exports to the compile-time binding test, the 3.5 precedent.
`UiButton`'s existing entry needs no change (the `danger` variant is a prop
value, not an export).

### Board coverage checklist

`specs/planning-artifacts/board-coverage-checklist.md` gets two row edits
carries both edits: the Board B "Period segmented switcher" row flipped
`Non-goal` → `Done` pointing at `UiSegmentedControl`, and eight new Board A
rows — one of which records `UiSocialIconButton` against the social-icon
button row, superseding the appendix ruling that had left it unexpressed.
Board A now declares 21 elements and the totals read 46 elements, 46 `Done`,
0 `Non-goal`, 0 `Blocked`.

### Showcase board — `src/showcase/new-components-board/`

Eight new group modules (no group for the `ui-button-danger` variant — a
`Danger` story on the existing `UiButton` showcase group suffices), spread
into `groups.tsx` in Figma board order, following the 3.5
`micro-nodes.tsx`/`micro-styles.ts` split precedent to stay inside the
`lloc_file`/`nom_total` budgets.

### Stories, `stories.json` and visual baselines

One `.stories.tsx` per new module, title `'UiComponents/Ui<Name>'`,
`tags: ['autodocs']`, argTypes from
`'../../../.storybook/field-story-arg-types'` builders. Regenerate
`tests/visual/stories.json` per `tests/visual/README.md:44-53`; generate new
`<story-id>-chromium-linux.png` baselines in the pinned Playwright Docker
image with `tests/` bind-mounted (`make test-visual-update`); CI runs
`retries=0`, image-actions recompresses new PNGs — commit the recompressed
versions. `tests/visual/states.spec.ts` gains one `test.describe` per new
component (rest / real pointer hover / active or selected with the ARIA
state asserted before the shot / disabled where painted / real-keyboard
`:focus-visible` via `keyboard.press('Tab')`, never programmatic `.focus()`).
Playwright `-g` filters match display titles, not story ids (the 3.4
gotcha).

---

## Deviations and rulings

Every deviation flagged by an extraction is recorded here with the ruling
taken, per the PRIME DIRECTIVE's "record it, do not invent around it"
instruction.

| #   | Component              | Deviation                                                                               | Ruling                                                                                                                                                                                                                   |
| --- | ---------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `ui-background-picker` | Figma's raw row ys alternate 49/46px (hand-placement drift)                             | Implemented as a uniform 14px gap between rows; the alternation is not reproduced                                                                                                                                        |
| 2   | `ui-background-picker` | Open card frame is clipped at 201px in Figma                                            | That is a canvas crop, not a scroll region — implemented unclipped, no `maxHeight`, no scrolling                                                                                                                         |
| 3   | `ui-background-picker` | Chevron layer would visually suggest rotation on open                                   | Does not rotate — the Figma open frame still points it down; no flip added                                                                                                                                               |
| 4   | `ui-option-card`       | Selected-state label carries `line-height: normal` in Figma, a style artefact           | Kept as `normal`; the text is centred either way, recorded rather than "corrected" to `1.875rem`                                                                                                                         |
| 5   | `ui-add-button`        | Hover and active differ only by border colour, and active's border is the _lighter_ one | Kept exactly as painted; not "fixed" to the expected darker-on-press convention                                                                                                                                          |
| 6   | `ui-chevron-button`    | Figma layer is named "chevron-left" but every rendered state points right               | `direction` prop defaults to `'right'`; the layer name is not trusted over the pixels                                                                                                                                    |
| 7   | `ui-copy-field`        | No "copied" confirmation state exists in Figma                                          | **Revised (DEV-61, supersedes DEV-56):** a successful copy latches the chip OWN active paint for `COPIED_RESET_MS`; no fifth chrome is invented. Visual only -- `onCopy` stays the channel for an announced confirmation |
| 8   | `ui-segmented-control` | Board hand-pins segment widths at 112/102/117px for its three labels                    | Implemented as content sizing + equal-share slack distribution, not hardcoded per-label widths; ~2px delta from the board accepted and recorded                                                                          |
| 9   | `ui-segmented-control` | Figma paints no active state and no disabled state                                      | Active is not invented (hover/selected chrome covers pointer feedback); disabled is styled with grey300 ink only, the minimal non-Figma extension needed for the prop to do anything                                     |
| 10  | `ui-button-danger`     | Active fill (`strokeDanger` `#DF7878`) is lighter than hover fill (`error` `#DC3939`)   | Kept exactly as painted; not "fixed" to the expected darker-on-press convention                                                                                                                                          |

---

## Off-palette and font-weight flags — with rulings

### Colours

Three raw literals across all nine components, each declared once as a named
module constant with a comment citing its source node — no new palette
tokens, consistent with the shared-brief instruction that shadow tints never
get one.

| Literal                  | Component(s)                                                                        | Named const                                 | Ruling                                                                                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rgba(49,59,67,0.14)`    | `ui-background-picker`, `ui-add-button`, `ui-copy-field`, `ui-option-card` (shadow) | `CARD_SHADOW_TINT` per module               | This is the toolkit's existing landing-shadow tint (the `ui-item-row`/3.5 `CHIP_SHADOW`-family value), reused verbatim across every component whose brief specifies it — not re-derived per module |
| `rgba(0,0,0,0.25)`       | `ui-chevron-button` (hover shadow)                                                  | `CHEVRON_HOVER_SHADOW_TINT`                 | No near palette token; declared once in `ui-chevron-button/styles.ts`, citing node `451:25768`                                                                                                     |
| `rgba(255,255,255,0.52)` | `ui-segmented-control` (hover pill)                                                 | built via `alpha(palette.white.main, 0.52)` | Composed from the existing `white` token via MUI's `alpha()`, not pasted as a raw literal, citing node `439:19877`                                                                                 |

Every other colour across all nine components maps 1:1 to an existing
`sharedPalette` token — see the palette-resolution table above. Two of the
three off-palette values above are genuinely raw (no token exists at that
alpha/hue); the third resolves to `alpha()` over an existing token. **Zero
new palette tokens**, consistent with the 3.5 precedent this story extends.

### Font weights

| Usage                                                | Figma                               | Loaded | Action                                                |
| ---------------------------------------------------- | ----------------------------------- | ------ | ----------------------------------------------------- |
| background-picker trigger + row labels               | Golos Text Medium 500               | yes    | `fontWeight: 500`                                     |
| option-card caption                                  | Golos Text Medium 500               | yes    | `fontWeight: 500`                                     |
| option-card body                                     | Golos Text Regular/Semibold 400/600 | yes    | `fontWeight: 400` rest/hover/disabled, `600` selected |
| copy-field code                                      | Golos Text SemiBold 600             | yes    | `fontWeight: 600`                                     |
| add-button / clear-button / segmented-control labels | Inter Medium 500                    | yes    | `fontWeight: 500`                                     |

No Inter 600 anywhere in this story — the recurring "Inter SemiBold is not
loaded" hazard does not bite. No `fonts.css` or `.storybook/main.ts`
`staticDirs` change is required.

---

## Out of scope — documented non-goals

- **Contrast escalation inventory.** Unlike 3.5's S10 table, this story
  performed no ratio audit (see the accessibility scope note above); any
  contrast finding surfaces later through the same accessibility-visuals
  channel, not through this artifact.
- **`ui-background-picker` scroll/virtualization** for large option lists —
  the open card renders all options unclipped, per the Figma source; no
  scroll region is speced or built.
- **A generalized "icon-only chip button" abstraction** unifying
  `ui-chevron-button`, `ui-add-button`, `ui-clear-button`, and
  `ui-social-icon-button` — each ships as its own small module per the
  brief's module-shape convention; no shared base component is introduced.
- **`onComplete`-style completion callbacks** anywhere in this story —
  every wired component reports state changes through a bare
  `onChange`/`onActivate`/`onSelect`, mirroring 3.5's "one path, one
  direction" convention.
- **A dedicated `UiButton` `dangerOutlined` or size variant** — only the one
  98×42 danger master exists; no size axis is added.

---

## Definition of Done

| DoD item                                                                                                                                                  | Status         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Nine controls exist with defined contracts + behaviour, matching Figma paint exactly                                                                      | done           |
| No invented colours, shadows, radii, sizes, states, or glyphs beyond the shared `:focus-visible` ring                                                     | done           |
| Every off-palette literal resolves once to a named module constant, cited to its node                                                                     | done           |
| Shared module-shape and semantics conventions followed (native elements, `aria-disabled` boundary, content-derived names, icon-only `label`/`aria-label`) | done           |
| Board-coverage appendix ruling (social-icon row) and D-15 (segmented switcher) superseded with `Done` rows                                                | done           |
| Barrel exports + drift guard updated                                                                                                                      | done           |
| Stories + showcase tiles + regenerated `stories.json`                                                                                                     | done           |
| Visual baselines generated in the pinned Playwright image                                                                                                 | open follow-up |
| 100% coverage, `rca`, `tsc`, ESLint, Prettier, depcruise green                                                                                            | done           |
| `specs/implementation-artifacts/3-7-board-follow-up-controls.md` §1 Changed files completed                                                               | done           |
