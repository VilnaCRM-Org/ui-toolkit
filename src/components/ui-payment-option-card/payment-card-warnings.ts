import type { ResolvedPaymentLogo } from './payment-logo';
import type { UiPaymentOptionCardProps } from './types';

const UNWIRED_SELECTED_WARNING: string =
  'UiPaymentOptionCard received `selected` without `onSelect`; the card is static content, so ' +
  'the selected state is NOT painted — a checked circle with no `aria-checked` behind it is ' +
  'an accessibility defect. Pass `onSelect` to wire the card.';
const BLANK_NAME_WARNING: string =
  'UiPaymentOptionCard received a blank `name`; the card would have no accessible name at all, ' +
  'because the wordmark image is its only content and `name` becomes that image `alt`. Pass ' +
  'the provider name exactly as the wordmark reads (e.g. "LiqPay").';
const UNUSABLE_LOGO_WARNING: string =
  'UiPaymentOptionCard received a `logo` without a usable `src`, `width` and `height`; no image ' +
  'is rendered, so the card falls back to a visually hidden name and shows nothing at all. Pass ' +
  "a valid URL or import together with the wordmark's intrinsic pixel size.";

// The wired/static switch is `onSelect` alone, so a truthy `selected` without it is
// a misconfiguration: the static branch renders the rest presentation and never
// exposes the state programmatically.
function unwiredSelectedWarning(props: UiPaymentOptionCardProps): string | null {
  if (props.onSelect != null) {
    return null;
  }
  return props.selected === true ? UNWIRED_SELECTED_WARNING : null;
}

// Dev-only backstop for runtime data the strict prop types forbid but CMS/API
// payloads produce anyway. `name` is TYPE-checked as well as blank-checked: this
// message is computed on every render of the production build too (only the
// `console.warn` itself is stripped), so a non-string must warn here rather than
// throw `.trim is not a function` and take the card down. The logo check reads
// the MARK THAT RENDERS rather than `logo` alone, so a disabled card whose grey
// variant is perfectly usable is not accused of painting nothing.
function contentWarning(
  props: UiPaymentOptionCardProps,
  mark: ResolvedPaymentLogo | null
): string | null {
  if (typeof props.name !== 'string' || !props.name.trim()) {
    return BLANK_NAME_WARNING;
  }
  return mark == null ? UNUSABLE_LOGO_WARNING : null;
}

/** The first applicable a11y-contract warning, or null when all is well. */
export default function paymentCardWarning(
  props: UiPaymentOptionCardProps,
  mark: ResolvedPaymentLogo | null
): string | null {
  return unwiredSelectedWarning(props) ?? contentWarning(props, mark);
}
