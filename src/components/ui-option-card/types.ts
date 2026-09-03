import type { SxProps, Theme } from '@mui/material';

/**
 * One board follow-up option card (Figma Board A row y=1486, state nodes
 * 439:19838 rest / 439:19845 hover / 439:19850 selected / 439:19855 disabled): a
 * caption over a 262x60 value box. There is no glyph, no radio dot and no chevron
 * in any state — only the box fill/border/shadow and the value ink+weight repaint.
 *
 * The widget is an **ARIA radio** (copying `UiIntegrationCard`): the wired card is
 * ONE native `<button type="button" role="radio">` spanning the whole card,
 * carrying a permanent `aria-checked`. The card never renders its own
 * `role="radiogroup"` — that, and its accessible name, belong to the consumer.
 *
 * The card follows the repo wired/static split, switched on `onSelect`:
 * - Wired → the `role="radio"` button above.
 * - Unwired → a static `<div>` with no role, no `tabindex` and no ARIA of any
 *   kind, painting the REST presentation even when `selected` is passed
 *   (dev-warn) — the static branch never renders state it cannot expose
 *   programmatically. Both branches render an identical content tree.
 *
 * The accessible name is content-derived: the caption, then a literal space, then
 * the value — without the space the name would concatenate as
 * "Analytics APIReporting". There is no `aria-label` anywhere in the tree.
 */
export interface UiOptionCardProps {
  /** The caption above the box, e.g. `'Analytics API'`. The whole card's name. */
  label: string;
  /** The text painted inside the value box, e.g. `'Reporting'`. */
  valueLabel: string;
  /**
   * Selected state (wired cards only). ALWAYS controlled, default `false`: a
   * nullish value is coerced so a card that starts unselected never silently
   * flips uncontrolled on first selection. The component never self-flips it — a
   * radio cannot unselect itself, so deselection happens only when the consumer
   * selects a sibling.
   */
  selected?: boolean;
  /**
   * Requests selection. Bare and payload-free on purpose: this widget has exactly
   * one state-change path (activation) in exactly one direction (false→true).
   * Presence makes the card a wired radio. Activating an already-selected card
   * fires nothing (native radio `change` semantics).
   */
  onSelect?: () => void;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"`, the hover recipe is
   * suppressed and `onSelect` never fires — so keyboard focus is never dropped
   * when a focused card flips disabled.
   */
  disabled?: boolean;
  /** `id` for the card; lands on the `<button>` so focus can be re-resolved. */
  id?: string;
  /** Only when the card's language differs from the page language (SC 3.1.2). */
  lang?: string;
  sx?: SxProps<Theme>;
}
