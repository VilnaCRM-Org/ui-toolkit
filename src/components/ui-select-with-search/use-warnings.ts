import { useFieldAccessibilityWarnings } from '../field-controls';

import type { UiSelectWithSearchProps } from './types';

// Dev-only accessibility guidance for the searchable select combobox; the shared
// helper owns the (production-stripped) warning logic for every field control.
export function useSelectAccessibilityWarnings(props: UiSelectWithSearchProps): void {
  useFieldAccessibilityWarnings('UiSelectWithSearch', props);
}
