import { InputAdornment } from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import { createFieldRenderInput, type FieldRenderInputConfig } from '../field-controls';

import { SearchGlyph } from './icons';
import { searchLoadingAdornment } from './loading-adornment';

const START_ADORNMENT: React.ReactElement = (
  <InputAdornment position="start">
    <SearchGlyph />
  </InputAdornment>
);

// UiSearchInput is outlined-only and always leads with the magnifier, so `variant`
// and `startAdornment` are fixed here; the caller supplies label/state and the inline
// ghost `overlay` (the shared renderInput wraps the field so the overlay pins over it).
export type SearchRenderInputConfig = Omit<
  FieldRenderInputConfig,
  'startAdornment' | 'variant' | 'loadingAdornment'
> & {
  /** Tri-state busy flag; the trailing slot is built from it here. */
  loading?: boolean;
};

// UiSearchInput's renderInput: the shared field renderInput plus the leading
// magnifier adornment.
export function createSearchRenderInput(
  config: SearchRenderInputConfig
): (params: AutocompleteRenderInputParams) => React.ReactElement {
  return createFieldRenderInput({
    ...config,
    startAdornment: START_ADORNMENT,
    loadingAdornment: searchLoadingAdornment(config.loading),
  });
}
