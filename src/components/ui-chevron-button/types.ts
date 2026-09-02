import type { SxProps, Theme } from '@mui/material';

/**
 * A 30px circular chevron control (Figma nodes 451:25765 rest / 451:25768 hover
 * / 451:25771 active / 451:25774 disabled, Board A y=1622): a bordered white
 * circle holding one 20px stroked chevron, used for board follow-up navigation
 * (e.g. "load more" / "next" affordances outside `UiPagination`).
 *
 * **Icon-only, so `label` is the ONLY name channel.** There is no visible text
 * (SC 2.5.3 does not bind), so `label` is required and renders as `aria-label`
 * on the wired root — never omitted, never blank (dev-warned).
 *
 * The button follows the repo wired/static split (the `UiActionIconBar` unwired
 * rule), switched on `onActivate`:
 * - Wired → a native `<button type="button">` named by `aria-label`, carrying
 *   the `aria-disabled` boundary below. No manual key handlers — a native button
 *   already fires on Enter and Space.
 * - Unwired → a static `<span>` holding the glyph, with no role, no tabindex and
 *   no ARIA of any kind, not even `aria-disabled`. Both branches render an
 *   identical glyph, so the presentation never changes shape between them.
 *
 * **`direction` is purely visual.** It flips which way the glyph points and
 * carries no semantic weight of its own; the on-canvas Figma instance is
 * horizontally flipped, so the design's own "chevron-left" layer renders
 * pointing RIGHT — `direction` therefore defaults to `'right'`.
 *
 * **`disabled`** uses the repo `aria-disabled` boundary: still a real, focusable
 * button whose activation no-ops, so keyboard focus is never dropped when a
 * focused button flips disabled (SC 2.4.3). Native `disabled` is never set. The
 * glyph ink stays grey300 in every state, including disabled — only the fill and
 * border flip.
 */
export interface UiChevronButtonProps {
  /** Accessible name (`aria-label`); the button's only name channel. */
  label: string;
  /** Which way the glyph points; purely visual. Defaults to `'right'`. */
  direction?: 'left' | 'right';
  /**
   * Fires on activation. Presence wires the button as a native
   * `<button type="button">`; without it the button is static, non-interactive
   * paint.
   */
  onActivate?: () => void;
  /**
   * Disabled status, via the repo `aria-disabled` boundary: still a real,
   * focusable `<button>`, but `aria-disabled="true"`, the hover/active recipes
   * are suppressed and `onActivate` never fires. Native `disabled` is never set.
   */
  disabled?: boolean;
  /** `id` for the button; lands on the `<button>` so focus can be re-resolved. */
  id?: string;
  sx?: SxProps<Theme>;
}
