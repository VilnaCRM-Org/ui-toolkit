import { Box, ThemeProvider } from '@mui/material';
import React from 'react';

import { FieldLabel, hasText, srOnlySx } from '../field-controls';

import { SelectAutocomplete } from './select-autocomplete';
import selectTheme from './theme';
import type { UiSelectWithSearchProps } from './types';
import { useSelectField } from './use-select-field';
import { useSelectAccessibilityWarnings } from './use-warnings';

const FIELD_STACK_SX = { display: 'flex', flexDirection: 'column' } as const;

function UiSelectWithSearch(props: Readonly<UiSelectWithSearchProps>): React.ReactElement {
  useSelectAccessibilityWarnings(props);
  const field: ReturnType<typeof useSelectField> = useSelectField(props);
  const generatedId: string = React.useId();
  const fieldId: string = props.id ?? generatedId;

  return (
    <ThemeProvider theme={selectTheme}>
      <Box sx={FIELD_STACK_SX}>
        {hasText(props.label) && (
          <FieldLabel htmlFor={fieldId} required={props.required} error={props.error}>
            {props.label}
          </FieldLabel>
        )}
        <SelectAutocomplete control={props} fieldId={fieldId} field={field} />
      </Box>
      {/* The spinner is aria-hidden, so this is the only channel that speaks the
          busy state. Mounted from the first render with an empty string — a
          region created and filled in one commit is routinely dropped. */}
      <Box role="status" aria-atomic="true" sx={srOnlySx}>
        {field.announced}
      </Box>
    </ThemeProvider>
  );
}

UiSelectWithSearch.displayName = 'UiSelectWithSearch';

export default UiSelectWithSearch;
