import type { UiBackgroundPickerProps } from './types';

const UNWIRED_WARNING: string =
  'UiBackgroundPicker received `open`, `value` or `onChange` without `onOpenChange`; the ' +
  'picker is static content, so the menu never renders and these are ignored.';
const DISABLED_OPEN_WARNING: string =
  'UiBackgroundPicker received `open` together with `disabled`; `disabled` wins and the ' +
  'closed card is rendered. No `onOpenChange(false)` is emitted — close it yourself.';
const EMPTY_OPTIONS_WARNING: string =
  'UiBackgroundPicker was opened with no options across `groups`; no menu is rendered, ' +
  'because an empty `role="menu"` is an accessibility defect. Pass at least one option.';

// The wired/static switch is `onOpenChange` alone, so anything that only makes
// sense on a wired picker is a misconfiguration without it.
function unwiredWarning(props: UiBackgroundPickerProps): string | null {
  if (props.onOpenChange != null) {
    return null;
  }
  const wiredOnly: boolean =
    props.open !== undefined || props.value !== undefined || props.onChange != null;
  return wiredOnly ? UNWIRED_WARNING : null;
}

// The two states where the component deliberately renders something other than
// what `open` asks for: disabled dominance, and an empty menu.
function stateWarning(props: UiBackgroundPickerProps, optionCount: number): string | null {
  const open: boolean = props.open ?? false;
  if (open && (props.disabled ?? false)) {
    return DISABLED_OPEN_WARNING;
  }
  if (open && props.onOpenChange != null && optionCount === 0) {
    return EMPTY_OPTIONS_WARNING;
  }
  return null;
}

/** The first applicable accessible-name/state warning, or null when all is well. */
export default function backgroundPickerWarning(
  props: UiBackgroundPickerProps,
  optionCount: number
): string | null {
  return unwiredWarning(props) ?? stateWarning(props, optionCount);
}
