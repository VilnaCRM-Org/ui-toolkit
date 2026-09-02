import type { SxProps, Theme } from '@mui/material';

/**
 * One row in the picker: an image thumbnail or a solid colour swatch, beside a
 * label. `kind` selects which of `src`/`color` is painted (a11y contract §3.1) —
 * the other is ignored, so a consumer never has to null out the unused field.
 */
export interface BackgroundOption {
  /** Stable option id; travels back through `onChange` and is the React key. */
  id: string;
  /** Visible row text. It IS the row's accessible name — nothing is appended. */
  label: string;
  kind: 'image' | 'color';
  /** The board-preview photo (`kind: 'image'`); ignored otherwise. */
  src?: string;
  /** The swatch fill (`kind: 'color'`); ignored otherwise. */
  color?: string;
}

/**
 * One section of rows. An `undefined` heading renders the rows with no
 * `role="group"` wrapper at all (a11y contract §3.2) — the Figma "Название"
 * group carries none, only the "Цвет" group does.
 */
export interface BackgroundOptionGroup {
  heading?: string;
  options: readonly BackgroundOption[];
}

/**
 * The board-background dropdown: a 220px card whose OPEN state is the SAME card
 * grown downward (Figma node 439:19673 rest / 439:19677 hover / 439:19689 open /
 * 439:19715 disabled) — never a detached popper. Closed, it is a 48px trigger
 * pill; open, the trigger row is followed by a full-bleed divider, every option
 * row across every group (a divider precedes each group), and no scroll region.
 *
 * The widget is the WAI-ARIA APG **menu button**, mirroring
 * `UiProfileSelectCard` (a11y contract §1), but with `menuitemradio` rows in
 * place of command `menuitem`s, because the rows are a single-select VALUE axis
 * rather than fire-and-forget actions: the trigger is one native
 * `<button type="button">` carrying `aria-haspopup="menu"`, a permanent
 * `aria-expanded`, and `aria-controls` only while the menu is mounted; the popup
 * is a `role="menu"` rendered in place (no portal) and unmounted when closed;
 * each row is a native `role="menuitemradio"` button with `aria-checked` and
 * `tabIndex={-1}` (the menu contributes zero tab stops — rows are found by role,
 * never a roving `tabindex` or `aria-activedescendant`); a group with a
 * `heading` wraps its rows in `role="group"` whose first child is the visible
 * heading text.
 *
 * Ownership split (mirroring §4 of the profile-card contract): the **consumer
 * owns `open`**, the **component owns focus**. The picker never self-flips its
 * open state — it only ever *requests* the next one through `onOpenChange` —
 * while every focus move (into the menu on open, back to the trigger on Escape
 * or a row activation, on an outside pointerdown) is performed by the
 * component.
 *
 * The picker follows the repo wired/static split, switched on `onOpenChange`:
 * - Wired → the button trigger above, plus the menu while `open`.
 * - Unwired → a static `<div>`: no button role, no `tabindex`, no ARIA of any
 *   kind, and the menu never renders even if `open` is passed (dev-warned). Both
 *   branches render an identical closed-card content tree, and the DISABLED
 *   paint is driven by the `disabled` prop directly (not an `[aria-disabled]`
 *   selector), so it shows in the static branch too.
 *
 * Keyboard (kept intentionally small — no stranded-focus rescue machinery):
 * ArrowDown/ArrowUp open the closed trigger onto the first/last row and move
 * between rows once open (wrapping); Home/End jump to the first/last row;
 * Escape returns focus to the trigger, then closes; an outside `pointerdown`
 * closes with no focus call. Selecting a row closes the menu, returns focus to
 * the trigger, then calls `onChange(id)` — unless the row was already the
 * checked one, in which case it closes silently. `disabled` beats `open`.
 *
 * The trigger's chevron (`ChevronDownGlyph`, shared field-controls glyph) never
 * rotates open — the Figma open frame still points it down — and its ink is the
 * constant grey300 in every state; row ink is the constant darkSecondary in
 * every state, because Figma paints no row hover and no row-selected fill.
 *
 * **Deviation from the raw Figma extraction:** the design's row centres measure
 * an inconsistent 49px-then-46px pitch (hand-placement drift, reported in the
 * extraction). This implementation uses a uniform 14px gap between rows (and
 * between a divider and the row/heading that follows it, 12px) — a constant
 * 46px pitch — rather than reproducing the drift.
 *
 * Shared prop-contract mapping:
 *
 * | Field      | UiBackgroundPicker | Rationale                                 |
 * | ---------- | ------------------- | ----------------------------------------- |
 * | `value`    | as `value`           | Single-select id; always `value ?? ''`   |
 * | `onChange` | as `onChange(id)`    | Fires only on a genuine value change      |
 * | `disabled` | as `disabled`        | `aria-disabled` boundary, never native    |
 * | `error`    | N/A                  | Not a form field; no error master         |
 * | `size`     | N/A                  | One 220px master; height is content-driven|
 * | `variant`  | N/A                  | Rest/hover/open/disabled are states       |
 * | `sx`       | supported            | Merged last on the card root              |
 */
export interface UiBackgroundPickerProps {
  /** The rows, grouped; an empty group array renders a card with no menu. */
  groups: readonly BackgroundOptionGroup[];
  /** Trigger text; constant across every row selection. Defaults to the board copy. */
  label?: string;
  /** Selected option id (wired pickers only). Always controlled, `value ?? ''`. */
  value?: string;
  /** Fired with the newly-checked row's id; never fired for a re-pick of the same row. */
  onChange?: (id: string) => void;
  /** Menu open state (wired pickers only). Always controlled; defaults to `false`. */
  open?: boolean;
  /** Requests the next open state. Presence makes the picker a wired menu button. */
  onOpenChange?: (next: boolean) => void;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"` and every open path
   * no-ops — so keyboard focus is never dropped when a focused picker flips
   * disabled. Native `disabled` is never set. While `disabled`, the closed
   * presentation wins over `open`.
   */
  disabled?: boolean;
  /** `id` for the trigger; falls back to a generated one so the menu can name itself. */
  id?: string;
  /** Only when the picker's language differs from the page language (SC 3.1.2). */
  lang?: string;
  /** Merged last on the card root. */
  sx?: SxProps<Theme>;
}
