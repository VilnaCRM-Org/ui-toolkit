# Story 3.2 — Task Card Workflow

- **Issue:** [#20](https://github.com/VilnaCRM-Org/ui-toolkit/issues/20)
- **Epic:** Epic 3 — Data Presentation and Cards
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 3.2: Task Card Workflow_

## Scope

Deliver the Epic 3 task/person card:

- `UiTaskCard` (`src/components/ui-task-card`) — one kanban-board task card (the
  Figma UI-kit "Cards" task master): a 34×34 assignee photo, a naturally-wrapping
  task title, and a deadline meta row (consumer-supplied label + a date-time
  chip). Wiring `onActivate` turns the whole card into one native action
  `<button type="button">`; without it the card is static content. The card is a
  full-bleed bottom-divider row — board columns stack cards flush at a 94px
  pitch with the divider as the only separator.

Deliberately **not** a disclosure (unlike `UiItemRow`): activation is
fire-and-forget — the card triggers a details view whose lifecycle it neither
renders nor tracks, so there is no `aria-expanded`/`aria-controls`/`panelId`.

## Delivered API

### `UiTaskCard`

| Prop            | Type              | Notes                                                                                     |
| --------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| `title`         | `string`          | Task title. Wraps naturally (2 lines in the master); never clamped.                       |
| `deadlineLabel` | `string`          | Meta label (e.g. "Дедлайн"). **Required** — no baked-in natural-language literal (3.1.2). |
| `deadline`      | `string`          | Deadline chip text (e.g. "12.09 15:00"). Non-interactive.                                 |
| `assignee`      | `TaskAssignee?`   | `{ name, avatarSrc }` pair. Omit for an unassigned task — track stays reserved.           |
| `onActivate`    | `() => void`      | Presence makes the card one native `<button type="button">`; absent → static `<div>`.     |
| `disabled`      | `boolean?`        | `aria-disabled` boundary pattern — focusable, model-layer no-op, hover suppressed.        |
| `id`            | `string?`         | Lands on the `<button>` so consumers can re-resolve it for focus return.                  |
| `lang`          | `string?`         | BCP 47 tag, only when the card's language differs from the page (3.1.2).                  |
| `sx`            | `SxProps<Theme>?` | Merged last onto the card root (`[base, ...consumerSx]`).                                 |

`TaskAssignee` pairs `name: string` with `avatarSrc: { src: string } | string` —
the name is used **verbatim** as the avatar `alt`, so a nameless photo is
unrepresentable by construction. `forwardRef<HTMLButtonElement>` lands on the
`<button>` itself.

## Design decisions

### Figma alignment (UI-kit "Cards" task masters — no `crm`/`website` card exists)

The repo's `ui-card-item`/`ui-card-list` are the unrelated marketing-site cards,
so the card is composed 1:1 from the Figma UI-kit Cards masters:

| Element      | Figma node(s)                     | Applied                                                                                                                                                                                                                 |
| ------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card master  | Rest `439:19884` (372×94)         | Full-bleed row, transparent bg, `1px` `brandGray` bottom divider only, no radius; `14px 16px 13px` padding (+1px divider = the master's 14px bottom band); grid `34px` avatar track + `12px` gap; `minHeight: 5.875rem` |
| Avatar       | (in master)                       | 34×34 circular informative `<img>` (`alt = assignee.name`), real photo from the master's instance override                                                                                                              |
| Title        | (in master)                       | Inter Medium 16/18 `#404142` (`grey200`), natural wrap, `overflowWrap: anywhere`                                                                                                                                        |
| Meta row     | (in master)                       | 8px below title; label Inter Medium 14/18 `#969B9D` (`grey300`) + chip `brandGray` fill, 4px radius, `2px 4px` padding, `darkPrimary` 14/18 ink                                                                         |
| Hover master | `439:20208`                       | Title → `darkPrimary`, label → `grey200`, chip → white fill + `brandGray` border + `0 4px 2px rgba(174, 181, 186, 0.25)` shadow                                                                                         |
| Board usage  | skeleton boards `538:*` / `632:*` | Cards stack flush at a 94px pitch (divider-separated, no gap); width consumer-fluid (372/561/770 across screens)                                                                                                        |

**No new palette tokens** — every ink resolves to an existing `sharedPalette`
token; the chip hover shadow stays a raw rgba literal per the 3.1 recipe
convention (`box-shadow`, not a filter — the chip is an opaque box). The chip
carries a `1px` **transparent** border at rest so the hover border adds no
geometry (the `UiPagination` no-jitter precedent).

### Behaviour

- **Wired/static split** (3.1 precedent): `onActivate` present → one native
  `<button type="button">` (mandatory `type` — an untyped button submits
  enclosing forms); absent → a `<div>` with no role/tabindex. Both branches
  render an identical content tree.
- **No key handlers anywhere** — Enter/Space come from the native button; a
  manual keydown handler double-fires on Space.
- **`disabled` = the `aria-disabled` boundary pattern**: still a focusable
  `<button>` with `aria-disabled="true"`, activation no-op'd in the model layer,
  native `disabled` never set — focus is retained when a focused card flips
  disabled under the user (SC 2.4.3). Hover recipe is suppressed via the gated
  `'&:hover:not([aria-disabled="true"])'` selector; `cursor: default`.
- **Focus return API**: the forwarded `ref` and `id` both land on the
  `<button>`; the card never moves focus itself. Consumers on refetch-heavy
  boards should re-resolve by `id` — a node captured before a remount is
  detached and `.focus()` on it silently drops focus to `<body>`.
- **CSS grid with a reserved 34px avatar track** — title left edges stay aligned
  across assigned and unassigned cards with zero placeholder DOM.
- Decomposed into single-purpose modules (`types.ts`, `styles.ts` recipe/layout,
  `task-card-content.tsx` shared content tree, `use-task-card.ts` view model,
  `index.tsx` wired/static split) to stay inside the `rca` per-function budgets.
- Dev-only guidance via the shared `useDevWarning` when an `assignee` arrives
  with a blank `name` (renders `alt=""`) or without a usable `avatarSrc`
  (renders no `<img>`); both are documented-unsupported states, silent in
  production. An omitted `assignee` is the supported unassigned state — no
  warning, no initials placeholder (the design has none).

### Contract deviations (documented)

- `value`/`onChange` are **not applicable** — the card feeds no state back; the
  analogue is `onActivate`, a fire-and-forget action callback whose presence is
  the wired/static switch.
- `error` is **not applicable** — presentation, not a form field.
- `size`/`variant` are **not applicable** — a single Figma master; width is
  fluid (`100%`), height is a `minHeight`, and the design ships zero variant
  axes.
- **No disclosure semantics** (`aria-expanded`/`aria-controls`) — divergence
  from `UiItemRow`, because the card does not own or track its details surface.
- **No heading role** and **no self-`<li>`** — column headings and list
  wrapping belong to the consumer (or a future `UiTaskCardList`), mirroring the
  `UiItemRow`/`UiItemsList` split.
- **No roving tabindex / arrow-key navigation** — a board column is a list of
  independent buttons, not a composite widget; N tab stops is the conforming
  shape.

## Shared-contract coverage

| Field      | UiTaskCard                                          |
| ---------- | --------------------------------------------------- |
| `value`    | ⛔ N/A — fire-and-forget action, no state fed back  |
| `onChange` | ⛔ N/A — `onActivate` is the analogue               |
| `disabled` | ✅ as `disabled` (`aria-disabled` boundary pattern) |
| `error`    | ⛔ N/A — presentation, not a form field             |
| `size`     | ⛔ N/A — single Figma master, fluid width           |
| `variant`  | ⛔ N/A — two states, zero variants                  |
| `sx`       | ✅ (on the card root, merged last)                  |

## Accessibility semantics

- **Native action button (wired).** One `<button type="button">`; accessible
  name is content-derived — `"{assignee.name} {title} {deadlineLabel}
{deadline}"` — with no `aria-label` anywhere (WCAG 2.5.3). The `@mention` in a
  title stays plain text (a nested link inside a button is invalid and strips
  name text). The deadline label+chip are adjacent inline spans concatenated
  naturally by the accname algorithm — zero ARIA on the chip.
- **Informative avatar.** `alt = assignee.name` verbatim (SC 1.1.1) — the photo
  is the card's only per-assignee channel. Real `<img>` with `width`/`height`
  attributes, `loading="lazy"`, `decoding="async"`, `draggable={false}`, no
  `onError` (on 404 the alt text renders inside the clipped 34px box, which is
  exactly `alt`'s job).
- **`aria-disabled` boundary** with regression-tested focus retention.
- **Two-colour both-inset focus ring** — `inset 0 0 0 2px darkPrimary` +
  `inset 0 0 0 4px white`, declared after the hover rule; board columns are
  scroll containers that clip outset rings, and the card paints no fill of its
  own, so the ring carries both a dark and a light layer for any column
  backdrop. A `forced-colors: active` branch supplies
  `outline: 2px solid Highlight; outline-offset: -2px` (box-shadow is discarded
  in forced-colors mode).
- **No clamp, no `height`, no `overflow`** on the card — `minHeight: 5.875rem`
  only, so 200% text zoom and 320px reflow never shear content (SC 1.4.4 /
  1.4.10).
- **Zero live regions in any state** (regression-tested with an attribute-level
  sweep, retro-applied to `ui-item-row` in this story). Deadline re-renders and
  disabled flips announce nothing; board-level summaries belong to the consumer.
- **Escalation on record (Major):** Figma ships no disabled visual, so
  `disabled` is semantics-only (suppressed hover + `cursor: default`) — sighted
  mouse users see only the absence of hover feedback. Either a Disabled master
  gets added to Figma or this weak visual signal stays accepted; the repo's
  design-first policy forbids inventing one here.

## Design fidelity

Verified by the measured Figma-parity loop — computed-style + bounding-box
readback in the live Storybook render plus PIL pixel comparison against the
master PNG exports at 372px, across two rounds (round 1 found two box-model
blockers, both fixed at the root; round 2 approved the full sweep):

- **Card renders exactly 372×94** with the divider row at y=93 inside the box;
  computed padding is `14px 16px 13px` because CSS draws `border-bottom`
  **outside** the padding while Figma strokes **inside** — 13px surface + 1px
  divider reproduces the master's 14px bottom band (round-1 blocker: 97px).
- **Chip is exactly 85.8×22 at y=58**; computed `1px 3px` padding + the
  mandated 1px transparent border reproduces the master's 2px/4px inside-stroke
  inset (round-1 blocker: 24px tall). The chip rect is **bit-identical
  rest→hover** (no jitter), including the forced-hover showcase tile.
- Full sweep matched: grid 34px avatar track + 12px gap; avatar 34×34 circle at
  (16,14) with `width`/`height` attributes and verbatim `alt`; title Inter 500
  16/18 `rgb(64,65,66)` at x=62 wrapping 2 lines, `overflowWrap: anywhere`, no
  clamp; meta row 8px below, 8px gap; label 14/18 `rgb(150,155,157)`; chip fill
  `rgb(225,231,234)`, radius 4, ink `rgb(26,28,30)`.
- Real `:hover`: title → `rgb(26,28,30)`, label → `rgb(64,65,66)`, chip →
  white + `rgb(225,231,234)` border + `rgba(174,181,186,0.25) 0px 4px 2px`
  shadow; card bg/divider unchanged. `:focus-visible`: the exact two-layer
  inset ring (2px `rgb(26,28,30)` + 4px white), `outline: none`, wins over
  hover. Disabled suppresses the hover recipe entirely; static renders zero
  buttons; unassigned keeps the title at x=62 (reserved track); long-title
  grows to 130px (4 lines) with the full text in the DOM. No transition
  anywhere.
- Pixel structure identical in both states: divider y=93, avatar bounds
  x[16..49] y[14..47], chip fill x[131..216] y[58..79], title left edge x=63.

Tolerated residuals on record (the sanctioned 3.1 class, not open work):
Chromium-vs-Figma glyph rasterization in the text bands, a 1px sub-pixel
glyph-edge advance on the label, and the showcase board's own `#FBFBFB`
surface behind the transparent card.

## Acceptance-criteria completion

| Source AC (epics.md Story 3.2)                                                                                                      | Status | Evidence                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC1** — key card content and state behaviour consistent with board expectations; clear rest/active/disabled interaction semantics | ✅     | Rest/hover from the two Figma masters; `:active` is a CSS micro-state; `disabled` via the `aria-disabled` boundary; cards stack flush at the board's 94px divider pitch.               |
| **AC2** — API aligns with shared toolkit contract principles; exceptions documented                                                 | ✅     | Shared-contract table above; every N/A carries its rationale in `types.ts`; `disabled`/`sx` are real contract hits; deviations (no disclosure, no heading, no self-`<li>`) documented. |
| **AC3** — independently usable and testable; no future-story dependency                                                             | ✅     | No dependency on later stories; consumed standalone or under any list/column wrapper; 59-spec unit suite + Storybook stories + showcase board group act as usage examples.             |

## Provenance

`UiTaskCard` is source `new` (no `crm`/`website` task/person card existed;
`ui-card-item`/`ui-card-list` are unrelated marketing-site cards). Visuals come
from the UI-kit Cards task masters (`439:19884`/`439:20208`); behaviour from the
toolkit's established native-button, `aria-disabled`-boundary and wired/static
conventions. Recorded in `component-provenance.md` under Epic 3.

## Governance / CI gates addressed

- Exports added to `src/components/index.ts` (`UiTaskCard`, `UiTaskCardProps`,
  `TaskAssignee`); export-surface drift guard updated.
- **No palette additions** — first Epic 3 story with zero new tokens.
- **100% coverage** (global gate) via `tests/unit/ui-task-card.test.tsx` — 59
  specs across 12 describe blocks: wired/static semantics, the exact accessible
  name, keyboard exactly-once activation, the `aria-disabled` boundary with
  focus retention, the focus-return `ref`/`id` API, the informative-avatar
  contract + dev warnings (with production silence), chip/meta semantics, the
  no-clamp title, the live-region prohibition (attribute-level sweep), pure
  mutation-killing `taskCardSx` assertions, consumer `sx` shapes, and the
  `useTaskCard` view model.
- Storybook: 5 `UiTaskCard` stories (`Task Card`, `Disabled`, `Static`,
  `Unassigned`, `Long Title`) registered in `tests/visual/stories.json`; a
  5-tile "Картка завдання (Дошка)" group added to the Figma-parity showcase
  board (Rest, forced Hover, Disabled, Static, Unassigned); real-state
  snapshots (`task-card-hover.png`, `task-card-focus.png`) added to
  `tests/visual/states.spec.ts`. Baselines generated in the pinned Playwright
  Docker image.
- The story avatar fixture is the master's own 34×34 assignee photo, committed
  as a data-URI constant in the showcase fixtures module (shared by the story
  and the board tiles).
- `tsc`, ESLint (no suppressions), Prettier, `depcruise` (0 errors) clean; every
  new `ui-task-card` module inside the `rca` per-function budgets (verified in
  the `rca` container run).
- Opportunistic fixes sanctioned by the a11y contract: the
  `ui-calendar-multi-select` WCAG-numbering comment (2.4.13 is Focus
  Appearance, not 2.4.11) and the `expectNoLiveRegion` attribute-level sweep
  retro-applied to `tests/unit/ui-item-row.test.tsx`.

## Definition of Done

| DoD item                                               | AC  | Status                                                                  |
| ------------------------------------------------------ | --- | ----------------------------------------------------------------------- |
| Card renders key content with clear semantics          | AC1 | ✅ avatar/title/deadline; content-named native button or static content |
| Rest/active/disabled interaction semantics clear       | AC1 | ✅ Figma rest+hover; CSS `:active`; `aria-disabled` boundary            |
| Consistent with board expectations                     | AC1 | ✅ flush 94px divider pitch; fluid width; reserved avatar track         |
| API aligns with shared contract; exceptions documented | AC2 | ✅ table above + `types.ts` rationale                                   |
| Independently usable and testable                      | AC3 | ✅ standalone; 59 specs at 100% coverage; stories + showcase usage      |
| Export + provenance recorded                           | —   | ✅ `src/components/index.ts`, `component-provenance.md` Epic 3          |
| Quality gates green (this story's files)               | —   | ✅ coverage/`rca`/`tsc`/ESLint/Prettier/`depcruise`; visual baselines   |

## Out of scope / deferred

- **Task-card list wrapper** — column composition (`<ul>`/`<li>`, headings) is
  the consumer's or a future story's; the card never self-wraps.
- **Disabled visual treatment** — no Figma master exists (escalation on
  record); ships semantics-only.
- **Contrast remediation** — the rest-state label ink `#969B9D` (2.81:1) is
  inventoried for the dedicated accessibility-visuals PR per the Story 1.3
  policy (suggested future swap: existing `grey250`); the chip fill/divider are
  ruled 1.4.11-exempt decoration with guard comments at both sites.
- **Pre-existing repo debt observed, not touched:** 20 `rca` violations in
  earlier Epic 2 modules and 3 bats failures inherited from #17's Makefile
  change (`wait-on` timeout assertion + missing `test-visual-update` manifest
  row).
