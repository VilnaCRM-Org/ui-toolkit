import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import UiFilterChip from '@/components/ui-filter-chip';
import UiPaymentOptionCard from '@/components/ui-payment-option-card';
import UiPinInput from '@/components/ui-pin-input';

import { CHIP_LABEL, CHIP_VALUE, PIN_ERROR_TEXT, type PaymentSample } from './fixtures';
import {
  FILTER_CHIP_ACTIVE_SX,
  FILTER_CHIP_FOCUS_SX,
  FILTER_CHIP_HOVER_SX,
  PAYMENT_CARD_HOVER_SX,
  PIN_CELL_FOCUS_SX,
  PIN_CELL_HOVER_SX,
} from './micro-styles';

// A wired tile needs a callback to render as a control; the showcase tiles are
// static screenshots, so every wired one shares this stable no-op.
function noop(): void {}

export interface FilterChipTileOptions {
  hover?: boolean;
  active?: boolean;
  focus?: boolean;
  disabled?: boolean;
  staticChip?: boolean;
}

// Builds a filter-chip tile on the master's own sample string. Hover, press and
// focus are all pointer/keyboard-gated, so each is forced through the chip's own
// `sx`; the static tile drops `onRemove`, which leaves plain content with no role,
// no tab stop and no ARIA — not even `aria-disabled`.
export function filterChipNode(opts: Readonly<FilterChipTileOptions>): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.hover ? [FILTER_CHIP_HOVER_SX] : []),
    ...(opts.active ? [FILTER_CHIP_ACTIVE_SX] : []),
    ...(opts.focus ? [FILTER_CHIP_FOCUS_SX] : []),
  ];
  return (
    <UiFilterChip
      label={CHIP_LABEL}
      filterValue={CHIP_VALUE}
      disabled={opts.disabled}
      onRemove={opts.staticChip ? undefined : noop}
      sx={sx}
    />
  );
}

export interface PinInputTileOptions {
  length?: number;
  value?: string;
  hover?: boolean;
  focus?: boolean;
  disabled?: boolean;
  error?: boolean;
}

// Builds a PIN tile. The 64x86 master IS one cell, so the single-cell tiles are a
// one-cell field and the group tile only raises `length` — one builder, no
// hand-built cells. Hover and the Figma "Active" (= focused) chrome are both
// gated, so they are forced through the cell class hook.
export function pinInputNode(opts: Readonly<PinInputTileOptions>): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.hover ? [PIN_CELL_HOVER_SX] : []),
    ...(opts.focus ? [PIN_CELL_FOCUS_SX] : []),
  ];
  return (
    <UiPinInput
      label="Код підтвердження"
      length={opts.length ?? 1}
      value={opts.value ?? ''}
      onChange={noop}
      disabled={opts.disabled}
      error={opts.error}
      helperText={opts.error ? PIN_ERROR_TEXT : undefined}
      sx={sx}
    />
  );
}

export interface PaymentCardTileOptions {
  option: PaymentSample;
  selected?: boolean;
  hover?: boolean;
  disabled?: boolean;
  staticCard?: boolean;
}

// Builds a payment-option-card tile on a master's own provider and wordmark. The
// static tile drops `onSelect`, which leaves plain content with no ARIA at all;
// every wired tile is wrapped in the `role="radiogroup"` the card deliberately
// never renders for itself (a11y contract §1.2) — the board is the CONSUMER here.
export function paymentOptionCardNode(opts: Readonly<PaymentCardTileOptions>): React.ReactElement {
  const card = (
    <UiPaymentOptionCard
      name={opts.option.name}
      logo={opts.option.logo}
      logoDisabled={opts.option.logoDisabled}
      selected={opts.selected}
      disabled={opts.disabled}
      onSelect={opts.staticCard ? undefined : noop}
      sx={opts.hover ? PAYMENT_CARD_HOVER_SX : undefined}
    />
  );
  if (opts.staticCard) {
    return card;
  }
  return <Box role="radiogroup">{card}</Box>;
}
