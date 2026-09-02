import type { UiAddButtonProps } from './types';

const BLANK_LABEL_WARNING: string =
  'UiAddButton received an explicitly blank `label`; the accessible name has no visible text ' +
  'to derive from, leaving a button that reads as bare boilerplate. Omit the prop to keep the ' +
  'default «Додати стовпець», or pass non-blank wording.';

// A nullish `label` is not an override — it falls back to the default. Only
// an explicitly blank string is the misconfiguration.
export default function addButtonWarning(props: UiAddButtonProps): string | null {
  if (props.label == null) {
    return null;
  }
  return props.label.trim() ? null : BLANK_LABEL_WARNING;
}
