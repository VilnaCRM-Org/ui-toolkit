import { hasText } from '../field-controls';

import type { SegmentedOption, UiSegmentedControlProps } from './types';

const UNWIRED_VALUE_WARNING: string =
  'UiSegmentedControl received `value` without `onChange`; the control is static content, ' +
  'so the selected pill is NOT painted. Pass `onChange` to wire the control.';
const EMPTY_OPTIONS_WARNING: string =
  'UiSegmentedControl received an empty `options` array; the track renders with nothing to ' +
  'select. Pass at least one option.';
const NO_NAME_WARNING: string =
  'UiSegmentedControl has no accessible name: pass `label` or `labelledBy`.';
const DUPLICATE_VALUE_WARNING: string =
  'UiSegmentedControl received duplicate option `value`s; only the first match is ever ' +
  'reachable. Give every option a unique `value`.';
const BLANK_LABEL_WARNING: string =
  'UiSegmentedControl received an option with a blank `label`; that segment has no visible ' +
  'or accessible name. Pass a non-blank `label` for every option.';
const UNMATCHED_VALUE_WARNING: string =
  'UiSegmentedControl received a `value` matching no option; every segment renders ' +
  'unselected. Pass a `value` that matches one of the `options`.';

// A truthy `value` without `onChange` mirrors `UiIntegrationCard`'s unwired
// `selected` warning: the static branch never renders state it cannot expose
// programmatically, so the value is silently dropped rather than painted.
export function unwiredValueWarning(props: UiSegmentedControlProps): string | null {
  if (props.onChange != null || !hasText(props.value)) {
    return null;
  }
  return UNWIRED_VALUE_WARNING;
}

export function emptyOptionsWarning(props: UiSegmentedControlProps): string | null {
  return props.options.length === 0 ? EMPTY_OPTIONS_WARNING : null;
}

export function accessibleNameWarning(props: UiSegmentedControlProps): string | null {
  const named: boolean = hasText(props.label) || hasText(props.labelledBy);
  return named ? null : NO_NAME_WARNING;
}

function hasDuplicateValues(options: readonly SegmentedOption[]): boolean {
  const seen: Set<string> = new Set();
  for (const option of options) {
    if (seen.has(option.value)) {
      return true;
    }
    seen.add(option.value);
  }
  return false;
}

export function duplicateValueWarning(props: UiSegmentedControlProps): string | null {
  return hasDuplicateValues(props.options) ? DUPLICATE_VALUE_WARNING : null;
}

function isBlankLabel(option: SegmentedOption): boolean {
  return !hasText(option.label);
}

export function blankLabelWarning(props: UiSegmentedControlProps): string | null {
  return props.options.some(isBlankLabel) ? BLANK_LABEL_WARNING : null;
}

function matchesValue(value: string | undefined): (option: SegmentedOption) => boolean {
  return (option: SegmentedOption): boolean => option.value === value;
}

export function unmatchedValueWarning(props: UiSegmentedControlProps): string | null {
  if (!hasText(props.value)) {
    return null;
  }
  const found: boolean = props.options.some(matchesValue(props.value));
  return found ? null : UNMATCHED_VALUE_WARNING;
}
