import { hasText } from '../field-controls';

import type { UiOptionCardProps } from './types';

const UNWIRED_SELECTED_WARNING: string =
  'UiOptionCard received `selected` without `onSelect`; the card is static content, so the ' +
  'selected state is NOT painted. Pass `onSelect` to wire the card.';
const BLANK_LABEL_WARNING: string =
  'UiOptionCard received a blank `label`; the card would have no accessible caption. Pass the ' +
  'caption text.';
const BLANK_VALUE_LABEL_WARNING: string =
  'UiOptionCard received a blank `valueLabel`; the value box would have no text. Pass the box ' +
  'text.';

// The wired/static switch is `onSelect` alone, so a truthy `selected` without it
// is a misconfiguration: the static branch renders the rest presentation and
// never exposes the state programmatically.
function unwiredSelectedWarning(props: UiOptionCardProps): string | null {
  if (props.onSelect != null) {
    return null;
  }
  return props.selected === true ? UNWIRED_SELECTED_WARNING : null;
}

// Dev-only backstop for runtime data the strict prop types forbid but CMS/API
// payloads produce anyway.
function contentWarning(props: UiOptionCardProps): string | null {
  if (!hasText(props.label)) {
    return BLANK_LABEL_WARNING;
  }
  return hasText(props.valueLabel) ? null : BLANK_VALUE_LABEL_WARNING;
}

/** The first applicable dev warning, or null when all is well. */
export default function optionCardWarning(props: UiOptionCardProps): string | null {
  return unwiredSelectedWarning(props) ?? contentWarning(props);
}
