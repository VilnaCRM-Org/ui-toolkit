# Story 3.3 — Profile Select Card Workflow

- **Issue:** [#21](https://github.com/VilnaCRM-Org/ui-toolkit/issues/21)
- **Epic:** Epic 3 — Data Presentation and Cards
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 3.3: Profile Select Card Workflow_

## Scope

Deliver the Epic 3 profile menu card:

- `UiProfileSelectCard` (`src/components/ui-profile-select-card`) — the Figma
  UI-kit "Cards" profile master (frame `439:19893`): a 225×48 trigger holding a
  32px profile photo, the person's name and a grey chevron, which opens an
  action menu 11px below it. Wiring `onOpenChange` turns the trigger into a
  WAI-ARIA APG **menu button**; without it the card is static content and the
  menu never renders. The card is fluid (`width: 100%`, `minHeight: 3rem`) — the
  consumer sizes it; the stories and the showcase tiles render the master's
  225px.

Deliberately **not** a disclosure (unlike `UiItemRow`) and **not** a combobox:
the rows are fire-and-forget **commands** (open profile, open settings, log
out). Nothing is a persisted selected value, so there is no value axis, no
`aria-selected`, and no per-item `disabled`. The state axis is `open`, and it
belongs entirely to the consumer.

The whole delivery is governed by a **binding accessibility contract** authored
before implementation and reproduced §-by-§ below; every module cites it by
section number in its own comments.

## Delivered API

### `UiProfileSelectCard`

| Prop           | Type                          | Notes                                                                                       |
| -------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| `name`         | `string`                      | Person name. Rendered beside the photo and **is** the trigger's accessible name.            |
| `avatarSrc`    | `{ src: string } \| string`   | 32×32 profile photo — a URL or a static import. Decorative (`alt=""`).                      |
| `items`        | `ProfileSelectItem[]`         | `{ id, label }` commands. Labels are consumer data (SC 3.1.2); empty → no menu at all.      |
| `open`         | `boolean?`                    | Menu state, **always controlled** (default `false`). The component never self-flips it.     |
| `onOpenChange` | `((next: boolean) => void)?`  | Requests the next state, **carrying the boolean**. Its presence is the wired/static switch. |
| `onSelect`     | `((itemId: string) => void)?` | Fired with the activated item's `id`, after focus has returned to the trigger.              |
| `disabled`     | `boolean?`                    | `aria-disabled` boundary pattern — focusable, every open path a no-op, hover suppressed.    |
| `id`           | `string?`                     | Lands on the trigger `<button>`; also names the menu via `aria-labelledby`.                 |
| `lang`         | `string?`                     | BCP 47 tag on the wrapper, only when the card's language differs from the page (3.1.2).     |
| `sx`           | `SxProps<Theme>?`             | Merged last on the positioning wrapper (`[base, ...consumerSx]`).                           |
| `menuSx`       | `SxProps<Theme>?`             | Merged last on the `role="menu"` element.                                                   |

`ProfileSelectItem` is `{ id: string; label: string }` — `id` travels back
through `onSelect` and doubles as the React key, so duplicates dev-warn.
`forwardRef<HTMLButtonElement>` lands on the **trigger button**, never on the
wrapper, so a consumer can return focus to the card after a dialog closes.

The `onOpenChange` **payload** is a deliberate, documented deviation from
`UiItemRow`'s bare `onToggle()`: this widget has five distinct close paths
(Escape, Tab, outside pointer, item activation, trigger re-click), and a
payload-free toggle races against stale state when two of them fire together.

## Design decisions

### Figma alignment (UI-kit "Cards" profile master — no `crm`/`website` card exists)

The card is composed 1:1 from the Cards frame's four profile state nodes:

| Element     | Figma node  | Applied                                                                                                                                      |
| ----------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Rest        | `451:26219` | 225×48, radius 8, white fill, `1px` `grey400` (`#D0D4D8`) border, no shadow; name ink `darkPrimary`                                          |
| Avatar      | (in master) | 32×32 circle at OUTER (8, 7) — **1px above vertical centre**, exactly as the master draws it (the 3.1 icon gotcha)                           |
| Name        | (in master) | Inter Medium 14/18, letter-spacing 0, `darkPrimary` (`#1A1C1E`), starts at outer x=50 (8 + 32 + 10px gap), block y=14                        |
| Chevron     | (in master) | 20×20 box at OUTER (192, 14) — exactly centred; `grey300` (`#969B9D`) stroke at `1.66667`, round caps/joins, never flips when open (§1.3)    |
| Hover       | `451:26229` | Border darkens one step `grey400` → `grey300`; card gains "Landing shadow" `0 8px 27px rgba(49, 59, 67, 0.14)`                               |
| Active/open | `451:26252` | Card keeps the **plain rest chrome** — no hover border, no shadow; the menu floats below with the Landing shadow; middle row shows the fill  |
| Disabled    | `451:26255` | `brandGray` (`#E1E7EA`) fill, **no** border in Figma, name → `grey300`, photo at 50% opacity                                                 |
| Menu        | `451:26252` | White, `1px` `grey400`, radius 8, Landing shadow, 11px below the trigger; three 44px rows, 2px apart; row text Inter 500 14/18 at outer x=20 |
| Row pointed | `451:26252` | `backgroundGrey200` (`#F4F5F6`) full-bleed fill, squared edges clipped by the container radius — decoration only, never the focus indicator  |

**No new palette tokens** — every ink resolves to an existing `sharedPalette`
token (`grey400`/`grey300`/`brandGray`/`backgroundGrey200`/`darkPrimary`/
`white`). The Landing shadow stays a raw rgba literal with the 3.1 recipe
comment convention (no token exists behind the Figma effect), and it is a
`box-shadow` rather than a `filter: drop-shadow` because both surfaces are
opaque boxes.

### Box-model compensation (the recurring Figma-inside-stroke trap)

Figma strokes **inside** the frame; CSS draws `border` **outside** the padding
box. This story hit the trap twice — once by design, once as the round-1 parity
blocker (§ "Design fidelity") — and both are solved with geometry, never with a
state-dependent size:

- **Trigger.** Asymmetric padding `6px 12px 8px 7px` over a **constant 1px
  border** (transparent, not absent, in disabled — the default `background-clip`
  paints the fill under it, so the visual matches Figma's borderless disabled
  frame with zero geometry change). 7px + 1px puts the avatar at outer x=8;
  12px + 1px puts the 20px chevron box at outer x=192; the 6/8 vertical split
  leaves a 32px content box that lands the avatar at outer y=7 and the 18px name
  line at outer y=14 — the master's 1px-above-centre offset. A `2px` chevron
  `marginTop` pushes the glyph back to the true vertical centre (y=14), because
  Figma centres the chevron but not the avatar/name. Nothing jitters between
  rest, hover, open and disabled (the `UiPagination`/3.2 no-jitter precedent).
- **Menu.** `−1px` margins on the first and last `menuitem` slide the two edge
  rows back **under** the container's real 1px border, which `overflow: hidden`
  then clips: `(44−1) + 2 + 44 + 2 + (44−1) + 2px border = 136` outer, rows at
  0/46/92. Margins rather than shorter rows on purpose — the rows must keep
  `min-height: 44px` (SC 2.5.8) and must still grow when a label wraps
  (SC 1.4.4/1.4.10), so the fix may not touch their box height. The border is
  kept real (not re-expressed as a shadow) so the popup boundary survives
  forced-colors mode.

### Behaviour

- **APG menu button, always controlled.** With `onOpenChange`, the trigger is
  one native `<button type="button">` (mandatory `type` — an untyped button
  submits enclosing forms) carrying `aria-haspopup="menu"`, a permanent
  `aria-expanded`, and `aria-controls` **only while the menu is mounted** (the
  `UiItemRow` `panelId` precedent — a closed card leaves no dangling idref).
- **Ownership split.** The **consumer owns `open`**; the **component owns
  focus**. Every focus move — into the menu on mount, back to the trigger on
  Escape and on activation, the programmatic-close rescue — is the component's.
- **The menu is unmounted when closed**, never `display: none`, and never
  portalled: it is absolutely positioned inside the `position: relative` wrapper
  so Tab semantics stay the DOM's.
- **No key handlers where the platform already works.** The trigger handles
  ArrowDown/ArrowUp only; menu rows handle nothing at all. Enter and Space
  activate natively on both, so nothing double-fires on Space.
- **`disabled` = the `aria-disabled` boundary pattern**, and it **dominates**
  `open`: a disabled card renders the closed presentation with
  `aria-expanded="false"`, dev-warns, and does **not** self-emit
  `onOpenChange(false)`. Native `disabled` is never set, so focus survives a
  card flipping disabled underneath it (SC 2.4.3).
- **Wired/static split** (3.1/3.2 precedent): unwired → a plain `<div>` with no
  role, no `tabindex` and **no ARIA of any kind**, over an identical closed-card
  content tree. The menu never renders even if `open` is passed (dev-warn).
- **Empty `items` renders no menu at all** — an empty `role="menu"` is a defect
  (the `UiItemsList` empty-renders-nothing rule).
- Decomposed into 18 single-purpose modules to stay inside the `rca`
  per-function budgets: `types.ts`, `styles.ts`, `profile-select-model.ts` (view
  model), `use-profile-select-card.ts`, `menu-refs.ts` (the shared ref bundle),
  `task-scoped-ref.ts` (the interaction-scoped cell behind three of those refs,
  Amendment A2), `menu-focus.ts` / `menu-keyboard.ts` / `menu-actions.ts` (pure
  focus, key-map and action helpers), `use-menu-focus-effects.ts`,
  `use-trigger-handlers.ts` / `use-menu-handlers.ts`,
  `profile-select-warnings.ts`, and the five render modules (`index.tsx`,
  `profile-select-trigger.tsx`, `profile-select-menu.tsx`,
  `profile-select-menu-item.tsx`, `profile-select-card-content.tsx`).
- Dev-only guidance via the shared `useDevWarning`, silent in production.

### Contract deviations (documented)

- `value`/`onChange` are **not applicable** — an actions menu, not a value
  control. The analogues are `onOpenChange` (the state axis) and `onSelect`.
- `error` is **not applicable** — presentation and commands, not a form field.
- `size`/`variant` are **not applicable** — a single Figma master; rest, hover,
  open and disabled are **states**, not variants.
- **`onOpenChange` carries a boolean**, unlike `UiItemRow`'s bare `onToggle()`
  (rationale above, and in `types.ts`).
- **The avatar is decorative (`alt=""`)**, diverging from `UiTaskCard`'s
  informative avatar — see §5.2 below; the divergence is the contract's ruling,
  not an oversight.
- **Single-layer inset focus ring**, not the task card's two-layer ring: this
  card paints its own white fill, so the second white layer buys nothing.

## Shared-contract coverage

| Field      | UiProfileSelectCard                                 |
| ---------- | --------------------------------------------------- |
| `value`    | ⛔ N/A — actions menu; the state axis is `open`     |
| `onChange` | ⛔ N/A — `onOpenChange` + `onSelect` are analogues  |
| `disabled` | ✅ as `disabled` (`aria-disabled` boundary pattern) |
| `error`    | ⛔ N/A — not a form field                           |
| `size`     | ⛔ N/A — single master; height is a `minHeight`     |
| `variant`  | ⛔ N/A — four states, zero variants                 |
| `sx`       | ✅ on the wrapper root, plus `menuSx` on the menu   |

Every ⛔ carries its rationale in `types.ts` (3.1/3.2 precedent).

## Binding accessibility contract — as delivered

The contract was authored **before** implementation and is binding: deviation
requires an amendment, not a silent divergence. Token resolution was verified
against `ui-color-theme` up front — `#D0D4D8` = `grey400`, `#969B9D` =
`grey300`, `#E1E7EA` = `brandGray`, `#F4F5F6` = `backgroundGrey200` — so **no
new palette tokens** were needed. Every section below shipped as written.

### §1 — Widget pattern: APG menu button

- **§1.1** The rows are fire-and-forget actions; combobox/listbox semantics
  (`aria-selected`, a value axis) are **forbidden**. Disclosure was considered
  and rejected: it reveals inline content, whereas a floating list of commands
  with arrow navigation and focus capture is exactly what `role="menu"` says.
- **§1.2** One native `<button type="button">` with `aria-haspopup="menu"`, a
  permanent `aria-expanded`, and `aria-controls` only while open.
- **§1.3** The chevron **does not flip** when the menu opens. Open state reaches
  AT through `aria-expanded`; sighted users see the menu. No substitute visual
  may be invented (design-first policy).

### §2 — DOM topology and roles

- **§2.1** `<div>` positioning wrapper (no role, no landmark — it carries only
  `lang`, the consumer `sx` and the focus-out close) → trigger `<button>` →
  `<div role="menu" aria-labelledby={triggerId}>` while open.
- **§2.2** Rows are native `<button type="button" role="menuitem"
tabindex="-1">`, **direct children** of the menu — no `<ul>`/`<li>`
  interposition, no separators, groups or icons. Labels are plain
  consumer-supplied text: zero baked-in natural-language literals (SC 3.1.2).
- **§2.3** The menu is conditionally rendered — **unmounted** when closed, never
  `display: none` / `visibility: hidden`.
- **§2.4** **No portal.** In-place absolute positioning; portaling would change
  Tab semantics and needs a contract amendment.
- **§2.5** `triggerId` = the consumer `id` or `React.useId()`; `menuId` is
  always generated. The menu names itself `aria-labelledby={triggerId}` — no
  `aria-label` on the menu.

### §3 — Controlled-ness, API, wired/static split

- **§3.1** Always-controlled `open` + `onOpenChange(next)`; the component only
  ever _requests_ a state.
- **§3.2** `onSelect(itemId)` with `items: { id, label }[]`.
- **§3.3** `onOpenChange` is the wired/static switch; unwired is a static
  `<div>` with **no ARIA of any kind** and no menu, plus a dev-warning.
- **§3.4** Wired + open + zero items → **no menu**, plus a dev-warning.

### §4 — Keyboard and focus management

Ownership split: the consumer owns `open`, the component owns focus.

- **§4.1** Closed trigger: Enter/Space → native click, intent `first`;
  ArrowDown → `preventDefault()`, intent `first`; ArrowUp → `preventDefault()`,
  intent `last`; pointer click → intent `first`. A keydown handler exists **for
  the two arrow keys only**.
- **§4.2** On the closed→open transition a layout effect moves DOM focus to the
  intent item — `first` by default (including programmatic opens with no
  recorded intent), `last` only for ArrowUp — then clears the intent. Focus
  **always** enters the menu, pointer and keyboard alike. The recorded intent is
  **interaction-scoped** (**Amendment A2**): it survives the gesture that
  recorded it, so a consumer that opens synchronously consumes it, and it is
  gone by the next one, so an open the consumer **declined or deferred** falls
  back to the `first` default rather than honouring a stale end.
- **§4.3** Inside the menu: all rows `tabindex="-1"`, focus moved with
  `.focus()`; **`aria-activedescendant` forbidden**, roving `tabindex="0"`
  forbidden — the menu contributes **zero tab stops**. ArrowDown/ArrowUp move
  and **wrap at both ends**; Home/End jump to the ends (all `preventDefault()`);
  Enter/Space activate natively; Escape focuses the trigger **synchronously**
  then requests close; Tab/Shift+Tab request close with **no**
  `preventDefault()` and **no direct focus call**, so focus proceeds naturally
  and is never yanked back — the §4.6 stranded-focus rescue still applies when a
  synchronous close would otherwise leave focus on `<body>` before the browser
  completes the move (**Amendment A1** below). Typeahead is out of scope for
  3.3, on record.
- **§4.4** Item activation, binding order: (1) focus the trigger synchronously,
  (2) `onSelect(itemId)`, (3) `onOpenChange(false)`.
- **§4.5** Outside `pointerdown` closes with no focus stealing; the listener
  **excludes the whole wrapper (trigger and menu)** — without the exclusion, a
  click on an open trigger fires close (outside handler) then reopen (click
  handler), a known double-fire bug class. Trigger click while open → one close,
  focus stays put. Escape on the open trigger → close. Focus leaving the widget
  → close, no focus call. **One close request per gesture** (**Amendment A2**):
  a single gesture reaches two close paths — the `pointerdown`/Tab keydown that
  closes, then the focus-out close fired by the move that same gesture performs
  — and an interaction-scoped gate makes the second a no-op, so a consumer that
  keeps `open` true hears `onOpenChange(false)` once. The gate is scoped, never
  sticky: a **declined** close must not swallow the next gesture's Escape, and an
  open request clears it so a close-then-reopen inside one task still works.
- **§4.6** **Stranded-focus rescue (SC 2.4.3):** if the menu vanishes while
  focus is inside it, no handler already owned the move, **and
  `document.activeElement` is `<body>` (or nothing)**, focus goes to the
  trigger. Focus-inside is tracked from the menu's own focus/blur events, never
  read from `document.activeElement` in cleanup — effect-cleanup ordering means
  the active element may already be `<body>` by then; the `<body>` read is
  therefore the _stranded_ test only, never the focus-inside test. If a handler
  or the browser has already put focus on a real element, the rescue no-ops.
  A **third case** joins the family (**Amendment A2**): the menu can survive
  while the focused **row** does not, because a controlled `items` change may
  drop it. Removing a focused node fires no blur, so focus-inside still records
  where focus was; a commit-time layout effect re-seats it on the **first
  surviving row** — inside the still-open menu, not on the trigger. Zero
  surviving rows is not this case: §3.4 unmounts the menu and the rescue above
  applies. The rescue suppression is itself interaction-scoped, so a **declined**
  close cannot disarm a later, unrelated rescue.
- **§4.7** No other key handling; no `keyup` handlers (SC 2.5.2 stays native).

#### Amendment A1 — the Tab path keeps the §4.6 rescue armed (review round)

**Provenance:** CodeRabbit MAJOR on `menu-actions.ts`, PR review round for #21.

As authored, Tab suppressed the rescue outright (`skipRescue`). A consumer that
lowers `open` synchronously in `onOpenChange` unmounts the focused row **before**
the browser performs Tab's default move, so the suppression could leave focus on
`<body>` in any engine without the sequential-focus-navigation starting-point
fixup — an SC 2.4.3 failure. Amended:

- Tab requests a plain close and sets **no** `skipRescue`.
- §4.6 gains the `document.activeElement` stranded test, so the rescue fires
  only when focus really was dropped.
- `skipRescue` is retained on the paths that own focus themselves: Escape and
  item activation (both focus the trigger), and the outside-`pointerdown`
  listener, whose event fires **before** the browser moves focus off the row —
  an armed rescue there would steal focus from the element being pointed at.

Rejected alternative (the reviewer's own patch: keep `skipRescue` and let
`focusout` do the closing): the natural Shift+Tab stop from a `tabindex="-1"`
row is the trigger, which is **inside** the wrapper, so `focusout` never fires
and the menu stays open — a Shift+Tab regression — and the Tab close becomes
unobservable in jsdom. Net effect of the amendment: in a spec-compliant browser
the transient trigger focus is invisible, because the default move then advances
FROM the trigger to the same destination the starting-point fixup would have
chosen; in an engine without that fixup, focus provably never lands on `<body>`.

#### Amendment A2 — interaction-scoped refs and the items-shrink rescue (review round 2)

**Provenance:** cubic review, PR review round 2 for #21 — six findings, five of
them behavioural.

**The one root cause behind three of them.** Every mutable handle the card writes
before asking the consumer for a state change — the open intent, the §4.6 rescue
suppression, the new close gate — was a plain ref, cleared only by the commit
that _honoured_ the request. The consumer owns `open` (§3.1) and is free to
**decline or defer** it, and a declined request commits nothing, so the value
survived to steer the **next, unrelated** interaction: a declined ArrowUp open
made a later programmatic open land on the last row (§4.2 says `first`), and a
declined outside-pointer close suppressed a later close's rescue (§4.6), leaving
focus on `<body>`. The fix is one shared primitive,
`task-scoped-ref.ts`: a cell readable for the remainder of the event task that
set it and empty by the next one.

- **Why a task and not a microtask.** The HTML "clean up after running script"
  step performs a microtask checkpoint after **every** event listener, so a
  microtask self-clear would already have run before the same gesture's focus
  events — and before the microtask in which a concurrent-root React flushes a
  synchronous consumer's re-render. A clear queued as a task can precede
  neither, because both happen inside the task that queued it.
- **Consequence, on record.** A consumer that opens **asynchronously** (a
  deferred `setState`) gets §4.2's `first` default rather than its recorded
  ArrowUp `last`. That is the safe direction — the alternative is a stale intent
  steering an unrelated open — and it is the documented behaviour, not a bug.

**The five behavioural amendments:**

1. **§6.1 covers intent recording** — the trigger's click and keydown paths
   return before recording anything while disabled (gate relocated to
   `use-trigger-handlers.ts`, which also keeps `menu-actions.ts` inside its
   `rca` function-count budget).
2. **§4.6 gains a third case** — a controlled `items` shrink that removes the
   focused row is rescued to the first surviving row, inside the still-mounted
   menu.
3. **§4.5 dedupes per gesture** — one `onOpenChange(false)` per interaction, on
   every close path, never across interactions.
4. **§4.2's intent is interaction-scoped** — see above.
5. **§4.6's `skipRescue` is interaction-scoped** — the outside-`pointerdown`
   path still needs same-gesture suppression (its event precedes the browser's
   focus move); Escape and activation keep it as belt-and-braces, where A1's
   stranded test already makes it a no-op.

**Sixth finding (P3, non-behavioural): the row memoisation was vacuous.** The
menu row's `useCallback` depended on an `onActivate` that the action context
rebuilt on every render, so nothing was memoised. The context is now
`React.useMemo`d over its real inputs (`refs`, the effective open state,
`disabled`, `requestOpen`, `onSelect`), which makes the trigger, menu and row
callbacks genuinely stable whenever the consumer's own callbacks are. Deleting
the `useCallback` instead was rejected: `react/jsx-no-bind` would fire and the
repo forbids `eslint-disable`.

**Regressions added (10 specs).** No-intent-while-disabled proved in a single
task (`fireEvent` + re-render, so scoping cannot mask the boundary); the
items-shrink rescue, its focus-already-outside no-op and its zero-rows fallback;
one close per gesture with a kept-open consumer, and a declined close still
reporting the next Escape; a declined open landing on `first`; a declined
outside close still rescuing a later programmatic close; and two handler-identity
specs. The two pre-existing kept-open Tab specs were **strengthened** from
`calls.every(...)` to exact `[[false]]` — the weak form was passing over the live
double-fire.

### §5 — Accessible names and imagery

- **§5.1** Trigger name = the visible person name, content-derived. **No
  `aria-label` anywhere in the tree** (WCAG 2.5.3).
- **§5.2** **The avatar is decorative: `alt=""`.** This diverges from 3.2's
  informative avatar deliberately — here the name is adjacent visible text
  inside the same button, so `alt={name}` would say the name twice. Same `<img>`
  hygiene otherwise: real `<img>`, `width`/`height` attributes,
  `decoding="async"`, `draggable={false}`, no `onError`. The 50%-opacity
  disabled treatment needs no ARIA.
- **§5.3** The chevron is an `aria-hidden` SVG glyph baked at the export's
  `1.66667@20` stroke weight (the shared `field-controls` `ChevronDownGlyph` is
  `1.5` and does not match — `ui-item-row`'s baked-glyph approach was mirrored,
  reusing the shared `Glyph` wrapper with its own path).
- **§5.4** Row names are their visible label text, nothing appended.
- **§5.5** `lang` on the wrapper root, only when the widget's language differs
  from the page (SC 3.1.2).

### §6 — Disabled

- **§6.1** `aria-disabled` boundary: a real, focusable `<button>` with
  `aria-disabled="true"`, native `disabled` **never** set, every open path a
  no-op, hover suppressed via `:not([aria-disabled="true"])`, `cursor: default`.
  `aria-haspopup` and `aria-expanded="false"` remain. "Every open path a no-op"
  is **end to end** (**Amendment A2**): the trigger's pointer and key handlers
  return before recording an open intent and before `preventDefault()`, not just
  before the request. Gating the request alone still left an intent behind, and a
  consumer that re-enabled the card with `open` already true then opened onto
  that stale end although §4.2 makes an intent-less open `first`.
- **§6.2** A disabled **unwired** card is plain static content with **no**
  `aria-disabled`.
- **§6.3** `disabled` **dominates** `open`: closed presentation, dev-warning, no
  self-emitted `onOpenChange(false)`; if focus was inside the vanishing menu the
  §4.6 rescue moves it to the still-focusable trigger.
- **§6.4** Per-item disabled: out of scope, no prop.

### §7 — Focus indication

- **§7.1** Trigger `:focus-visible` → `outline: none` +
  `box-shadow: inset 0 0 0 2px darkPrimary` — the **single-layer** inset ring
  (`UiItemRow` recipe; the card paints its own white fill, so the task card's
  second layer is unnecessary). Inset because the card is r8 and consumer
  contexts may clip outset paint. Declared **after** the hover rule so it wins
  at equal specificity.
- **§7.2** Menu rows carry the same ring. **The `#F4F5F6` fill is never the
  focus indicator** — the ring is declared after it and paints on top of a
  hovered, focused row alike.
- **§7.3** Forced-colors branches are mandatory on both:
  a `@media (forced-colors: active)` branch re-expressing the ring as
  `outline: 2px solid Highlight` with `outline-offset: -2px`, because box-shadow
  is discarded in that mode. The menu keeps its real `1px solid` border so the
  popup boundary survives.

### §8 — Live regions: none, prohibited

- **§8.1** Zero live regions in any state. The 3.2 attribute-level
  `expectNoLiveRegion` sweep runs across closed, open, item-focused,
  after-select, after-Escape, disabled and static.

### §9 — Motion

- **§9.1** No transitions or animations anywhere; the menu mounts and unmounts
  instantly, so no `prefers-reduced-motion` branch is needed. Adding one later
  requires both a branch and a contract amendment.

### §10 — Geometry, zoom, targets, and the 11px gap

- **§10.1** The 11px trigger→menu gap is **conforming; SC 1.4.13 does not
  apply** — the popup is activation-triggered and click-latched, not
  hover/focus-triggered. **Corollary (binding): no hover-open behaviour may ever
  be added.**
- **§10.2** Targets: trigger 225×48, rows 44px min-height — passes SC 2.5.8; no
  shrinking below these.
- **§10.3** Reflow/zoom: `minHeight` never `height`; the name wraps naturally
  with no clamp, no ellipsis and no `overflow` clipping; rows use
  `min-height: 44px` and their labels wrap. Nothing shears at 200% zoom or
  320px.

### §11–§13 — Prop mapping, dev-warnings, mandatory regressions

- **§11** is the shared-contract table above; every ⛔ carries its rationale in
  `types.ts`.
- **§12** — five dev-only warnings via the shared `useDevWarning`, silent in
  production: `open`/`onSelect` without `onOpenChange`; `open && disabled`;
  wired + open with empty `items`; blank `name`; duplicate item `id`s.
- **§13** — ten mandatory regression assertions **beyond** the 100%-coverage
  gate, all delivered: exactly-once activation on Enter/Space/click; the full
  open-intent and wrap/Home/End matrix; Escape refocuses the trigger while Tab
  makes no direct focus call — its close leaves the §4.6 rescue armed, so the
  starting point stays live and the destination stays the natural next stop
  (Amendment A1); **one** close on a trigger click while open (the §4.5
  double-fire class); `aria-controls`/`role="menu"` present only while open;
  focus retained on a disabled flip and rescued on a programmatic close, never
  to `<body>`;
  zero buttons and zero ARIA on the static card; the `expectNoLiveRegion` sweep;
  accessible-name assertions including "no `aria-label` anywhere"; and visual
  state snapshots in the pinned Playwright image.

### Escalations

1. **No escalation for a missing disabled visual** — unlike 3.2, Figma **ships**
   one (`451:26255`). Disabled is conveyed by lowered contrast only, the
   accepted convention for inactive components (SC 1.4.3 exempts them).
2. **Chevron `grey300` on white = 2.81:1 (Minor, design-first hold).**
   Inventoried for the accessibility-visuals PR (Story 1.3 policy), not fixed
   here. Suggested future swap: `grey250` `#57595B` (7.04:1).
3. **No focus-visible or forced-colors design exists in Figma** — the toolkit's
   established ring recipe (§7) applies by policy; pixel hardening is deferred
   to the accessibility-visuals PR.
4. **Standing prohibition:** any future hover-open, portal, per-item
   icons/links, or menu animation re-opens §10.1 / §2.4 / §2.2 / §9
   respectively.

### Contrast inventory (inventory only — design unchanged, routed to the accessibility-visuals PR)

| Surface                   | Colours (tokens)                          | Ratio         | Requirement                      | Verdict                                      |
| ------------------------- | ----------------------------------------- | ------------- | -------------------------------- | -------------------------------------------- |
| Trigger name, rest        | `#1A1C1E` on `#FFF`                       | 17.09:1       | 4.5:1                            | Pass                                         |
| Menu item text, rest      | `#1A1C1E` on `#FFF`                       | 17.09:1       | 4.5:1                            | Pass                                         |
| Menu item text, hover     | `#1A1C1E` on `#F4F5F6`                    | 15.66:1       | 4.5:1                            | Pass                                         |
| Chevron glyph             | `#969B9D` on `#FFF`                       | 2.81:1        | 3:1 (1.4.11)                     | **Fail — inventoried (Escalation 2)**        |
| Rest border               | `#D0D4D8` on `#FFF`                       | 1.49:1        | 3:1 if the boundary carries info | Likely exempt — guard comment at the site    |
| Hover border              | `#969B9D` on `#FFF`                       | 2.81:1        | none (hover enhancement)         | Recorded                                     |
| Menu boundary             | `#D0D4D8` on `#FFF`                       | 1.49:1        | as above                         | Likely exempt, recorded                      |
| Item hover fill vs menu   | `#F4F5F6` vs `#FFF`                       | 1.09:1        | none (hover enhancement)         | Recorded; **never a focus indicator (§7.2)** |
| Disabled name             | `#969B9D` on `#E1E7EA`                    | 2.25:1        | exempt (1.4.3 inactive)          | Exempt, recorded                             |
| Focus ring, both elements | `darkPrimary` inset on `#FFF` / `#F4F5F6` | 17.09 / 15.66 | 3:1                              | Pass                                         |

## Design fidelity

Verified by the measured Figma-parity loop — computed-style and bounding-box
readback in the live Storybook render, cross-checked against the master PNG
exports of all four state nodes, across two rounds (round 1 found a single
box-model blocker, fixed at the root; round 2 approved the full sweep):

- **Trigger renders exactly 225×48, radius 8, in every state**, with the border
  constant at 1px (transparent in disabled) so the geometry is bit-identical
  rest → hover → open → disabled. Avatar 32×32 at outer (8, 7) — the master's
  1px-above-centre offset; name Inter 500 14/18 `rgb(26,28,30)` starting at
  x=50 with its block at y=14; chevron box 20×20 at outer (192, 14), stroke
  `rgb(150,155,157)` at `1.66667`, **not** rotated when open.
- **Hover** matches `451:26229`: border `rgb(150,155,157)` + `rgba(49,59,67,0.14)
0px 8px 27px`; nothing else moves. **Open** matches `451:26252`: the card keeps
  the plain rest chrome — the hover recipe is gated on
  `:not([aria-expanded="true"])` as well as on the `aria-disabled` boundary, so
  a pointer resting on an open card cannot re-add the border or shadow.
  **Disabled** matches `451:26255`: `rgb(225,231,234)` fill, transparent border,
  photo at `opacity: 0.5`, name `rgb(150,155,157)`.
- **Round-1 parity blocker (the recurring Figma-inside-stroke trap, 3.1/3.2
  lineage):** the menu's own border inflated the popup to **138px** with rows at
  1/47/93. Fixed with `−1px` edge margins on the first and last `menuitem`,
  sliding the edge rows back under the kept real border (which §7.3 requires for
  forced colors) and letting `overflow: hidden` clip the hidden pixel. Re-measured
  exact: **menu 136 outer, rows at 0/46/92, first row text at y=72, open stack
  195** (48 + 11 + 136).
- **Reflow invariant re-verified after the fix** — the compensation is margins,
  not a fixed height, so a wrapping label still grows its row 44 → 66 and the
  menu 136 → 158 (SC 1.4.4/1.4.10, §10.3).
- Full sweep matched: menu 11px below the trigger at full card width, white on a
  `1px` `rgb(208,212,216)` border, radius 8, Landing shadow; rows 44px with a
  2px pitch, text Inter 500 14/18 `rgb(26,28,30)` at outer x=20; hovered row
  `rgb(244,245,246)` full-bleed with squared edges clipped at the corners. No
  transition anywhere. Static renders zero buttons; the wired trigger keeps one
  button in the tree in both states.

Tolerated residuals on record (the sanctioned 3.1 class, not open work):
Chromium-vs-Figma glyph rasterization in the name and row-label bands, and the
showcase board's own `#FBFBFB` surface behind the white card.

## Acceptance-criteria completion

| Source AC (epics.md Story 3.3)                                                                                           | Status | Evidence                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC1** — profile information and selection/menu interaction states supported; consistent with card and control patterns | ✅     | Four Figma state nodes delivered pixel-exact; APG menu button on the toolkit's native-button, wired/static and `aria-disabled` conventions; no new palette tokens.                          |
| **AC2** — active/disabled/error-relevant behaviour predictable; callback and contract behaviour clearly defined          | ✅     | Open/hover/disabled all measured; `error` documented N/A (not a form field); `onOpenChange(next)` and `onSelect(itemId)` specified in `types.ts`; five dev-warnings cover misconfiguration. |
| **AC3** — independently usable and testable; no future-story dependency                                                  | ✅     | No dependency on 3.4+; consumed standalone; 96-spec unit suite at 100% coverage + 4 Storybook stories + a 5-tile showcase group act as usage examples.                                      |

## Provenance

`UiProfileSelectCard` is source `new` — no `crm`/`website` profile menu card
existed, and the repo's `ui-card-item`/`ui-card-list` are the unrelated
marketing-site cards. Visuals come from the UI-kit Cards profile state nodes
(`451:26219` rest, `451:26229` hover, `451:26252` active+open, `451:26255`
disabled) inside frame `439:19893`; behaviour comes from the WAI-ARIA APG
**menu-button** pattern on the toolkit's established native-button,
wired/static and `aria-disabled`-boundary conventions. The
`component-provenance.md` Epic 3 row is the one governance entry still to be
appended for this story.

## Governance / CI gates addressed

- Exports added to `src/components/index.ts` (`UiProfileSelectCard`,
  `UiProfileSelectCardProps`, `ProfileSelectItem`); the export-surface drift
  guard in `tests/unit/components-index.test.ts` updated.
- **No palette additions** — the second Epic 3 story with zero new tokens.
- **100% statements / branches / functions / lines** of the component via
  `tests/unit/ui-profile-select-card.test.tsx` — **96 specs across 17 describe
  blocks**: wired trigger semantics, the static card, empty-items and
  disabled dominance, the `aria-disabled` boundary, open-transition focus, menu
  navigation with wrap/Home/End, item activation ordering, all five close paths,
  accessible names and imagery, the live-region prohibition, the dev-warning
  contract, the focus-return `ref`/`id` API, consumer `sx`/`menuSx`,
  mutation-killing assertions on the pure style recipes, the defensive
  branches of the focus helpers, and the Amendment A2 interaction-scoping and
  handler-identity blocks. Full repo suite: **67 suites / 1087 tests green**.
- **Honest-coverage note:** the last uncovered branch was a redundant
  double-guard in `use-profile-select-card.ts` — the static and disabled cases
  were each gated twice, which made one side of the second check unreachable.
  It was **collapsed into a single nullish guard** (both cases already resolve
  to a nullish `onOpenChange` handler) rather than covered with a contrived
  test, so the 100% figure reflects genuinely reachable code.
- `tsc` clean; ESLint clean at `--max-warnings=0` across the component and its
  tests. The one new `import/prefer-default-export` warning
  (`profile-select-card-group.tsx`) follows the identical pre-existing pattern
  of its sibling group files, and the repo lint gate passes no
  `--max-warnings` flag; Prettier clean; `make lint-metrics` (`rca`) reports
  **zero FAILs** for every new module; `jscpd` finds **0 clones** involving the
  component; `make lint-deps` (`depcruise`) reports **0 errors**.
- Storybook: 4 `UiProfileSelectCard` stories (`Profile Select Card`, `Open`,
  `Disabled`, `Static`) registered in `tests/visual/stories.json`; a 5-tile
  "Картка профілю (меню)" group added to the Figma-parity showcase board (Rest,
  forced Hover, Open with the master's captured row hover, Disabled, Static),
  with the two forced-state `sx` recipes living beside the task-card ones in the
  board's `styles.ts`. Baselines are generated in the pinned Playwright Docker
  image, per the standing procedure; the §13.10 real-state focus-ring snapshots
  follow the `item-row-focus` / `task-card-focus` pattern in
  `tests/visual/states.spec.ts` and land with that same pass.
- The avatar fixture is the master's own photo (a 64×64 export of the 32px
  master ellipse) committed as the `PROFILE_AVATAR_SRC` data-URI constant in the
  showcase fixtures module, beside `TASK_AVATAR_SRC` and shared by the stories
  and the board tiles. The person and the three commands are the master's own
  and travel as **consumer data** through `PROFILE_ITEMS` — the component bakes
  in no natural-language literal (SC 3.1.2).

## Definition of Done

| DoD item                                              | AC  | Status                                                                        |
| ----------------------------------------------------- | --- | ----------------------------------------------------------------------------- |
| Profile information rendered with clear semantics     | AC1 | ✅ decorative photo + content-named trigger; menu of native `menuitem`s       |
| Selection/menu interaction states supported           | AC1 | ✅ all four Figma state nodes measured pixel-exact                            |
| Consistent with established card and control patterns | AC1 | ✅ wired/static split, `aria-disabled` boundary, always-controlled state axis |
| Active/disabled behaviour predictable                 | AC2 | ✅ open keeps rest chrome; disabled dominates `open`; every open path no-ops  |
| Callback and contract behaviour clearly defined       | AC2 | ✅ `onOpenChange(next)` / `onSelect(itemId)` + shared-contract table          |
| Independently usable and testable                     | AC3 | ✅ standalone; 96 specs at 100% coverage; stories + showcase usage            |
| Binding a11y contract honoured §-by-§                 | —   | ✅ reproduced above; §13's ten regressions all asserted                       |
| Export recorded                                       | —   | ✅ `src/components/index.ts` + drift guard                                    |
| Quality gates green (this story's files)              | —   | ✅ coverage / `rca` / `jscpd` / `tsc` / ESLint / Prettier / `depcruise`       |

## Out of scope / deferred

- **Typeahead in the menu** (§4.3) — on record; revisit only if consumers ship
  long menus.
- **Per-item `disabled`** (§6.4) — no prop; the design has no such state.
- **Portalling, hover-open, per-item icons/links, menu animation** — each is a
  standing prohibition (§2.4 / §10.1 / §2.2 / §9); adding any re-opens the
  contract.
- **Contrast remediation** — the chevron `grey300` on white (2.81:1) is
  inventoried for the dedicated accessibility-visuals PR per the Story 1.3
  policy (suggested future swap: `grey250`); the rest/menu borders and the row
  hover fill are ruled 1.4.11-exempt decoration with guard comments at their
  sites.
- **Focus-ring pixel hardening / forced-colors visual design** — no Figma design
  exists; the toolkit's ring recipe applies by policy and the appearance audit
  stays with the accessibility-visuals PR.
- **`component-provenance.md` Epic 3 row** — the single remaining governance
  append for this story.
