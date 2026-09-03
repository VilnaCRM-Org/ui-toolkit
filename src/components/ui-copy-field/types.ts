import type { SxProps, Theme } from '@mui/material';

/**
 * A copy-to-clipboard chip: a monospace-looking code string beside a trailing
 * `copy-02` glyph. Figma Board A, state nodes 451:25827 rest / 451:25831 hover /
 * 451:25835 active / 451:25839 disabled — four painted states.
 *
 * **Copy confirmation (deviation from Figma).** The design paints no "copied"
 * state, but a copy action with no feedback leaves the user unable to tell it
 * worked. Rather than invent a fifth chrome, a successful copy LATCHES the
 * chip's existing ACTIVE paint for `COPIED_RESET_MS`, reflected on the root as
 * `data-copied="true"`. The latch is visual only: it changes no ARIA state and
 * no accessible name, so it is currently a colour-only cue — a consumer that
 * needs the confirmation announced should own a status region beside the chip
 * and drive it from `onCopy`.
 *
 * **The whole chip is ONE native `<button type="button">`** (a11y contract):
 * the design repaints the entire chip on hover/active, so the hover/press
 * target IS the chip, never a smaller nested control. Always interactive —
 * unlike `UiFilterChip`, there is no static/unwired branch, because a copy
 * action has no meaningful non-interactive rendering.
 *
 * **Accessible name.** Content-derived, in this exact DOM order: the visible
 * `value`, then a visually-hidden span carrying `copyLabel` (default
 * `'Копіювати'`). Visible text therefore comes FIRST and is contained in the
 * name verbatim (SC 2.5.3); `aria-label` on the root is **forbidden** — it
 * would overwrite the visible code.
 *
 * **Activation.** Calls `navigator.clipboard.writeText(value)` when the API
 * exists, then `onCopy?.(value)` on success. A rejected promise, or a missing
 * `navigator.clipboard`, routes to `onCopyError?.(error)` instead — the chip
 * never throws and never paints a confirmation of its own.
 *
 * **`disabled`** follows the repo `aria-disabled` boundary: still a real,
 * focusable button, but `aria-disabled="true"`, the hover/active recipes are
 * suppressed and activation never fires — so keyboard focus is never dropped
 * when a focused chip flips disabled (SC 2.4.3). Native `disabled` is never
 * set.
 *
 * The glyph is `aria-hidden="true"` and `focusable="false"` — it duplicates
 * the copy semantics `copyLabel` already carries. Keyboard support is the
 * platform's: Tab reaches the chip and Enter/Space fire activation natively,
 * with no manual key handlers. There is no live region and no animation in
 * any state.
 */
export interface UiCopyFieldProps {
  /** The visible code string the chip copies, e.g. `'5POLGOPWQZFCCFEI'`. */
  value: string;
  /**
   * The visually-hidden suffix that gives the name its action semantics.
   * Defaults to `'Копіювати'`. Override it to match the surrounding copy —
   * never to blank it out, which would leave a button whose name reads as a
   * static label (dev-warned).
   */
  copyLabel?: string;
  /** Fired with `value` after a successful clipboard write. */
  onCopy?: (value: string) => void;
  /**
   * Fired with the failure reason when the clipboard write rejects, or when
   * `navigator.clipboard` is unavailable. The chip never throws on its own.
   */
  onCopyError?: (error: unknown) => void;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"`, the hover and active
   * recipes are suppressed and activation never fires.
   */
  disabled?: boolean;
  /** `id` for the chip; lands on the `<button>` so focus can be re-resolved. */
  id?: string;
  /** Only when the code's language differs from the page's (SC 3.1.2). */
  lang?: string;
  sx?: SxProps<Theme>;
}
