import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import { useListboxSlotProps, type ListboxSlotProps } from '../field-controls';

import { createSearchRenderInput } from './render-input';
import type { UiSearchInputProps } from './types';

export interface SearchField {
  handleInputChange: (event: React.SyntheticEvent, next: string) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactElement;
  slotProps: ListboxSlotProps;
}

// Derives the memoized input-change handler, `renderInput` callback, and listbox
// slotProps for UiSearchInput, keeping the component itself small enough for the
// complexity gate.
export function useSearchField(props: UiSearchInputProps): SearchField {
  const { onChange, label, placeholder, required, error, helperText } = props;
  const ariaLabel: string | undefined = props['aria-label'];

  const handleInputChange: SearchField['handleInputChange'] = React.useCallback(
    (_event: React.SyntheticEvent, next: string): void => {
      onChange?.(next);
    },
    [onChange]
  );

  const renderInput: SearchField['renderInput'] = React.useMemo(
    () => createSearchRenderInput({ label, placeholder, required, error, helperText, ariaLabel }),
    [label, placeholder, required, error, helperText, ariaLabel]
  );

  const slotProps: ListboxSlotProps = useListboxSlotProps(label, ariaLabel);

  return { handleInputChange, renderInput, slotProps };
}
