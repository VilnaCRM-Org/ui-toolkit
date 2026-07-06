import { useDevWarning } from '@/utils/dev-warn';

import type { UiCalendarMultiSelectProps } from './types';

// Dev-only accessibility guidance (stripped in production), mirroring the sibling
// selection controls: warn when the grid has no accessible name, and when it is
// in `error` with no `helperText` to explain why.
const MISSING_NAME_WARNING: string =
  'UiCalendarMultiSelect has no accessible name: pass `label` or `aria-label`. ' +
  '(`id` only seeds internal element ids — it does not name the group.)';
const ERROR_WITHOUT_HELPER_WARNING: string =
  'UiCalendarMultiSelect has `error` set but no `helperText`; ' +
  'assistive tech gets no reason for the error.';

// `id` is intentionally not accepted as a name source: a native `<label for>`
// cannot target a `role="group"` div, and the `id` prop only seeds the internal
// label/caption/helper element ids — it is never rendered onto the group itself.
function hasAccessibleName(props: UiCalendarMultiSelectProps): boolean {
  return props.label != null || props['aria-label'] != null;
}

export function useCalendarWarnings(props: UiCalendarMultiSelectProps): void {
  useDevWarning(hasAccessibleName(props) ? null : MISSING_NAME_WARNING);
  useDevWarning(props.error && props.helperText == null ? ERROR_WITHOUT_HELPER_WARNING : null);
}
