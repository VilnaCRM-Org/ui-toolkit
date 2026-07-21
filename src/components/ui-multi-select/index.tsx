import { Autocomplete, Box, ThemeProvider } from '@mui/material';
import React from 'react';

import { ChevronDownGlyph, FieldLabel, hasText } from '../field-controls';

import { srOnlySx } from './styles';
import multiSelectTheme from './theme';
import type { UiMultiSelectOption, UiMultiSelectProps } from './types';
import { useMultiSelectField } from './use-multi-select-field';
import { useMultiSelectWarnings } from './use-warnings';

const POPUP_ICON: React.ReactElement = <ChevronDownGlyph />;
const EMPTY: UiMultiSelectOption[] = [];
const FIELD_STACK_SX = { display: 'flex', flexDirection: 'column' } as const;
// When force-opened for a static demo, pin the dropdown below the field (no flip).
const OPEN_POPPER = {
  placement: 'bottom-start' as const,
  modifiers: [
    { name: 'flip', enabled: false },
    { name: 'preventOverflow', enabled: false },
  ],
};

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
  const generatedId: string = React.useId();
  const fieldId: string = props.id ?? generatedId;

  return (
    <ThemeProvider theme={multiSelectTheme}>
      <Box sx={FIELD_STACK_SX}>
        {hasText(props.label) && (
          <FieldLabel htmlFor={fieldId} required={props.required} error={props.error}>
            {props.label}
          </FieldLabel>
        )}
        <Autocomplete
          multiple
          disableCloseOnSelect
          options={props.options}
          value={props.value ?? EMPTY}
          onChange={field.handleChange}
          disabled={props.disabled}
          size={props.size}
          sx={props.sx}
          id={fieldId}
          isOptionEqualToValue={isOptionEqualToValue}
          getOptionLabel={getOptionLabel}
          popupIcon={POPUP_ICON}
          open={props.open}
          disablePortal={props.disablePortal}
          renderInput={field.renderInput}
          renderValue={field.renderValue}
          slotProps={props.open ? { ...field.slotProps, popper: OPEN_POPPER } : field.slotProps}
        />
      </Box>
      <Box role="status" aria-atomic="true" sx={srOnlySx}>
        {field.status}
      </Box>
    </ThemeProvider>
  );
}

UiMultiSelect.displayName = 'UiMultiSelect';

export default UiMultiSelect;
