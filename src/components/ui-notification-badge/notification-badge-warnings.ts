import type { UiNotificationBadgeProps } from './types';

const INVALID_COUNT_WARNING: string =
  'UiNotificationBadge received a `count` that is not a non-negative integer; it is normalised ' +
  '(negative and non-finite values become 0, fractions are floored) so the chip and the ' +
  'accessible name can never disagree. Pass a whole, non-negative count.';
const INVALID_MAX_WARNING: string =
  'UiNotificationBadge received a `max` that is not a positive integer; it is normalised ' +
  '(fractions are floored, and caps below 1 or non-finite become 1, because a cap below 1 ' +
  'would render the meaningless counter "0+"). Pass a whole cap of 1 or more, or omit `max` ' +
  'for the Figma default of 9.';
const BLANK_LABEL_WARNING: string =
  'UiNotificationBadge received a blank `label`; the button would have no accessible name (the ' +
  'bell is decorative and the counter is aria-hidden). Pass the name stem, or omit `label` for ' +
  'the built-in Ukrainian default.';

// Dev-only backstops for runtime data the strict prop types forbid but CMS/API
// payloads produce anyway — `NaN` from a failed parse, a `-1` sentinel, an
// averaged fraction. The component normalises instead of throwing, so the warning
// is the only signal that the source data is wrong.
function countWarning(count: number): string | null {
  return Number.isInteger(count) && count >= 0 ? null : INVALID_COUNT_WARNING;
}

// `max` is optional, so a nullish value is the documented default and never warns.
function maxWarning(max: number | undefined): string | null {
  if (max == null) {
    return null;
  }
  return Number.isInteger(max) && max >= 1 ? null : INVALID_MAX_WARNING;
}

// A blank override is NOT repaired into the default (that would hide the mistake),
// so it really does leave a nameless button — hence the warning.
function labelWarning(label: string | undefined): string | null {
  if (label == null) {
    return null;
  }
  return label.trim() ? null : BLANK_LABEL_WARNING;
}

/** The first applicable a11y-contract §6 warning, or null when all is well. */
export default function notificationBadgeWarning(
  props: Readonly<UiNotificationBadgeProps>
): string | null {
  return countWarning(props.count) ?? maxWarning(props.max) ?? labelWarning(props.label);
}
