import { useDevWarning } from '@/utils/dev-warn';

import type { UiSelectWithSearchProps } from './types';

// UiSelectWithSearch is not built on UiInput, so it emits its own dev-only
// accessibility guidance (via the shared, production-stripped helper), mirroring
// the UiInput contract: warn when the combobox has no accessible name, and when
// it is in `error` with no `helperText` to explain why.
const MISSING_NAME_WARNING: string =
  'UiSelectWithSearch has no accessible name: pass `label`, `aria-label`, or `id`.';
const ERROR_WITHOUT_HELPER_WARNING: string =
  'UiSelectWithSearch has `error` set but no `helperText`; ' +
  'assistive tech gets no reason for the error.';

function hasAccessibleName(props: UiSelectWithSearchProps): boolean {
  return props.label != null || props['aria-label'] != null || props.id != null;
}

export function useSelectAccessibilityWarnings(props: UiSelectWithSearchProps): void {
  useDevWarning(hasAccessibleName(props) ? null : MISSING_NAME_WARNING);
  useDevWarning(props.error && props.helperText == null ? ERROR_WITHOUT_HELPER_WARNING : null);
}
