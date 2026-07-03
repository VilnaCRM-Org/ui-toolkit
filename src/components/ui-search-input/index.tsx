import { Autocomplete, ThemeProvider } from '@mui/material';
import React from 'react';

import theme from './theme';
import type { UiSearchInputProps } from './types';
import { useSearchField } from './use-search-field';
import { useSearchWarnings } from './use-warnings';

const EMPTY_OPTIONS: string[] = [];

function UiSearchInput(props: Readonly<UiSearchInputProps>): React.ReactElement {
  useSearchWarnings(props);
  const field: ReturnType<typeof useSearchField> = useSearchField(props);

  return (
    <ThemeProvider theme={theme}>
      <Autocomplete
        freeSolo
        options={props.options ?? EMPTY_OPTIONS}
        inputValue={props.value ?? ''}
        onInputChange={field.handleInputChange}
        disabled={props.disabled}
        size={props.size}
        sx={props.sx}
        id={props.id}
        popupIcon={null}
        disableClearable
        noOptionsText={props.noOptionsText}
        renderInput={field.renderInput}
        slotProps={field.slotProps}
      />
    </ThemeProvider>
  );
}

UiSearchInput.displayName = 'UiSearchInput';

export default UiSearchInput;
