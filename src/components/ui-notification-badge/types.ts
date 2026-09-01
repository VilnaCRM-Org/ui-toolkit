import type { SxProps, Theme } from '@mui/material';

/**
 * The notification bell: a 48px circular button with an overhanging 18px counter
 * chip (Figma Board A, state nodes 451:26194 rest / 451:26199 hover /
 * 451:26209 active / 451:26214 disabled). Four visual states exist in the design
 * and nothing else — no variants and no sizes.
 *
 * The widget is ONE native `<button type="button">` (a11y contract §6): the whole
 * 48px circle is the target (SC 2.5.8 passes with margin), it fires `onActivate`,
 * and there are no key handlers — the native button already fires on Enter and
 * Space, and a manual handler would double-fire on Space (S6). The counter chip is
 * never a second control: removal, dismissal and panel behaviour all belong to the
 * consumer.
 *
 * The badge follows the repo wired/static split, switched on `onActivate`:
 * - Wired → the button above.
 * - Unwired → a static `<div>` with no role, no `tabindex` and no ARIA of any
 *   kind, not even `aria-disabled` (S2). Both branches render an identical
 *   content tree, so the reading order never changes. A static badge is pure
 *   decoration: it carries no accessible name of its own, so a consumer who needs
 *   the count announced must either wire it or provide their own adjacent text.
 *
 * **Accessible name (Ruling 5).** The name is `aria-label` on the button, built
 * from `label` and the DISPLAY string — `String(count)`, or `` `${max}+` `` once
 * `count > max`. With `count > 0` it is `` `${label}: ${display}` ``
 * ("Сповіщення: 1", "Сповіщення: 9+"); with `count === 0` it is `label` alone.
 * Using the display string rather than the raw count is what keeps the visible
 * "9+" contained in the name (WCAG 2.5.3): a name saying "42" over a chip reading
 * "9+" is a speech-input failure. The format bakes in NO plural word, because
 * Ukrainian plural forms make a hard-coded "unread" a localization defect;
 * consumers needing prose override `label`. There is deliberately no `getName`
 * prop in this release — adding one must also add the dev warning that its output
 * contains the display string.
 *
 * **No live region, in any state, ever.** The component renders no `aria-live`,
 * no `role="status"` and no `role="alert"` (S9). A count that changes while the
 * user is elsewhere is an editorial decision that only the consumer can make, and
 * the re-rendered `aria-label` is what serves on-focus and on-demand reading. Do
 * not wrap the badge in a live region "to fix" this — that turns every unrelated
 * re-render into an interruption; announce the change from the surface that owns
 * the data instead.
 *
 * Shared prop-contract mapping (a11y contract §11):
 *
 * | Field      | UiNotificationBadge | Rationale                                |
 * | ---------- | ------------------- | ---------------------------------------- |
 * | `value`    | as `count`          | Numeric axis (the `UiPagination` shape)  |
 * | `onChange` | N/A                 | The button announces intent, not a count |
 * | `disabled` | as `disabled`       | `aria-disabled` boundary, never native   |
 * | `error`    | N/A                 | No error master; the count cannot be bad |
 * | `size`     | N/A                 | One 48px master                          |
 * | `variant`  | N/A                 | Rest/hover/active/disabled are states    |
 * | `sx`       | supported           | Merged last on the root, `[base, ...sx]` |
 *
 * There is no animation and no transition in any state, and no hover- or
 * focus-triggered content.
 */
export interface UiNotificationBadgeProps {
  /**
   * Unread count. Required, and ALWAYS controlled — the badge never counts for
   * itself. Coerced to a non-negative integer for both the chip and the name
   * (negative and non-finite values become 0, fractions are floored), so the
   * visible counter and the accessible name can never disagree; an out-of-range
   * value dev-warns. `count === 0` renders NO chip at all.
   */
  count: number;
  /**
   * Name stem, default `'Сповіщення'`. It is the whole accessible name at
   * `count === 0` and the prefix of `` `${label}: ${display}` `` above it. A blank
   * override leaves a nameless button and dev-warns.
   */
  label?: string | undefined;
  /**
   * Counter cap, default `9`: above it the chip and the name both read
   * `` `${max}+` ``. Fractions are floored and values below 1 (or non-finite)
   * become 1; either way it dev-warns. The chip is a fixed 18px circle in the
   * master, so a cap wider than two glyphs will overflow it.
   */
  max?: number | undefined;
  /**
   * Requests the notification surface. Bare and payload-free: the badge owns no
   * panel and never opens one itself. Presence makes the badge a wired button;
   * absence makes it static content.
   */
  onActivate?: (() => void) | undefined;
  /**
   * Declares that `onActivate` opens a menu → `aria-haspopup="menu"`. It is what
   * switches the `aria-expanded` channel on, so pass it together with `menuOpen`.
   */
  hasPopup?: 'menu' | undefined;
  /**
   * Open state of the consumer's popup → `aria-expanded` in BOTH states (only
   * while `hasPopup` is set). It also paints the Figma "active" chrome, because a
   * solid-blue bell reads as "panel open" — the design's pressed column and the
   * expanded state are the same picture, so no extra prop is invented.
   */
  menuOpen?: boolean | undefined;
  /**
   * `id` of the consumer's popup → `aria-controls`, emitted ONLY while `menuOpen`
   * is true AND this id contains non-whitespace text, so a closed badge never
   * leaves a dangling idref (the 3.3 rule) and an open one never emits a blank
   * one. `aria-controls` is an IDREF LIST, so a blank value is a zero-length
   * list — invalid ARIA rather than a dangling reference — and omitting beats
   * emitting. Mount the panel under this id while `menuOpen` is true.
   */
  menuId?: string | undefined;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"`, the hover and active
   * recipes are suppressed and `onActivate` never fires — so keyboard focus is
   * never dropped when a focused badge flips disabled (WCAG 2.4.3). Figma ships a
   * disabled column, so it is painted as well as exposed.
   */
  disabled?: boolean | undefined;
  /** `id` for the badge; lands on the `<button>` so focus can be re-resolved. */
  id?: string | undefined;
  sx?: SxProps<Theme> | undefined;
}
