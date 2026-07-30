import type { SxProps, Theme } from '@mui/material';

/**
 * The brand mark an integration card paints. The image and its intrinsic size
 * travel as ONE object on purpose (a11y contract §3.5): the `width`/`height`
 * attributes are what reserve the box before the image loads and what let the
 * card centre it vertically, so a dimensionless logo is unrepresentable by
 * construction (the `TaskAssignee` type-level trick). An unusable bundle — blank
 * `src`, or a non-positive/non-finite dimension — paints no `<img>` at all and
 * dev-warns (§12.4); the card keeps its `minHeight` either way.
 */
export interface IntegrationLogo {
  /** Brand mark — a URL string or a static import (`{ src }`). */
  src: { src: string } | string;
  /** Intrinsic width in CSS px (Figma masters: HubSpot 139, AmoCRM 181). */
  width: number;
  /** Intrinsic height in CSS px (Figma masters: HubSpot 40, AmoCRM 52). */
  height: number;
}

/**
 * One integration choice card: a radio glyph beside the brand name, with the
 * brand logo centred below. Three visual states exist in the design (rest, hover
 * and selected) and nothing else — no variants, no sizes, and no disabled master
 * (see the disabled note below).
 *
 * The widget is an **ARIA radio** (a11y contract §1.1): the wired card is ONE
 * native `<button type="button" role="radio">` spanning the whole card, carrying
 * a permanent `aria-checked`. `aria-pressed` is forbidden — a toggle button does
 * not imply mutual exclusivity, so a screen-reader user who "pressed" card A and
 * then card B would still believe A is pressed, while the radio role carries the
 * exclusivity contract the glyph already promises to sighted users.
 *
 * **The card never renders its own group** (§1.2). `role="radiogroup"` and its
 * accessible name, plus `aria-setsize`/`aria-posinset`, belong to the consumer —
 * the same boundary as the `UiItemRow`/`UiItemsList` split. ARIA 1.2 imposes no
 * required context role on `radio`, so a standalone card is valid; it is
 * nonetheless suboptimal, so a wired card with no `[role="radiogroup"]` ancestor
 * dev-warns (§12.2). Each wired card is an independent tab stop in DOM order:
 * there is deliberately no roving tabindex and no arrow-key navigation (§4.3), a
 * composite focus manager cannot live inside a single card.
 *
 * The card follows the repo wired/static split (`UiTaskCard` precedent), switched
 * on `onSelect`:
 * - Wired → the `role="radio"` button above.
 * - Unwired → a static `<div>` with no role, no `tabindex` and no ARIA of any
 *   kind, painting the REST presentation even when `selected` is passed
 *   (dev-warn, §3.4) — the static branch never renders state it cannot expose
 *   programmatically. Both branches render an identical content tree.
 *
 * The accessible name is content-derived — the visible brand name, exactly — and
 * there is no `aria-label` anywhere in the tree (WCAG 2.5.3, §5.1). The logo is
 * decorative (`alt=""`, §5.2) because the brand name sits beside it inside the
 * same control, and the radio glyph is an `aria-hidden` CSS circle that is never
 * an `<input>` and never focusable: the checked state reaches assistive tech
 * through `aria-checked` alone (§1.3, §5.3).
 *
 * Shared prop-contract mapping (a11y contract §11):
 *
 * | Field      | UiIntegrationCard | Rationale                                  |
 * | ---------- | ----------------- | ------------------------------------------ |
 * | `value`    | as `selected`     | The state axis is a boolean radio check    |
 * | `onChange` | as `onSelect()`   | Bare payload — one path, one direction     |
 * | `disabled` | as `disabled`     | `aria-disabled` boundary, never native     |
 * | `error`    | N/A               | No error master; validation is the group's |
 * | `size`     | N/A               | One master; height is a `minHeight`        |
 * | `variant`  | N/A               | Rest/hover/selected are states, no variants|
 * | `sx`       | supported         | Merged last on the root, `[base, ...sx]`   |
 *
 * There is no animation, no live region in any state and no hover- or
 * focus-triggered content (§9.1, §8.1, §10.4).
 */
export interface UiIntegrationCardProps {
  /** Brand name; the only text in the card and its whole accessible name. */
  name: string;
  /** Brand mark plus its intrinsic size. Required — see {@link IntegrationLogo}. */
  logo: IntegrationLogo;
  /**
   * Selected state (wired cards only). ALWAYS controlled, default `false`: a
   * nullish value is coerced so a card that starts unselected never silently
   * flips uncontrolled on first selection (the `UiRadioGroup` `value ?? ''`
   * footgun). The component never self-flips it — a radio cannot unselect
   * itself, so deselection happens only when the consumer selects a sibling.
   */
  selected?: boolean;
  /**
   * Requests selection. Bare and payload-free on purpose (§3.2): this widget has
   * exactly one state-change path (activation) in exactly one direction
   * (false→true), so nothing can race — close over the integration id when
   * mapping cards. Presence makes the card a wired radio. Activating an
   * already-selected card fires nothing (native radio `change` semantics); a
   * DECLINED selection leaves the card eligible, so the next activation fires
   * again.
   */
  onSelect?: () => void;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"`, the hover recipe is
   * suppressed and `onSelect` never fires — so keyboard focus is never dropped
   * when a focused card flips disabled (WCAG 2.4.3). Figma ships no disabled
   * master, so disabled is SEMANTICS ONLY: a selected + disabled card keeps its
   * full selected chrome (§6.3) and nothing is dimmed.
   */
  disabled?: boolean;
  /** `id` for the card; lands on the `<button>` so focus can be re-resolved. */
  id?: string;
  /** Only when the card's language differs from the page language (SC 3.1.2). */
  lang?: string;
  sx?: SxProps<Theme>;
}
