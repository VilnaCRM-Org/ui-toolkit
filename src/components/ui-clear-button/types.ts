import type { SxProps, Theme } from '@mui/material';

/**
 * A bare-ink "clear" action: a leading × glyph and a label, with NO fill, border,
 * radius, shadow or padding in any state (Figma Board A, node `451:25793` rest /
 * `451:25797` hover / `451:25801` active / `451:25805` disabled). Only the label
 * and glyph ink change between states — rest is the sole state where they diverge
 * (label grey250, glyph grey300); hover/active/disabled share one ink.
 *
 * **Accessible name.** Content-derived from the visible `label` — no `aria-label`,
 * which would duplicate it. The × glyph is decorative (`aria-hidden` +
 * `focusable="false"` via the shared `Glyph` wrapper).
 *
 * **Wired vs static.** Passing `onActivate` renders a native
 * `<button type="button">`; without it the button is a static, non-interactive
 * `<span>` with no role, no tabindex and no ARIA of any kind — the same content
 * tree either way, so the reading order never changes.
 *
 * **Disabled.** The repo `aria-disabled` boundary: a wired button stays real and
 * focusable, `aria-disabled="true"` is set, and `onActivate` is swallowed. Native
 * `disabled` is never set (SC 2.4.3).
 *
 * Shared prop-contract mapping:
 *
 * | Field        | UiClearButton    | Rationale                                |
 * | ------------ | ---------------- | ----------------------------------------- |
 * | `value`      | N/A              | No value axis; existence is state          |
 * | `onChange`   | as `onActivate()`| Bare payload — one path, one direction     |
 * | `disabled`   | as `disabled`    | `aria-disabled` boundary, never native     |
 * | `error`      | N/A              | No error master                            |
 * | `size`       | N/A              | One master; width/height hug the content   |
 * | `variant`    | N/A              | Rest/hover/active are states, no variants  |
 * | `sx`         | supported        | Merged last on the root, `[base, ...sx]`   |
 */
export interface UiClearButtonProps {
  /** Visible label; defaults to `'Очистити фільтри'`. Names the button. */
  label?: string;
  /**
   * Requests the clear action. Bare and payload-free: the button has exactly one
   * state-change path in exactly one direction. Presence makes the button wired;
   * without it the button is static content.
   */
  onActivate?: () => void;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"` and `onActivate` never
   * fires. Native `disabled` is never set. Figma ships a disabled column, so it
   * is painted: both the label and the glyph swap to grey300.
   */
  disabled?: boolean;
  /** `id` for the button; lands on the root so focus can be re-resolved. */
  id?: string;
  /** Only when the label's language differs from the page's (SC 3.1.2). */
  lang?: string;
  sx?: SxProps<Theme>;
}
