import { Autocomplete } from '@mui/material';
import React from 'react';

import { useUiTheme } from '@/utils/ui-theme';

import { ChevronDownGlyph } from '../field-controls';

import {
  deriveSelectAutocomplete,
  isOptionEqualToValue,
  type SelectAutocompleteDerived,
} from './select-autocomplete-props';
import type { UiSelectWithSearchProps } from './types';
import type { SelectField } from './use-select-field';

export { selectRootSx } from './styles';

const POPUP_ICON: React.ReactElement = <ChevronDownGlyph />;

export interface SelectAutocompleteProps {
  /** The public props of the owning control, passed through unchanged. */
  control: UiSelectWithSearchProps;
  /** Shared id of the combobox, so an external `<label htmlFor>` still binds. */
  fieldId: string;
  /** Handlers, `renderInput` and listbox slotProps derived by `useSelectField`. */
  field: SelectField;
}

// The combobox itself, kept in its own module so the owning component stays within
// the per-function complexity budget. Props are applied explicitly (no JSX spread),
// so the rendered MUI wiring is identical to an inline `<Autocomplete>`.
export function SelectAutocomplete(props: Readonly<SelectAutocompleteProps>): React.ReactElement {
  const { control, fieldId, field } = props;
  const derived: SelectAutocompleteDerived = deriveSelectAutocomplete(useUiTheme(), control, field);
  return (
    <Autocomplete
      options={control.options}
      value={derived.value}
      onChange={field.handleChange}
      onInputChange={field.handleInputChange}
      disabled={control.disabled}
      // A loading combobox stays fully operable — no `disabled`, no `readOnly`
      // (SC 2.1.1 / 3.2.2). MUI's `loading` only swaps the popup's empty row for
      // `loadingText`, so a running fetch no longer reads as "no options".
      loading={control.loading}
      loadingText={derived.loadingText}
      size={control.size}
      sx={derived.sx}
      id={fieldId}
      isOptionEqualToValue={isOptionEqualToValue}
      popupIcon={POPUP_ICON}
      open={field.resolvedOpen}
      onOpen={field.handleOpen}
      onClose={field.handleClose}
      disablePortal={control.disablePortal}
      renderInput={field.renderInput}
      clearText={derived.clearText}
      slotProps={derived.slotProps}
    />
  );
}
