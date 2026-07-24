import { Autocomplete, Box, ThemeProvider } from '@mui/material';
import React from 'react';

import {
  createFieldOptionRenderer,
  FieldLabel,
  hasText,
  OPEN_FIELD_POPPER,
} from '../field-controls';

import theme from './theme';
import type { UiSearchInputProps } from './types';
import { useSearchField } from './use-search-field';
import { useSearchWarnings } from './use-warnings';

const EMPTY_OPTIONS: string[] = [];
// Suggestion rows split into a dark typed prefix + grey completion (Figma 439:19399).
const renderSearchOption = createFieldOptionRenderer<string>(option => option);
const FIELD_STACK_SX = { display: 'flex', flexDirection: 'column' } as const;
function UiSearchInput(props: Readonly<UiSearchInputProps>): React.ReactElement {
  useSearchWarnings(props);
  const field: ReturnType<typeof useSearchField> = useSearchField(props);
  const generatedId: string = React.useId();
  const fieldId: string = props.id ?? generatedId;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={[FIELD_STACK_SX, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}>
        {hasText(props.label) && (
          <FieldLabel htmlFor={fieldId} required={props.required} error={props.error}>
            {props.label}
          </FieldLabel>
        )}
        <Autocomplete
          freeSolo
          options={props.options ?? EMPTY_OPTIONS}
          inputValue={field.text}
          onInputChange={field.handleInputChange}
          disabled={props.disabled}
          size={props.size}
          id={fieldId}
          popupIcon={null}
          disableClearable
          open={props.open}
          disablePortal={props.disablePortal}
          noOptionsText={props.noOptionsText}
          renderOption={renderSearchOption}
          renderInput={field.renderInput}
          slotProps={
            props.open ? { ...field.slotProps, popper: OPEN_FIELD_POPPER } : field.slotProps
          }
        />
      </Box>
    </ThemeProvider>
  );
}

UiSearchInput.displayName = 'UiSearchInput';

export default UiSearchInput;
