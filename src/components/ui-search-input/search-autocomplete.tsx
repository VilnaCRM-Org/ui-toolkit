import { Autocomplete } from '@mui/material';
import React from 'react';

import { createFieldOptionRenderer, OPEN_FIELD_POPPER } from '../field-controls';

import type { UiSearchInputProps } from './types';
import type { SearchField } from './use-search-field';

const EMPTY_OPTIONS: string[] = [];
// Suggestion rows split into a dark typed prefix + grey completion (Figma 439:19399).
const renderSearchOption = createFieldOptionRenderer<string>(option => option);

// Builds the freeSolo `Autocomplete` element for UiSearchInput. It is a plain
// element factory (not a component), so the rendered tree is byte-for-byte what
// inlining it in the component body produced, while its token budget is measured
// on its own — which keeps `UiSearchInput` inside the complexity gate.
export function renderSearchAutocomplete(
  props: Readonly<UiSearchInputProps>,
  field: SearchField,
  fieldId: string
): React.ReactElement {
  return (
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
      slotProps={props.open ? { ...field.slotProps, popper: OPEN_FIELD_POPPER } : field.slotProps}
    />
  );
}
