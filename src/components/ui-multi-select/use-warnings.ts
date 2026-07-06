import { useDevWarning } from '@/utils/dev-warn';

import type { UiMultiSelectProps } from './types';

// UiMultiSelect is not built on UiInput, so it emits its own dev-only
// accessibility guidance (via the shared, production-stripped helper), mirroring
// the sibling select control: warn when the combobox has no accessible name, and
// when it is in `error` with no `helperText` to explain why.
const MISSING_NAME_WARNING: string =
  'UiMultiSelect has no accessible name: pass `label`, `aria-label`, or `id`.';
const ERROR_WITHOUT_HELPER_WARNING: string =
  'UiMultiSelect has `error` set but no `helperText`; ' +
  'assistive tech gets no reason for the error.';

function hasAccessibleName(props: UiMultiSelectProps): boolean {
  return props.label != null || props['aria-label'] != null || props.id != null;
}

export function useMultiSelectWarnings(props: UiMultiSelectProps): void {
  useDevWarning(hasAccessibleName(props) ? null : MISSING_NAME_WARNING);
  useDevWarning(props.error && props.helperText == null ? ERROR_WITHOUT_HELPER_WARNING : null);
}
