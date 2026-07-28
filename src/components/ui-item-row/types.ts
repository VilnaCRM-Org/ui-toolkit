import type { SxProps, Theme } from '@mui/material';

/**
 * The HTTP verb the row presents. Drives the badge label and the whole colour
 * recipe (accent border/badge ink, tint background, per-method shadows). This is
 * the ONLY variant axis — there is intentionally no auth/locked semantic prop
 * (the open padlock is decorative for Story 3.1; see the a11y contract §5.2/5.3).
 */
export type ItemRowMethod = 'get' | 'put' | 'post' | 'delete';

/**
 * One REST-API endpoint row (Figma "atom switcher"): an HTTP-method badge, the
 * endpoint path, a short description, a chevron expand affordance and a
 * decorative open-padlock. Desktop and mobile share ONE DOM tree — the layout
 * switch is CSS-only, so the reading order is identical at every breakpoint.
 *
 * The row is an APG **disclosure**, always controlled:
 * - Passing `onToggle` makes the entire row a single native
 *   `<button type="button">` with `aria-expanded` reflecting `expanded`
 *   (default `false`). The component never self-flips — feed the next state back
 *   through `onToggle`, like `UiPagination` feeds pages through `onChange`.
 * - Without `onToggle` the row is static, non-focusable content (no button role,
 *   no `aria-expanded`); the chevron still renders, decoratively.
 *
 * The expandable *panel content* is out of scope for 3.1 — the row only exposes
 * the disclosure contract and the list stacks rows.
 */
export interface UiItemRowProps {
  /** HTTP method; selects the badge label and the colour recipe. */
  method: ItemRowMethod;
  /** Endpoint path shown after the badge (e.g. `/pet/{petID}`). */
  path: string;
  /** Optional short description shown after the path. */
  description?: string;
  /**
   * Muted/inactive status. Rendered with the grey recipe. On a wired row this is
   * the repo `aria-disabled` boundary pattern: still a focusable `<button>`, but
   * `aria-disabled="true"` and `onToggle` is a no-op (never fired while muted).
   */
  muted?: boolean;
  /**
   * Disclosure state (wired rows only). Always controlled; defaults to `false`.
   * Drives `aria-expanded` and the chevron flip/accent tint.
   */
  expanded?: boolean;
  /** Called on activation of a wired, non-muted row. Presence makes the row a button. */
  onToggle?: () => void;
  /**
   * `id` of the panel this row controls. Surfaced as `aria-controls` ONLY while
   * expanded (so a collapsed/unmounted panel leaves no dangling idref).
   */
  panelId?: string;
  sx?: SxProps<Theme>;
}
