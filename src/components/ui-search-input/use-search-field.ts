import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import { useListboxSlotProps, type ListboxSlotProps } from '../field-controls';
import { GhostOverlay } from '../ghost-overlay';

import { createSearchRenderInput } from './render-input';
import type { UiSearchInputProps } from './types';
import { useGhostText } from './use-ghost-text';

export interface SearchField {
  text: string;
  handleInputChange: (event: React.SyntheticEvent, next: string) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactElement;
  slotProps: ListboxSlotProps;
}

// Derives the input-change handler, `renderInput` callback (with the inline ghost
// overlay and its input handlers) and listbox slotProps for UiSearchInput, keeping
// the component itself small enough for the complexity gate.
export function useSearchField(props: UiSearchInputProps): SearchField {
  const { label, placeholder, required, error, helperText } = props;
  const ariaLabel: string | undefined = props['aria-label'];
  const ghost: ReturnType<typeof useGhostText> = useGhostText(props);

  const overlay: React.ReactNode = ghost.active
    ? React.createElement(GhostOverlay, { typed: ghost.text, completion: ghost.completion })
    : null;

  const renderInput: SearchField['renderInput'] = createSearchRenderInput({
    label,
    placeholder,
    required,
    error,
    helperText,
    ariaLabel,
    overlay,
    htmlInputProps: {
      onKeyDown: ghost.handleKeyDown,
      onFocus: ghost.handleFocus,
      onBlur: ghost.handleBlur,
    },
  });

  const slotProps: ListboxSlotProps = useListboxSlotProps(label, ariaLabel);

  return { text: ghost.text, handleInputChange: ghost.handleInputChange, renderInput, slotProps };
}
