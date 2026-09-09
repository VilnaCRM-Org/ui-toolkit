import type { SxProps, Theme } from '@mui/material';

import type { IntegrationLogo } from '../ui-integration-card/types';

/**
 * One payment-provider choice card (Figma Board A row y=1004, state nodes
 * 439:19625 rest / 439:19643 hover / 439:19640 selected / 439:19658 disabled): a
 * selection circle anchored top-left with the provider wordmark centred on the
 * card's own axis. The card carries ZERO text nodes — the wordmark image is the
 * whole content, which is the one thing that makes this card differ from
 * `UiIntegrationCard`.
 *
 * The widget is an **ARIA radio** (a11y contract §1.1): the wired card is ONE
 * native `<button type="button" role="radio">` spanning the whole 279x90 card,
 * carrying a permanent `aria-checked`. `aria-pressed` is forbidden — a toggle
 * button does not imply mutual exclusivity, so a screen-reader user who
 * "pressed" LiqPay and then WayForPay would still believe LiqPay is pressed,
 * while the radio role carries the exclusivity the circle already promises to
 * sighted users.
 *
 * **The card never renders its own group** (§1.2). `role="radiogroup"` and its
 * accessible name, plus `aria-setsize`/`aria-posinset`, belong to the consumer —
 * the same boundary as the `UiItemRow`/`UiItemsList` split. ARIA 1.2 imposes no
 * required context role on `radio`, so a standalone card is valid; it is
 * nonetheless suboptimal, so a wired card with no `[role="radiogroup"]` ancestor
 * dev-warns. Each wired card is an independent tab stop in DOM order: there is
 * deliberately no roving tabindex, no arrow-key navigation and no key handlers at
 * all (the native button already fires on Enter and Space, and a manual handler
 * would double-fire on Space).
 *
 * The card follows the repo wired/static split, switched on `onSelect`:
 * - Wired → the `role="radio"` button above.
 * - Unwired → a static `<div>` with no role, no `tabindex` and no ARIA of any
 *   kind, painting the REST presentation even when `selected` is passed
 *   (dev-warn) — the static branch never renders state it cannot expose
 *   programmatically. Both branches render an identical content tree.
 *
 * **Accessible name (the one deliberate deviation from `UiIntegrationCard`).**
 * There the logo is decorative (`alt=""`) because the brand NAME TEXT is visible
 * beside it. This card has no visible text at all, so copying that verbatim would
 * ship a nameless radio (SC 4.1.2). Here the wordmark `<img>` carries
 * `alt={name}` and IS the entire accessible name; `name` must transcribe the
 * visible wordmark ("LiqPay", "WayForPay") so the spoken name matches what is
 * seen (SC 2.5.3). There is **no `aria-label` anywhere in the tree**.
 *
 * The selection circle is `aria-hidden` CSS paint — never an `<input>`, never
 * focusable — and the checked state reaches assistive tech through `aria-checked`
 * alone. Its checked distinction is border **WIDTH** (1px → 5px), not colour, so
 * it survives forced-colors mode where colour-only cues are discarded; do not
 * refactor that into a colour swap.
 *
 * Shared prop-contract mapping:
 *
 * | Field      | UiPaymentOptionCard | Rationale                                 |
 * | ---------- | ------------------- | ----------------------------------------- |
 * | `value`    | as `selected`       | The state axis is a boolean radio check   |
 * | `onChange` | as `onSelect()`     | Bare payload — one path, one direction    |
 * | `disabled` | as `disabled`       | `aria-disabled` boundary, never native    |
 * | `error`    | ⛔ N/A              | No error master; validation is the group's|
 * | `size`     | ⛔ N/A              | One master; height is a `minHeight`       |
 * | `variant`  | ⛔ N/A              | Rest/hover/selected/disabled are states   |
 * | `lang`     | ⛔ N/A              | Wordmarks are proper nouns, never spoken  |
 * |            |                     | in a different natural language           |
 * | `sx`       | supported           | Merged last on the root, `[base, ...sx]`  |
 *
 * There is no animation, no live region in any state and no hover- or
 * focus-triggered content.
 */
export interface UiPaymentOptionCardProps {
  /**
   * The provider name. Required: it is the card's ENTIRE accessible name, since
   * the wordmark image is the only content. Must transcribe the visible wordmark
   * (SC 2.5.3) — "LiqPay", not "Payment method 1".
   */
  name: string;
  /**
   * The full-colour provider wordmark plus its intrinsic size. Reuses
   * {@link IntegrationLogo} rather than cloning it (a type-only cross-component
   * edge) so a dimensionless logo stays unrepresentable by construction: the
   * `width`/`height` attributes are what reserve the box before the mark loads.
   * Figma boxes: LiqPay 116x24, WayForPay 187x67.
   */
  logo: IntegrationLogo;
  /**
   * The flat-grey wordmark painted while `disabled`. Optional and falling back to
   * {@link UiPaymentOptionCardProps.logo}, so a provider with no grey variant
   * still renders sensibly. The disabled mark is an ASSET swap, not a CSS filter:
   * `grayscale(1)` and `opacity` both miss the Figma `#D0D4D8` badly.
   */
  logoDisabled?: IntegrationLogo | undefined;
  /**
   * Selected state (wired cards only). ALWAYS controlled, default `false`: a
   * nullish value is coerced so a card that starts unselected never silently
   * flips uncontrolled on first selection (the `UiRadioGroup` `value ?? ''`
   * footgun). The component never self-flips it — a radio cannot unselect
   * itself, so deselection happens only when the consumer selects a sibling.
   */
  selected?: boolean | undefined;
  /**
   * Requests selection. Bare and payload-free on purpose: this widget has exactly
   * one state-change path (activation) in exactly one direction (false→true), so
   * nothing can race — close over the provider id when mapping cards. Presence
   * makes the card a wired radio. Activating an already-selected card fires
   * nothing (native radio `change` semantics); a DECLINED selection leaves the
   * card eligible, so the next activation fires again.
   */
  onSelect?: (() => void) | undefined;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"`, the hover recipe is
   * suppressed and `onSelect` never fires — so keyboard focus is never dropped
   * when a focused card flips disabled (WCAG 2.4.3). Figma DOES ship a disabled
   * master here, so it is painted: the grey wordmark plus a solid `brandGray`
   * circle. A selected + disabled card still keeps its full selected chrome.
   */
  disabled?: boolean | undefined;
  /** `id` for the card; lands on the `<button>` so focus can be re-resolved. */
  id?: string | undefined;
  sx?: SxProps<Theme> | undefined;
}
