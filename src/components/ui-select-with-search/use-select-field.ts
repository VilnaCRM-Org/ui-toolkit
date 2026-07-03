import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import { createSelectRenderInput } from './render-input';
import type { UiSelectWithSearchOption, UiSelectWithSearchProps } from './types';

type ListboxSlotProps = { listbox: { 'aria-label'?: string } };

export interface SelectField {
  handleChange: (event: React.SyntheticEvent, next: UiSelectWithSearchOption | null) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactElement;
  slotProps: ListboxSlotProps;
}

// Derives the memoized change handler, `renderInput` callback, and listbox
// slotProps for UiSelectWithSearch, keeping the component itself small enough
// for the complexity gate.
export function useSelectField(props: UiSelectWithSearchProps): SelectField {
  const { onChange, label, placeholder, required, error, helperText, variant } = props;
  const ariaLabel: string | undefined = props['aria-label'];

  const handleChange: SelectField['handleChange'] = React.useCallback(
    (_event: React.SyntheticEvent, next: UiSelectWithSearchOption | null): void => {
      onChange?.(next);
    },
    [onChange]
  );

  const renderInput: SelectField['renderInput'] = React.useMemo(
    () =>
      createSelectRenderInput({
        label,
        placeholder,
        required,
        error,
        helperText,
        variant,
        ariaLabel,
      }),
    [label, placeholder, required, error, helperText, variant, ariaLabel]
  );

  const slotProps: ListboxSlotProps = React.useMemo(
    () => ({ listbox: { 'aria-label': label ?? ariaLabel } }),
    [label, ariaLabel]
  );

  return { handleChange, renderInput, slotProps };
}
