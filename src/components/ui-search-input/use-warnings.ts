import { useFieldAccessibilityWarnings } from '../field-controls';

import type { UiSearchInputProps } from './types';

// Dev-only accessibility guidance for the search combobox; the shared helper
// owns the (production-stripped) warning logic for every field control.
export function useSearchWarnings(props: UiSearchInputProps): void {
  useFieldAccessibilityWarnings('UiSearchInput', props);
}
