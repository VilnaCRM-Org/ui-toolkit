import type { ReactNode } from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import { hasText } from './has-text';

// Searchable field controls (UiSearchInput, UiSelectWithSearch, UiMultiSelect)
// are not built on UiInput, so they share this dev-only accessibility guidance
// (stripped in production via the shared helper): warn when the control has no
// accessible name, and when it is in `error` with no `helperText` to explain
// why. `componentName` tailors each message to the calling control.
interface FieldWarningProps {
  label?: string;
  'aria-label'?: string;
  id?: string;
  error?: boolean;
  helperText?: ReactNode;
}

function hasAccessibleName(props: FieldWarningProps): boolean {
  return props.label != null || props['aria-label'] != null || props.id != null;
}

// Blank/whitespace-only helper text is treated as missing so `error` cannot ship
// with no explanation; non-string nodes (elements, numbers) count as present.
function hasHelperText(helperText: ReactNode): boolean {
  return typeof helperText === 'string' ? hasText(helperText) : helperText != null;
}

export function useFieldAccessibilityWarnings(
  componentName: string,
  props: FieldWarningProps
): void {
  const missingName =
    `${componentName} has no accessible name: ` + 'pass `label`, `aria-label`, or `id`.';
  const errorWithoutHelper =
    `${componentName} has \`error\` set but no \`helperText\`; ` +
    'assistive tech gets no reason for the error.';
  useDevWarning(hasAccessibleName(props) ? null : missingName);
  useDevWarning(props.error && !hasHelperText(props.helperText) ? errorWithoutHelper : null);
}
