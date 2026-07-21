import { Autocomplete, Box, ThemeProvider } from '@mui/material';
import React from 'react';

import { ChevronDownGlyph, FieldLabel, hasText } from '../field-controls';

import selectTheme from './theme';
import type { UiSelectWithSearchOption, UiSelectWithSearchProps } from './types';
import { useSelectField } from './use-select-field';
import { useSelectAccessibilityWarnings } from './use-warnings';

const POPUP_ICON: React.ReactElement = <ChevronDownGlyph />;
const FIELD_STACK_SX = { display: 'flex', flexDirection: 'column' } as const;
// When force-opened for a static demo, pin the dropdown below the field (no flip).
const OPEN_POPPER = {
  placement: 'bottom-start' as const,
  modifiers: [
    { name: 'flip', enabled: false },
    { name: 'preventOverflow', enabled: false },
  ],
};

function isOptionEqualToValue(
  option: UiSelectWithSearchOption,
  value: UiSelectWithSearchOption
): boolean {
  return option.value === value.value;
}

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
        <Autocomplete
          options={props.options}
          value={props.value ?? null}
          onChange={field.handleChange}
          disabled={props.disabled}
          size={props.size}
          sx={props.sx}
          id={fieldId}
          isOptionEqualToValue={isOptionEqualToValue}
          popupIcon={POPUP_ICON}
          open={props.open}
          disablePortal={props.disablePortal}
          renderInput={field.renderInput}
          slotProps={props.open ? { ...field.slotProps, popper: OPEN_POPPER } : field.slotProps}
        />
      </Box>
    </ThemeProvider>
  );
}

UiSelectWithSearch.displayName = 'UiSelectWithSearch';

export default UiSelectWithSearch;
