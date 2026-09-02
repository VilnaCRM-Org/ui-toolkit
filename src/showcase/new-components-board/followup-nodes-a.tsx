import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { UiBackgroundPicker, UiButton, UiOptionCard } from '@/components';

import { OPTION_CARD_CAPTION, OPTION_CARD_VALUE, PICKER_GROUPS } from './followup-fixtures';
import {
  DANGER_BUTTON_ACTIVE_SX,
  DANGER_BUTTON_HOVER_SX,
  OPTION_CARD_HOVER_SX,
  PICKER_HOVER_SX,
} from './followup-styles-a';

// The first three of Story 3.7's nine board follow-up controls (split across
// `followup-nodes-a/b/c.tsx` per the `micro-nodes.tsx` `lloc_file` budget
// precedent). A wired tile needs a callback to render as a control; the
// showcase tiles are static screenshots, so every wired one shares this
// stable no-op.
function noop(): void {}

export interface BackgroundPickerTileOptions {
  hover?: boolean;
  open?: boolean;
  disabled?: boolean;
}

// Builds a background-picker tile on the board's own two groups. Open and
// disabled are real, controlled props; hover is pointer-gated, so it is
// forced through the card's own `sx`.
export function backgroundPickerNode(
  opts: Readonly<BackgroundPickerTileOptions>
): React.ReactElement {
  return (
    <UiBackgroundPicker
      groups={PICKER_GROUPS}
      open={opts.open}
      onOpenChange={noop}
      onChange={noop}
      disabled={opts.disabled}
      sx={opts.hover ? PICKER_HOVER_SX : undefined}
    />
  );
}

export interface DangerButtonTileOptions {
  hover?: boolean;
  active?: boolean;
  disabled?: boolean;
}

// Builds the `UiButton` `name="danger"` tile. Hover and active are both
// pointer-gated, so both are forced through the button's own `sx`; disabled
// is native (the sole `UiButton`-inherited exception in this story).
export function dangerButtonNode(opts: Readonly<DangerButtonTileOptions>): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.hover ? [DANGER_BUTTON_HOVER_SX] : []),
    ...(opts.active ? [DANGER_BUTTON_ACTIVE_SX] : []),
  ];
  return (
    <UiButton name="danger" variant="contained" size="small" disabled={opts.disabled} sx={sx}>
      Cancel
    </UiButton>
  );
}

export interface OptionCardTileOptions {
  hover?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

// Builds an option-card tile on the master's own caption/value pair. Every
// tile is wired, wrapped in the `role="radiogroup"` the card deliberately
// never renders for itself (a11y contract) — the board is the CONSUMER here.
export function optionCardNode(opts: Readonly<OptionCardTileOptions>): React.ReactElement {
  return (
    <Box role="radiogroup">
      <UiOptionCard
        label={OPTION_CARD_CAPTION}
        valueLabel={OPTION_CARD_VALUE}
        selected={opts.selected}
        disabled={opts.disabled}
        onSelect={noop}
        sx={opts.hover ? OPTION_CARD_HOVER_SX : undefined}
      />
    </Box>
  );
}
