import { InputAdornment } from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import { createFieldRenderInput, type FieldRenderInputConfig } from '../field-controls';

import { SearchGlyph } from './icons';

const START_ADORNMENT: React.ReactElement = (
  <InputAdornment position="start">
    <SearchGlyph />
  </InputAdornment>
);

export type SearchRenderInputConfig = Omit<FieldRenderInputConfig, 'startAdornment' | 'variant'>;

// UiSearchInput's renderInput: the shared field renderInput plus the leading
// magnifier adornment. Outlined-only, so `variant` is not exposed.
export function createSearchRenderInput(
  config: SearchRenderInputConfig
): (params: AutocompleteRenderInputParams) => React.ReactElement {
  return createFieldRenderInput({ ...config, startAdornment: START_ADORNMENT });
}
