import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { UiItemRow, UiSearchInput } from '@/components';
import type { ItemRowMethod } from '@/components/ui-item-row/types';

import { SUGGESTIONS } from './fixtures';
import {
  SEARCH_ACTIVE_SX,
  SEARCH_HOVER_SX,
  SEARCH_MOBILE_PAPER_SX,
  SEARCH_TABLET_SX,
} from './styles';

// Builds a search-field tile for a size/state combination. Responsive sizing is
// viewport-gated and hover/open visuals are pointer-gated, so each is forced here.
export function searchNode(opts: {
  tablet?: boolean;
  hover?: boolean;
  open?: boolean;
  mobilePaper?: boolean;
}): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.tablet ? [SEARCH_TABLET_SX] : []),
    ...(opts.hover ? [SEARCH_HOVER_SX] : []),
    ...(opts.open ? [SEARCH_ACTIVE_SX] : []),
    ...(opts.mobilePaper ? [SEARCH_MOBILE_PAPER_SX] : []),
  ];
  return (
    <Box sx={sx}>
      <UiSearchInput
        aria-label="Пошук"
        placeholder="Щось шукаєте?"
        options={SUGGESTIONS}
        value={opts.open ? 'Топ прод' : undefined}
        open={opts.open || undefined}
        disablePortal={opts.open || undefined}
      />
    </Box>
  );
}

// A wired row needs an `onToggle` to render as a disclosure button; the showcase
// tiles are static screenshots, so the expanded tile uses this stable no-op.
function noopToggle(): void {}

// Builds an item-row tile. Rest/muted render straight from props; hover and mobile
// are forced through `sx` (media/pointer-gated in the component). The expanded tile
// is a wired row (noop toggle) so its chevron flips up and tints to the accent.
export function itemRowNode(opts: {
  method: ItemRowMethod;
  path: string;
  description: string;
  muted?: boolean;
  expanded?: boolean;
  sx?: SxProps<Theme>;
}): React.ReactElement {
  return (
    <UiItemRow
      method={opts.method}
      path={opts.path}
      description={opts.description}
      muted={opts.muted}
      expanded={opts.expanded}
      onToggle={opts.expanded ? noopToggle : undefined}
      sx={opts.sx}
    />
  );
}
