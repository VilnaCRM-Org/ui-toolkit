import { resolveLogo } from './integration-logo';
import type { UiIntegrationCardProps } from './types';

const UNWIRED_SELECTED_WARNING: string =
  'UiIntegrationCard received `selected` without `onSelect`; the card is static content, so ' +
  'the selected state is NOT painted — a checked glyph with no `aria-checked` behind it is ' +
  'an accessibility defect. Pass `onSelect` to wire the card.';
const BLANK_NAME_WARNING: string =
  'UiIntegrationCard received a blank `name`; the card would have no accessible name (the ' +
  'logo is decorative). Pass the brand name.';
const UNUSABLE_LOGO_WARNING: string =
  'UiIntegrationCard received a `logo` without a usable `src`, `width` and `height`; no image ' +
  "is rendered. Pass a valid URL or import together with the mark's intrinsic pixel size.";

// The wired/static switch is `onSelect` alone (a11y contract §3.3), so a truthy
// `selected` without it is a misconfiguration: the static branch renders the rest
// presentation and never exposes the state programmatically (§3.4).
function unwiredSelectedWarning(props: UiIntegrationCardProps): string | null {
  if (props.onSelect != null) {
    return null;
  }
  return props.selected === true ? UNWIRED_SELECTED_WARNING : null;
}

// Dev-only backstop for runtime data the strict prop types forbid but CMS/API
// payloads produce anyway.
function contentWarning(props: UiIntegrationCardProps): string | null {
  if (!props.name?.trim()) {
    return BLANK_NAME_WARNING;
  }
  return resolveLogo(props.logo) == null ? UNUSABLE_LOGO_WARNING : null;
}

/** The first applicable a11y-contract §12 warning, or null when all is well. */
export default function integrationCardWarning(props: UiIntegrationCardProps): string | null {
  return unwiredSelectedWarning(props) ?? contentWarning(props);
}
