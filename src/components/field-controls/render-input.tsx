import { Box, TextField } from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import { buildFieldSlotProps } from './field-slot-props';
import type { FieldSlotStyles } from './field-styles';

export interface FieldRenderInputConfig {
  label?: string | undefined;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  error?: boolean | undefined;
  helperText?: React.ReactNode | undefined;
  variant?: 'outlined' | 'filled' | 'standard' | undefined;
  ariaLabel?: string | undefined;
  /** Optional leading adornment (e.g. the search magnifier); omitted for select. */
  startAdornment?: React.ReactNode | undefined;
  /**
   * The loading slot painted at the field's trailing edge. Composed BEFORE MUI's
   * own end adornment (see `composeEndAdornment`) so the clear/popup indicators
   * stay mounted; `undefined` leaves `params.slotProps.input.endAdornment`
   * byte-identical, so a control that never sets `loading` renders exactly the
   * tree it renders today.
   */
  loadingAdornment?: React.ReactNode | undefined;
  /** Extra native-input props (handlers/style) merged over MUI's own; handlers compose. */
  htmlInputProps?: React.InputHTMLAttributes<HTMLInputElement> | undefined;
  /**
   * The inline ghost overlay (search/select typeahead), rendered as a sibling of the
   * field. When present the field is wrapped in a positioned Box so the overlay can
   * be pinned over the input; when absent the bare field renders unchanged.
   */
  overlay?: React.ReactNode | undefined;
  slotStyles: FieldSlotStyles;
}

// A positioned wrapper so the aria-hidden ghost overlay can be pinned over the input.
const WRAPPER_SX = { position: 'relative', width: '100%' } as const;

// Shared Autocomplete `renderInput` factory for the search/select controls.
// `{...params}` is spread so MUI's combobox wiring survives: `params.id` (enables
// the `helperText` → `aria-describedby` link) and `params.slotProps.input` (input
// root: ref + indicators). The native-input ARIA in `params.slotProps.htmlInput`
// is spread FIRST so a label-less `aria-label` only augments, never clobbers it.
export function createFieldRenderInput(
  config: FieldRenderInputConfig
): (params: AutocompleteRenderInputParams) => React.ReactElement {
  return function renderFieldInput(params: AutocompleteRenderInputParams): React.ReactElement {
    const field: React.ReactElement = (
      <TextField
        {...params}
        placeholder={config.placeholder}
        required={config.required}
        error={config.error}
        helperText={config.helperText}
        variant={config.variant}
        slotProps={buildFieldSlotProps(params, config)}
      />
    );
    // A ghost-enabled field always passes `overlay` (null while the completion is
    // hidden), so the wrapper is present from the first render — a plain field omits
    // it entirely. Toggling the wrapper on completion would remount the input, losing
    // focus and its live key handlers mid-type.
    if (config.overlay === undefined) return field;
    return (
      <Box sx={WRAPPER_SX}>
        {field}
        {config.overlay}
      </Box>
    );
  };
}
