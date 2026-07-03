import { Autocomplete, ThemeProvider } from '@mui/material';
import React from 'react';

import { ChevronDownGlyph } from './icons';
import theme from './theme';
import type { UiSelectWithSearchOption, UiSelectWithSearchProps } from './types';
import { useSelectField } from './use-select-field';
import { useSelectAccessibilityWarnings } from './use-warnings';

const POPUP_ICON: React.ReactElement = <ChevronDownGlyph />;

function isOptionEqualToValue(
  option: UiSelectWithSearchOption,
  value: UiSelectWithSearchOption
): boolean {
  return option.value === value.value;
}

function UiSelectWithSearch(props: UiSelectWithSearchProps): React.ReactElement {
  useSelectAccessibilityWarnings(props);
  const field: ReturnType<typeof useSelectField> = useSelectField(props);

  return (
    <ThemeProvider theme={theme}>
      <Autocomplete
        options={props.options}
        value={props.value ?? null}
        onChange={field.handleChange}
        disabled={props.disabled}
        size={props.size}
        sx={props.sx}
        id={props.id}
        isOptionEqualToValue={isOptionEqualToValue}
        popupIcon={POPUP_ICON}
        renderInput={field.renderInput}
        slotProps={field.slotProps}
      />
    </ThemeProvider>
  );
}

UiSelectWithSearch.displayName = 'UiSelectWithSearch';

export default UiSelectWithSearch;
