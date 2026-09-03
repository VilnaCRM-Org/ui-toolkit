import type { UiClearButtonProps } from './types';

const BLANK_LABEL_WARNING: string =
  'UiClearButton received a blank `label`; the button would have no accessible name. Omit ' +
  'the prop to use the default copy, or pass a non-blank label.';

// A nullish `label` is not an override — it falls back to the default copy.
// Only an explicitly blank string is the misconfiguration.
export default function clearButtonWarning(props: UiClearButtonProps): string | null {
  if (props.label == null) {
    return null;
  }
  return props.label.trim() ? null : BLANK_LABEL_WARNING;
}
