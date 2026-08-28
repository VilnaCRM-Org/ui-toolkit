import { Box, ThemeProvider } from '@mui/material';
import React from 'react';

import { FieldLabel, hasText } from '../field-controls';

import { MultiSelectCombobox } from './combobox';
import { srOnlySx } from './styles';
import multiSelectTheme from './theme';
import type { UiMultiSelectProps } from './types';
import { useMultiSelectField, type MultiSelectField } from './use-multi-select-field';
import { useMultiSelectWarnings } from './use-warnings';

const FIELD_STACK_SX = { display: 'flex', flexDirection: 'column' } as const;

// Multi-value searchable combobox: options are picked from the listbox and shown
// as removable chips. Built on MUI `Autocomplete multiple` (see `./combobox`).
// A hidden polite `role="status"` region announces chip add/remove (MUI is silent
// there).
function UiMultiSelect(props: Readonly<UiMultiSelectProps>): React.ReactElement {
  useMultiSelectWarnings(props);
  const field: MultiSelectField = useMultiSelectField(props);
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
        <MultiSelectCombobox config={props} field={field} fieldId={fieldId} />
      </Box>
      <Box role="status" aria-atomic="true" sx={srOnlySx}>
        {field.status}
      </Box>
    </ThemeProvider>
  );
}

UiMultiSelect.displayName = 'UiMultiSelect';

export default UiMultiSelect;
