import { TextField } from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import type { UiSelectWithSearchProps } from './types';

export type SelectRenderInputConfig = Pick<
  UiSelectWithSearchProps,
  'label' | 'placeholder' | 'required' | 'error' | 'helperText' | 'variant'
> & { ariaLabel?: string };

// Builds the Autocomplete `renderInput` callback. `{...params}` MUST be spread
// so MUI's combobox wiring survives: `params.id` (which is what makes the
// `helperText` → `aria-describedby` link resolve — TextField only wires it when
// it has both `helperText` and an `id`) and `params.slotProps.input` (the input
// root slot: ref + popup/clear indicators). The native-input ARIA
// (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`,
// `aria-autocomplete`) lives in `params.slotProps.htmlInput` (MUI v9); it is
// spread FIRST so a label-less `aria-label` only augments, never clobbers, it.
export function createSelectRenderInput(
  config: SelectRenderInputConfig
): (params: AutocompleteRenderInputParams) => React.ReactElement {
  return function renderSelectInput(params: AutocompleteRenderInputParams): React.ReactElement {
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
          htmlInput: {
            ...params.slotProps.htmlInput,
            'aria-label': config.label == null ? config.ariaLabel : undefined,
          },
        }}
      />
    );
  };
}
