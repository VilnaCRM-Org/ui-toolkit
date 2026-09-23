import type { AutocompleteRenderInputParams, TextFieldProps } from '@mui/material';
import type React from 'react';

import { composeEndAdornment } from './compose-end-adornment';
import type { FieldSlotStyles } from './field-styles';
import { hasText } from './has-text';

type HtmlInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface FieldSlotConfig {
  label?: string | undefined;
  ariaLabel?: string | undefined;
  startAdornment?: React.ReactNode | undefined;
  loadingAdornment?: React.ReactNode | undefined;
  htmlInputProps?: HtmlInputProps | undefined;
  slotStyles: FieldSlotStyles;
}

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
  config: FieldSlotConfig
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

function buildInput(
  params: AutocompleteRenderInputParams,
  config: FieldSlotConfig
): Record<string, unknown> {
  return {
    ...params.slotProps.input,
    startAdornment: config.startAdornment ?? params.slotProps.input.startAdornment,
    endAdornment: composeEndAdornment(config.loadingAdornment, params.slotProps.input.endAdornment),
    sx: config.slotStyles.inputRoot,
    slotProps: { notchedOutline: { sx: config.slotStyles.notchedOutline } },
  };
}

export function buildFieldSlotProps(
  params: AutocompleteRenderInputParams,
  config: FieldSlotConfig
): NonNullable<TextFieldProps['slotProps']> {
  return {
    ...params.slotProps,
    input: buildInput(params, config),
    htmlInput: { ...buildHtmlInput(params, config), sx: config.slotStyles.htmlInput },
    formHelperText: { sx: config.slotStyles.formHelperText },
  };
}
