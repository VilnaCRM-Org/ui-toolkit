import { InputAdornment, TextField } from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import { SearchGlyph } from './icons';
import type { UiSearchInputProps } from './types';

export type SearchRenderInputConfig = Pick<
  UiSearchInputProps,
  'label' | 'placeholder' | 'required' | 'error' | 'helperText'
> & { ariaLabel?: string };

const START_ADORNMENT: React.ReactElement = (
  <InputAdornment position="start">
    <SearchGlyph />
  </InputAdornment>
);

// Builds the Autocomplete `renderInput` callback. `{...params}` MUST be spread so
// MUI's combobox wiring survives: `params.id` (enables the `helperText` →
// `aria-describedby` link) and `params.slotProps.input` (input root: ref +
// indicators). The magnifier is injected as the input's `startAdornment`; the
// native-input ARIA in `params.slotProps.htmlInput` is spread FIRST so a
// label-less `aria-label` only augments, never clobbers, it.
export function createSearchRenderInput(
  config: SearchRenderInputConfig
): (params: AutocompleteRenderInputParams) => React.ReactElement {
  return function renderSearchInput(params: AutocompleteRenderInputParams): React.ReactElement {
    return (
      <TextField
        {...params}
        label={config.label}
        placeholder={config.placeholder}
        required={config.required}
        error={config.error}
        helperText={config.helperText}
        slotProps={{
          ...params.slotProps,
          input: { ...params.slotProps.input, startAdornment: START_ADORNMENT },
          htmlInput: {
            ...params.slotProps.htmlInput,
            'aria-label': config.label == null ? config.ariaLabel : undefined,
          },
        }}
      />
    );
  };
}
