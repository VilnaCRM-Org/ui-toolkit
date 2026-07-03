import React from 'react';

export type ListboxSlotProps = { listbox: { 'aria-label'?: string } };

// Names the Autocomplete popup listbox from the field's visible label, falling
// back to its `aria-label`. Shared by the search/select field hooks.
export function useListboxSlotProps(
  label: string | undefined,
  ariaLabel: string | undefined
): ListboxSlotProps {
  return React.useMemo(
    () => ({ listbox: { 'aria-label': label ?? ariaLabel } }),
    [label, ariaLabel]
  );
}
