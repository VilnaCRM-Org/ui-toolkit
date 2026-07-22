import type { AutocompleteInputChangeReason, AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import {
  createFieldRenderInput,
  GhostOverlay,
  useListboxSlotProps,
  type ListboxSlotProps,
} from '../field-controls';

import type { UiSelectWithSearchOption, UiSelectWithSearchProps } from './types';
import { useSelectGhost } from './use-select-ghost';

export interface SelectField {
  handleChange: (event: React.SyntheticEvent, next: UiSelectWithSearchOption | null) => void;
  handleInputChange: (
    event: React.SyntheticEvent,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactElement;
  slotProps: ListboxSlotProps;
}

// Derives the change handler, the `renderInput` callback (with the inline ghost
// overlay and its input handlers) and listbox slotProps for UiSelectWithSearch,
// keeping the component itself small enough for the complexity gate.
export function useSelectField(props: UiSelectWithSearchProps): SelectField {
  const { onChange, label, placeholder, required, error, helperText, variant } = props;
  const ariaLabel: string | undefined = props['aria-label'];
  const ghost: ReturnType<typeof useSelectGhost> = useSelectGhost(props);

  const handleChange: SelectField['handleChange'] = React.useCallback(
    (_event: React.SyntheticEvent, next: UiSelectWithSearchOption | null): void => {
      onChange?.(next);
    },
    [onChange]
  );

  const overlay: React.ReactNode = ghost.active
    ? React.createElement(GhostOverlay, { typed: ghost.typed, completion: ghost.completion })
    : null;

  const renderInput: SelectField['renderInput'] = createFieldRenderInput({
    label,
    placeholder,
    required,
    error,
    helperText,
    variant,
    ariaLabel,
    overlay,
    htmlInputProps: {
      onKeyDown: ghost.handleKeyDown,
      onFocus: ghost.handleFocus,
      onBlur: ghost.handleBlur,
    },
  });

  const slotProps: ListboxSlotProps = useListboxSlotProps(label, ariaLabel);

  return { handleChange, handleInputChange: ghost.handleInputChange, renderInput, slotProps };
}
