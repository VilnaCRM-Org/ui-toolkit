import type { SxProps, Theme } from '@mui/material';

/**
 * The four brand marks the component knows how to paint (Figma Board A, node
 * `439:19318` disabled row and siblings). Each maps to one FILL-based glyph in
 * `./social-glyph.tsx` and one default accessible name in the model hook.
 */
export type SocialNetwork = 'instagram' | 'github' | 'facebook' | 'linkedin';

/**
 * One 40x40 round social chip (Figma Board A, rest `439:19285` / hover
 * `439:19296` / active `439:19307` / disabled `439:19318`). Icon-only, so the
 * accessible name comes from `aria-label`, never visible text.
 *
 * **Element choice.** `href` present -> renders an `<a>` and follows
 * `UiLink`'s disabled pattern verbatim: the href stays (dropping it would strip
 * the `link` role and the name), `aria-disabled` + `tabIndex={-1}` are applied,
 * and activation is cancelled by `preventDefault`, never removed from the DOM.
 * `href` absent -> renders a native `<button type="button">` with the repo's
 * `aria-disabled` + swallowed-activation boundary; native `disabled` is never
 * set. When BOTH `href` and `onActivate` are supplied the anchor wins —
 * `onActivate` is never invoked — and a dev-only warning names the conflict.
 *
 * **Disabled.** `aria-disabled="true"` on the root; never the native `disabled`
 * attribute (the toolkit-wide boundary, `UiButton` excepted).
 */
export interface UiSocialIconButtonProps {
  /** Which brand mark to paint, and which default name it falls back to. */
  network: SocialNetwork;
  /**
   * The accessible name. Defaults to the network's brand name ('Instagram',
   * 'GitHub', 'Facebook', 'LinkedIn'). An explicitly blank string is a
   * dev-warned misconfiguration, not silently overridden.
   */
  label?: string;
  /** Present -> renders an `<a href>`; absent -> renders a `<button>`. */
  href?: string;
  /** Fired on activation in button mode; a no-op while disabled or anchored. */
  onActivate?: () => void;
  /** `aria-disabled` boundary; native `disabled` is never set. */
  disabled?: boolean;
  /** `id` for the chip; lands on the rendered root element. */
  id?: string;
  sx?: SxProps<Theme>;
}
