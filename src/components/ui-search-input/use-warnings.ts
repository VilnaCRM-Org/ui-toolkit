import { useDevWarning } from '@/utils/dev-warn';

import type { UiSearchInputProps } from './types';

// Dev-only accessibility guidance (stripped in production), mirroring the
// UiInput contract: warn when the search combobox has no accessible name, and
// when it is in `error` with no `helperText` to explain why.
const MISSING_NAME_WARNING: string =
  'UiSearchInput has no accessible name: pass `label`, `aria-label`, or `id`.';
const ERROR_WITHOUT_HELPER_WARNING: string =
  'UiSearchInput has `error` set but no `helperText`; ' +
  'assistive tech gets no reason for the error.';

function hasAccessibleName(props: UiSearchInputProps): boolean {
  return props.label != null || props['aria-label'] != null || props.id != null;
}

export function useSearchWarnings(props: UiSearchInputProps): void {
  useDevWarning(hasAccessibleName(props) ? null : MISSING_NAME_WARNING);
  useDevWarning(props.error && props.helperText == null ? ERROR_WITHOUT_HELPER_WARNING : null);
}
