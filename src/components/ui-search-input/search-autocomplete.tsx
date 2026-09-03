import { Autocomplete } from '@mui/material';
import React from 'react';

import {
  createFieldOptionRenderer,
  DEFAULT_LOADING_TEXT,
  OPEN_FIELD_POPPER,
} from '../field-controls';

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
      // A loading field stays fully operable — no `disabled`, no `readOnly`: the
      // user is mid-word and must be able to keep typing (SC 2.1.1), and a fetch
      // they triggered by typing must not change context (SC 3.2.2). MUI's own
      // `loading` only swaps the popup's empty row for `loadingText`, so a
      // running search no longer reads as "nothing found".
      loading={props.loading}
      loadingText={props.loadingText ?? DEFAULT_LOADING_TEXT}
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
