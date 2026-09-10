import type { ReactNode } from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import { hasHelperContent } from './has-helper-content';
import { hasText } from './has-text';

// Searchable field controls (UiSearchInput, UiSelectWithSearch, UiMultiSelect)
// are not built on UiInput, so they share this dev-only accessibility guidance
// (stripped in production via the shared helper): warn when the control has no
// accessible name, and when it is in `error` with no `helperText` to explain
// why. `componentName` tailors each message to the calling control.
interface FieldWarningProps {
  label?: string | undefined;
  'aria-label'?: string | undefined;
  id?: string | undefined;
  error?: boolean | undefined;
  helperText?: ReactNode;
}

function hasAccessibleName(props: FieldWarningProps): boolean {
  return hasText(props.label) || hasText(props['aria-label']) || hasText(props.id);
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
  useDevWarning(props.error && !hasHelperContent(props.helperText) ? errorWithoutHelper : null);
}
