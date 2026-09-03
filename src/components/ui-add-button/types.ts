import type { SxProps, Theme } from '@mui/material';

/**
 * The board "add column/row" control (Figma "plus" chip button, state nodes
 * `451:25777` rest / `451:25781` hover / `451:25785` active / `451:25789`
 * disabled): an outlined pill carrying a visible label beside a trailing plus
 * glyph. Four painted states and nothing else — no sizes, no variants.
 *
 * **Accessible name.** Content-derived from the visible `label` — no
 * `aria-label` anywhere in the tree, which would overwrite that text. The
 * trailing plus is decorative (`aria-hidden` + `focusable="false"`) and
 * contributes nothing to the name.
 *
 * **ARIA state mapping: none.** No `aria-pressed`, no `aria-expanded` — a
 * plain action button. `aria-disabled` appears only through the disabled
 * boundary below, and only on the wired branch.
 *
 * The button follows the repo wired/static split (`UiFilterChip` precedent),
 * switched on `onActivate`:
 * - Wired → a native `<button type="button">` spanning the whole pill.
 * - Unwired → a static `<span>` with no role, no `tabindex` and no ARIA of
 *   any kind, not even `aria-disabled` — the static branch never paints a
 *   state it cannot expose programmatically, so `disabled` is ignored there.
 *
 * Keyboard support is the platform's: Tab reaches the button and Enter/Space
 * fire `onActivate` natively, with no manual key handlers. There is no
 * transition, no animation and no live region in any state.
 */
export interface UiAddButtonProps {
  /** Visible label, also the accessible name. Defaults to 'Додати стовпець'. */
  label?: string;
  /**
   * Requests the add action. Bare and payload-free — presence is what makes
   * the button interactive; without it the button renders as static content.
   */
  onActivate?: () => void;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"` and `onActivate` never
   * fires. Native `disabled` is never set. Ignored on the static branch,
   * which carries no ARIA at all.
   */
  disabled?: boolean;
  /** `id` for the button; lands on the root so focus can be re-resolved. */
  id?: string;
  /** Only when the label's language differs from the page's (SC 3.1.2). */
  lang?: string;
  sx?: SxProps<Theme>;
}
