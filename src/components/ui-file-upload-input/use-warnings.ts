import { useFieldAccessibilityWarnings } from '../field-controls';

import type { UiFileUploadInputProps } from './types';

// Dev-only accessibility guidance for the file field; the shared helper owns the
// (production-stripped) warning logic for every field control. A failed upload
// counts as an error state here, so shipping `status="error"` with nothing in
// `helperText` is flagged the same way a bare `error` is.
export function useFileUploadWarnings(props: UiFileUploadInputProps): void {
  useFieldAccessibilityWarnings('UiFileUploadInput', {
    label: props.label,
    'aria-label': props['aria-label'],
    id: props.id,
    error: props.error === true || props.status === 'error',
    helperText: props.helperText,
  });
}
