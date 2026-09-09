import type { SxProps, Theme } from '@mui/material';

/**
 * One removable filter chip: a 30px pill carrying a two-segment label (a grey
 * prefix plus the dark filter value) and a decorative × glyph. Figma "Tags"
 * master, four states (rest, hover, active, disabled) and nothing else — no
 * sizes, no variants, no error master.
 *
 * **The whole chip is ONE remove button** (a11y contract §1): removal is the
 * chip's only interaction, so a nested 24px × button inside a non-interactive
 * pill is rejected — it would shrink the target for no reason and give one
 * action two tab stops. The wired chip is a single native
 * `<button type="button">` spanning the full 30px pill (≥24px, SC 2.5.8), with
 * no inner interactive elements. It carries **no list semantics**: the consumer
 * owns any surrounding list structure, exactly as the consumer owns the
 * radiogroup around `UiIntegrationCard`.
 *
 * **ARIA state mapping: none.** No `aria-pressed`, no `aria-checked`, no
 * `aria-expanded` — a plain action button. `aria-disabled` appears only through
 * the disabled boundary below.
 *
 * **Accessible name.** Content-derived, in this exact DOM order: the visible
 * `label`, the visible `filterValue`, then a visually-hidden span carrying
 * `removeLabel` (default `', видалити фільтр'`). Visible text therefore comes
 * FIRST and is contained in the name verbatim (SC 2.5.3); the removal semantics
 * are appended. `aria-label` on the root is **forbidden** — it would overwrite
 * the visible text. Figma paints the label as two differently-coloured segments,
 * which is why the visible text is two props rather than one string; the name is
 * their concatenation plus the hidden suffix, still fully content-derived.
 *
 * **Focus after removal — a consumer duty.** The chip unmounts when the consumer
 * removes it, and it NEVER moves focus on the consumer's behalf. After handling
 * `onRemove` the consumer MUST move focus to the next chip, the previous chip,
 * or the filter-region heading; otherwise focus drops to `<body>` and the
 * keyboard user loses their place (SC 2.4.3).
 *
 * The chip follows the repo wired/static split (`UiIntegrationCard` precedent),
 * switched on `onRemove`:
 * - Wired → the `<button type="button">` above.
 * - Unwired → a static `<div>` with no role, no `tabindex` and no ARIA of any
 *   kind, not even `aria-disabled`. The × glyph is still painted decoratively
 *   (the `UiItemRow` chevron precedent) and both branches render an identical
 *   content tree, so the reading order never changes.
 *
 * The glyph is `aria-hidden="true"` and `focusable="false"`, never an `<svg>`
 * with a `<title>` — it duplicates the removal semantics the hidden suffix
 * already carries. Keyboard support is the platform's: Tab reaches the chip and
 * Enter/Space fire `onRemove` natively, with no manual key handlers (a manual
 * handler double-fires on Space) and no Delete/Backspace shortcut. There is no
 * animation, no transition and no live region in any state — announcing the
 * consequences of a consumer-owned removal is the consumer's concern.
 *
 * Shared prop-contract mapping:
 *
 * | Field      | UiFilterChip    | Rationale                                   |
 * | ---------- | --------------- | ------------------------------------------- |
 * | `value`    | N/A             | A chip has no value axis; existence is state|
 * | `onChange` | as `onRemove()` | Bare payload — one path, one direction      |
 * | `disabled` | as `disabled`   | `aria-disabled` boundary, never native      |
 * | `error`    | N/A             | No error master; validation is the filter's |
 * | `size`     | N/A             | One 30px master; height is a `minHeight`    |
 * | `variant`  | N/A             | Rest/hover/active are states, no variants   |
 * | `sx`       | supported       | Merged last on the root, `[base, ...sx]`    |
 */
export interface UiFilterChipProps {
  /** The grey prefix segment, e.g. `'Фільтр:'`. First half of the name. */
  label: string;
  /**
   * The dark value segment, e.g. `'Коментар - “клієнт”'`.
   * Second half of the name.
   */
  filterValue: string;
  /**
   * The visually-hidden suffix that gives the name its action semantics.
   * Defaults to `', видалити фільтр'`. Override it to match the surrounding
   * copy — never to blank it out, which would leave a button whose name reads
   * as a static label (dev-warned).
   */
  removeLabel?: string | undefined;
  /**
   * Requests removal of this filter. Bare and payload-free on purpose: the chip
   * has exactly one state-change path in exactly one direction, so nothing can
   * race — close over the filter id when mapping chips. Presence is what makes
   * the chip a wired button; without it the chip is static content. A DECLINED
   * removal leaves the chip mounted and eligible, so the next activation fires
   * again.
   */
  onRemove?: (() => void) | undefined;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"`, the hover and active
   * recipes are suppressed and `onRemove` never fires — so keyboard focus is
   * never dropped when a focused chip flips disabled (SC 2.4.3). Native
   * `disabled` is never set. Figma ships a disabled column, so it is painted:
   * both label segments swap to grey, and nothing is dimmed by opacity.
   */
  disabled?: boolean | undefined;
  /** `id` for the chip; lands on the `<button>` so focus can be re-resolved. */
  id?: string | undefined;
  /** Only when the filter text's language differs from the page's (SC 3.1.2). */
  lang?: string | undefined;
  sx?: SxProps<Theme> | undefined;
}
