import { Box, TextField } from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';

import { hasText } from './has-text';

type HtmlInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface FieldRenderInputConfig {
  label?: string | undefined;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  error?: boolean | undefined;
  helperText?: React.ReactNode;
  variant?: 'outlined' | 'filled' | 'standard' | undefined;
  ariaLabel?: string | undefined;
  /** Optional leading adornment (e.g. the search magnifier); omitted for select. */
  startAdornment?: React.ReactNode;
  /** Extra native-input props (handlers/style) merged over MUI's own; handlers compose. */
  htmlInputProps?: HtmlInputProps;
  /**
   * The inline ghost overlay (search/select typeahead), rendered as a sibling of the
   * field. When present the field is wrapped in a positioned Box so the overlay can
   * be pinned over the input; when absent the bare field renders unchanged.
   */
  overlay?: React.ReactNode;
}

// A positioned wrapper so the aria-hidden ghost overlay can be pinned over the input.
const WRAPPER_SX = { position: 'relative', width: '100%' } as const;

// Runs both handlers so a caller-supplied onKeyDown/onFocus/onBlur augments MUI's
// combobox wiring instead of clobbering it (list nav, focus/open state).
function compose<E>(
  own: ((e: E) => void) | undefined,
  extra: ((e: E) => void) | undefined
): ((e: E) => void) | undefined {
  if (own && extra)
    return (event: E): void => {
      own(event);
      extra(event);
    };
  return own ?? extra;
}

function buildHtmlInput(
  params: AutocompleteRenderInputParams,
  config: FieldRenderInputConfig
): HtmlInputProps {
  const own: HtmlInputProps = params.slotProps.htmlInput;
  const extra: HtmlInputProps = config.htmlInputProps ?? {};
  return {
    ...own,
    ...extra,
    'aria-label': hasText(config.label) ? undefined : config.ariaLabel,
    onKeyDown: compose(own.onKeyDown, extra.onKeyDown),
    onFocus: compose(own.onFocus, extra.onFocus),
    onBlur: compose(own.onBlur, extra.onBlur),
    style: { ...own.style, ...extra.style },
  };
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
    const field: React.ReactElement = (
      <TextField
        {...params}
        placeholder={config.placeholder}
        required={config.required}
        error={config.error}
        helperText={config.helperText}
        variant={config.variant}
        slotProps={{
          ...params.slotProps,
          input: {
            ...params.slotProps.input,
            startAdornment: config.startAdornment ?? params.slotProps.input.startAdornment,
          },
          htmlInput: buildHtmlInput(params, config),
        }}
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
