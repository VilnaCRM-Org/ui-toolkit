import React from 'react';

import { hasText } from './has-text';

export type ListboxSlotProps = { listbox: { 'aria-label'?: string } };

// Names the Autocomplete popup listbox from the field's visible label, falling
// back to its `aria-label` (including when `label` is empty/whitespace). Shared
// by the search/select field hooks.
export function useListboxSlotProps(
  label: string | undefined,
  ariaLabel: string | undefined
): ListboxSlotProps {
  return React.useMemo(
    () => ({ listbox: { 'aria-label': hasText(label) ? label : ariaLabel } }),
    [label, ariaLabel]
  );
}
