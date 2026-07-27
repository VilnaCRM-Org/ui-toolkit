import { Box, ThemeProvider } from '@mui/material';
import React from 'react';

import { FieldLabel, hasText } from '../field-controls';

import { renderSearchAutocomplete } from './search-autocomplete';
import theme from './theme';
import type { UiSearchInputProps } from './types';
import { useSearchField } from './use-search-field';
import { useSearchWarnings } from './use-warnings';

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
        {renderSearchAutocomplete(props, field, fieldId)}
      </Box>
    </ThemeProvider>
  );
}

UiSearchInput.displayName = 'UiSearchInput';

export default UiSearchInput;
