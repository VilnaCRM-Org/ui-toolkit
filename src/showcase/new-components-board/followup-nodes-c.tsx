import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { UiCopyField, UiSegmentedControl, UiSocialIconButton } from '@/components';
import type { SocialNetwork } from '@/components/ui-social-icon-button/types';

import { COPY_FIELD_SAMPLE, SEGMENTED_LABEL, SEGMENTED_OPTIONS } from './followup-fixtures';
import {
  COPY_FIELD_ACTIVE_SX,
  COPY_FIELD_HOVER_SX,
  SEGMENTED_HOVER_SX,
  SOCIAL_ICON_ACTIVE_SX,
  SOCIAL_ICON_HOVER_SX,
} from './followup-styles-b';

// The last three of Story 3.7's nine board follow-up controls (see
// `followup-nodes-a.tsx` for the split rationale). A wired tile needs a
// callback to render as a control; the showcase tiles are static
// screenshots, so every wired one shares this stable no-op.
function noop(): void {}

// The board order: instagram, github, facebook, linkedin (Board A row).
const NETWORKS: SocialNetwork[] = ['instagram', 'github', 'facebook', 'linkedin'];
// 8px gap, matching the Board A row's own gap.
const ROW_SX: SxProps<Theme> = { display: 'flex', gap: '0.5rem' };

export interface CopyFieldTileOptions {
  hover?: boolean;
  active?: boolean;
  disabled?: boolean;
}

// Builds a copy-field tile on the board's own sample code. Hover and active
// are both pointer-gated, so both are forced through the chip's own `sx`.
export function copyFieldNode(opts: Readonly<CopyFieldTileOptions>): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.hover ? [COPY_FIELD_HOVER_SX] : []),
    ...(opts.active ? [COPY_FIELD_ACTIVE_SX] : []),
  ];
  return <UiCopyField value={COPY_FIELD_SAMPLE} disabled={opts.disabled} sx={sx} />;
}

export interface SocialIconRowTileOptions {
  hover?: boolean;
  active?: boolean;
  disabled?: boolean;
}

// Builds ONE tile as a row of all four network chips, at the board's own 8px
// gap — one chip is the component, a row of four is the board's own
// composition. Hover/active repaint every chip in the row identically.
export function socialIconButtonRowNode(
  opts: Readonly<SocialIconRowTileOptions>
): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.hover ? [SOCIAL_ICON_HOVER_SX] : []),
    ...(opts.active ? [SOCIAL_ICON_ACTIVE_SX] : []),
  ];
  return (
    <Box sx={ROW_SX}>
      {NETWORKS.map(
        (network: SocialNetwork): React.ReactElement => (
          <UiSocialIconButton
            key={network}
            network={network}
            disabled={opts.disabled}
            onActivate={noop}
            sx={sx}
          />
        )
      )}
    </Box>
  );
}

export interface SegmentedControlTileOptions {
  hover?: boolean;
}

// Builds a segmented-control tile on the board's own three period options,
// the first pre-selected. Only Rest and Hover are painted (D-15); hover
// previews the second segment without moving the selection.
export function segmentedControlNode(
  opts: Readonly<SegmentedControlTileOptions>
): React.ReactElement {
  return (
    <UiSegmentedControl
      options={SEGMENTED_OPTIONS}
      value="week"
      onChange={noop}
      label={SEGMENTED_LABEL}
      sx={opts.hover ? SEGMENTED_HOVER_SX : undefined}
    />
  );
}
