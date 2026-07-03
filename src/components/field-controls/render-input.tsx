import { TextField } from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

export interface FieldRenderInputConfig {
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  variant?: 'outlined' | 'filled' | 'standard';
  ariaLabel?: string;
  /** Optional leading adornment (e.g. the search magnifier); omitted for select. */
  startAdornment?: React.ReactNode;
}

// Shared Autocomplete `renderInput` factory for the search/select controls.
// `{...params}` is spread so MUI's combobox wiring survives: `params.id` (enables
// the `helperText` → `aria-describedby` link) and `params.slotProps.input` (input
// root: ref + indicators). The native-input ARIA in `params.slotProps.htmlInput`
// is spread FIRST so a label-less `aria-label` only augments, never clobbers it.
export function createFieldRenderInput(
  config: FieldRenderInputConfig
): (params: AutocompleteRenderInputParams) => React.ReactElement {
  return function renderFieldInput(params: AutocompleteRenderInputParams): React.ReactElement {
    return (
      <TextField
        {...params}
        label={config.label}
        placeholder={config.placeholder}
        required={config.required}
        error={config.error}
        helperText={config.helperText}
        variant={config.variant}
        slotProps={{
          ...params.slotProps,
          input: { ...params.slotProps.input, startAdornment: config.startAdornment },
          htmlInput: {
            ...params.slotProps.htmlInput,
            'aria-label': config.label == null ? config.ariaLabel : undefined,
          },
        }}
      />
    );
  };
}
