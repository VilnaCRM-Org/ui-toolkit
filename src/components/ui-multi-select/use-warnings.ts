import { useFieldAccessibilityWarnings } from '../field-controls';

import type { UiMultiSelectProps } from './types';

// Dev-only accessibility guidance for the multi-select combobox; the shared
// helper owns the (production-stripped) warning logic for every field control.
export function useMultiSelectWarnings(props: UiMultiSelectProps): void {
  useFieldAccessibilityWarnings('UiMultiSelect', props);
}
