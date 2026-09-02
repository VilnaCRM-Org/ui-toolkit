import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { UiAddButton, UiChevronButton, UiClearButton } from '@/components';

import { ADD_BUTTON_LABEL, CHEVRON_BUTTON_LABEL, CLEAR_BUTTON_LABEL } from './followup-fixtures';
import {
  ADD_BUTTON_ACTIVE_SX,
  ADD_BUTTON_HOVER_SX,
  CHEVRON_ACTIVE_SX,
  CHEVRON_HOVER_SX,
  CLEAR_BUTTON_ACTIVE_SX,
  CLEAR_BUTTON_HOVER_SX,
} from './followup-styles-b';

// The middle three of Story 3.7's nine board follow-up controls (see
// `followup-nodes-a.tsx` for the split rationale). A wired tile needs a
// callback to render as a control; the showcase tiles are static
// screenshots, so every wired one shares this stable no-op.
function noop(): void {}

export interface ChevronButtonTileOptions {
  hover?: boolean;
  active?: boolean;
  disabled?: boolean;
}

// Builds a chevron-button tile. Hover and active are both pointer-gated, so
// both are forced through the button's own `sx`; glyph ink never moves.
export function chevronButtonNode(opts: Readonly<ChevronButtonTileOptions>): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.hover ? [CHEVRON_HOVER_SX] : []),
    ...(opts.active ? [CHEVRON_ACTIVE_SX] : []),
  ];
  return (
    <UiChevronButton
      label={CHEVRON_BUTTON_LABEL}
      disabled={opts.disabled}
      onActivate={noop}
      sx={sx}
    />
  );
}

export interface AddButtonTileOptions {
  hover?: boolean;
  active?: boolean;
  disabled?: boolean;
}

// Builds an add-button tile on the board's own «Додати стовпець» label.
export function addButtonNode(opts: Readonly<AddButtonTileOptions>): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.hover ? [ADD_BUTTON_HOVER_SX] : []),
    ...(opts.active ? [ADD_BUTTON_ACTIVE_SX] : []),
  ];
  return (
    <UiAddButton label={ADD_BUTTON_LABEL} disabled={opts.disabled} onActivate={noop} sx={sx} />
  );
}

export interface ClearButtonTileOptions {
  hover?: boolean;
  active?: boolean;
  disabled?: boolean;
}

// Builds a clear-button tile on the board's own «Очистити фільтри» label.
export function clearButtonNode(opts: Readonly<ClearButtonTileOptions>): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.hover ? [CLEAR_BUTTON_HOVER_SX] : []),
    ...(opts.active ? [CLEAR_BUTTON_ACTIVE_SX] : []),
  ];
  return (
    <UiClearButton label={CLEAR_BUTTON_LABEL} disabled={opts.disabled} onActivate={noop} sx={sx} />
  );
}
