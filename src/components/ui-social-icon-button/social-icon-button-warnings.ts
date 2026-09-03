import type { UiSocialIconButtonProps } from './types';

const BLANK_LABEL_WARNING: string =
  'UiSocialIconButton received a blank `label`; the icon-only control would have no ' +
  'accessible name. Omit the prop to fall back to the network default, or pass real wording.';
const HREF_AND_ACTIVATE_WARNING: string =
  'UiSocialIconButton received both `href` and `onActivate`; the control always renders as ' +
  'an anchor when `href` is present, so `onActivate` is ignored. Drop one of the two props.';

// A nullish `label` is not an override — it falls back to the network default.
// Only an explicitly blank string is the misconfiguration.
function blankLabelWarning(props: UiSocialIconButtonProps): string | null {
  if (props.label == null) {
    return null;
  }
  return props.label.trim() ? null : BLANK_LABEL_WARNING;
}

function hrefAndActivateWarning(props: UiSocialIconButtonProps): string | null {
  if (props.href == null || props.onActivate == null) {
    return null;
  }
  return HREF_AND_ACTIVATE_WARNING;
}

/** The first applicable warning, or null when all is well. */
export default function socialIconButtonWarning(props: UiSocialIconButtonProps): string | null {
  return blankLabelWarning(props) ?? hrefAndActivateWarning(props);
}
