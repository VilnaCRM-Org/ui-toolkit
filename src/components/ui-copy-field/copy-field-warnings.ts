import type { UiCopyFieldProps } from './types';

const BLANK_VALUE_WARNING: string =
  'UiCopyField received a blank `value`; there is nothing to copy and the visible chip ' +
  'reads as empty. Pass the code string this chip is meant to copy.';
const BLANK_COPY_LABEL_WARNING: string =
  'UiCopyField received a blank `copyLabel`; the accessible name loses its action ' +
  'semantics and the chip reads as a static label. Omit the prop to keep the default ' +
  'suffix, or pass wording that names the copy action.';

// A blank/whitespace `value` leaves the chip with nothing to copy AND nothing
// to name itself with beyond the hidden verb.
function blankValueWarning(props: UiCopyFieldProps): string | null {
  return props.value?.trim() ? null : BLANK_VALUE_WARNING;
}

// A nullish `copyLabel` is not an override — it falls back to the default
// suffix. Only an explicitly blank string is the misconfiguration.
function copyLabelWarning(props: UiCopyFieldProps): string | null {
  if (props.copyLabel == null) {
    return null;
  }
  return props.copyLabel.trim() ? null : BLANK_COPY_LABEL_WARNING;
}

/** The first applicable accessible-name warning, or null when all is well. */
export default function copyFieldWarning(props: UiCopyFieldProps): string | null {
  return blankValueWarning(props) ?? copyLabelWarning(props);
}
