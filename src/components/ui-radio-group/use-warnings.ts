import { useFieldAccessibilityWarnings } from '../field-controls';

import type { UiRadioGroupProps } from './types';

// Dev-only accessibility guidance for the radio group; the shared helper owns
// the (production-stripped) warning logic for every field control.
export function useRadioGroupWarnings(props: UiRadioGroupProps): void {
  useFieldAccessibilityWarnings('UiRadioGroup', props);
}
