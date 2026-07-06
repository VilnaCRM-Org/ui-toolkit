import { Autocomplete, Box, ThemeProvider } from '@mui/material';
import React from 'react';

import { ChevronDownGlyph, outlinedFieldTheme } from '../field-controls';

import { srOnlySx } from './styles';
import type { UiMultiSelectOption, UiMultiSelectProps } from './types';
import { useMultiSelectField } from './use-multi-select-field';
import { useMultiSelectWarnings } from './use-warnings';

const POPUP_ICON: React.ReactElement = <ChevronDownGlyph />;
const EMPTY: UiMultiSelectOption[] = [];

function isOptionEqualToValue(option: UiMultiSelectOption, value: UiMultiSelectOption): boolean {
  return option.value === value.value;
}

function getOptionLabel(option: UiMultiSelectOption): string {
  return option.label;
}

// Multi-value searchable combobox: options are picked from the listbox and shown
// as removable chips. Built on MUI `Autocomplete multiple`; `disableCloseOnSelect`
// keeps the popup open per pick (the accessible multi-select default). A hidden
// polite `role="status"` region announces chip add/remove (MUI is silent there).
function UiMultiSelect(props: Readonly<UiMultiSelectProps>): React.ReactElement {
  useMultiSelectWarnings(props);
  const field: ReturnType<typeof useMultiSelectField> = useMultiSelectField(props);

  return (
    <ThemeProvider theme={outlinedFieldTheme}>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={props.options}
        value={props.value ?? EMPTY}
        onChange={field.handleChange}
        disabled={props.disabled}
        size={props.size}
        sx={props.sx}
        id={props.id}
        isOptionEqualToValue={isOptionEqualToValue}
        getOptionLabel={getOptionLabel}
        popupIcon={POPUP_ICON}
        renderInput={field.renderInput}
        renderValue={field.renderValue}
        slotProps={field.slotProps}
      />
      <Box role="status" aria-atomic="true" sx={srOnlySx}>
        {field.status}
      </Box>
    </ThemeProvider>
  );
}

UiMultiSelect.displayName = 'UiMultiSelect';

export default UiMultiSelect;
