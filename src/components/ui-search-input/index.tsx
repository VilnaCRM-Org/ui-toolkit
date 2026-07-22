import { Autocomplete, Box, ThemeProvider } from '@mui/material';
import React from 'react';

import { FieldLabel, hasText } from '../field-controls';

import { renderSearchOption } from './search-option';
import theme from './theme';
import type { UiSearchInputProps } from './types';
import { useSearchField } from './use-search-field';
import { useSearchWarnings } from './use-warnings';

const EMPTY_OPTIONS: string[] = [];
const FIELD_STACK_SX = { display: 'flex', flexDirection: 'column' } as const;
// When the dropdown is force-opened for a static demo, keep it pinned below the
// field (no viewport flip) so it renders predictably in showcase/state tiles.
const OPEN_POPPER = {
  placement: 'bottom-start' as const,
  modifiers: [
    { name: 'flip', enabled: false },
    { name: 'preventOverflow', enabled: false },
  ],
};

function UiSearchInput(props: Readonly<UiSearchInputProps>): React.ReactElement {
  useSearchWarnings(props);
  const field: ReturnType<typeof useSearchField> = useSearchField(props);
  const generatedId: string = React.useId();
  const fieldId: string = props.id ?? generatedId;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={FIELD_STACK_SX}>
        {hasText(props.label) && (
          <FieldLabel htmlFor={fieldId} required={props.required} error={props.error}>
            {props.label}
          </FieldLabel>
        )}
        <Autocomplete
          freeSolo
          options={props.options ?? EMPTY_OPTIONS}
          inputValue={props.value}
          onInputChange={field.handleInputChange}
          disabled={props.disabled}
          size={props.size}
          sx={props.sx}
          id={fieldId}
          popupIcon={null}
          disableClearable
          open={props.open}
          disablePortal={props.disablePortal}
          noOptionsText={props.noOptionsText}
          renderOption={renderSearchOption}
          renderInput={field.renderInput}
          slotProps={props.open ? { ...field.slotProps, popper: OPEN_POPPER } : field.slotProps}
        />
      </Box>
    </ThemeProvider>
  );
}

UiSearchInput.displayName = 'UiSearchInput';

export default UiSearchInput;
