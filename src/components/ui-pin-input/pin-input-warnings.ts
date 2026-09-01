import { hasHelperContent, hasText } from '../field-controls';

import { normalizeLength, normalizeValue } from './pin-value';
import type { UiPinInputProps } from './types';

const MISSING_NAME_WARNING: string =
  'UiPinInput has no accessible group name: pass `label` (applied as `aria-label`) or ' +
  '`labelledBy` (the id of a visible label). An unnamed `role="group"` tells assistive tech ' +
  'nothing about what the digits are for.';
const ERROR_WITHOUT_HELPER_WARNING: string =
  'UiPinInput has `error` set but no `helperText`; assistive tech gets no reason for the ' +
  'error and the invalid state becomes colour-only. Pass `helperText`.';
const DIRTY_VALUE_WARNING: string =
  'UiPinInput received a `value` containing non-digits or longer than `length`; it is ' +
  'filtered and clamped before painting. Pass the digits only, at most `length` of them.';
const SHORT_LENGTH_WARNING: string =
  'UiPinInput received a `length` below 1 (or a non-finite one); it is normalised. A PIN ' +
  'field needs at least one cell.';

function nameWarning(props: UiPinInputProps): string | null {
  const named: boolean = hasText(props.label) || hasText(props.labelledBy);
  return named ? null : MISSING_NAME_WARNING;
}

function helperWarning(props: UiPinInputProps): string | null {
  const missing: boolean = props.error === true && !hasHelperContent(props.helperText);
  return missing ? ERROR_WITHOUT_HELPER_WARNING : null;
}

// Dev-only backstop for runtime data the strict prop types forbid but API
// payloads produce anyway: the value is repaired rather than rejected, so the
// field keeps rendering, but a silent repair would hide a real bug upstream.
function valueWarning(props: UiPinInputProps): string | null {
  const raw: string = props.value ?? '';
  return normalizeValue(raw, normalizeLength(props.length)) === raw ? null : DIRTY_VALUE_WARNING;
}

function lengthWarning(props: UiPinInputProps): string | null {
  const requested: number | undefined = props.length;
  if (requested == null) {
    return null;
  }
  return normalizeLength(requested) === requested ? null : SHORT_LENGTH_WARNING;
}

/** The first applicable dev warning, or null when the field is well configured. */
export default function pinInputWarning(props: UiPinInputProps): string | null {
  return nameWarning(props) ?? helperWarning(props) ?? valueWarning(props) ?? lengthWarning(props);
}
