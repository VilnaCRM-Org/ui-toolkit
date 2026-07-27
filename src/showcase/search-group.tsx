import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { UiSearchInput } from '@/components';

import type { GroupSpec } from './types';

const SUGGESTIONS = ['Топ продажники', 'Топ продажі за місяць', 'Топ продажі за рік'];

// Forced interaction-state visuals (Figma draws these as separate frames). Each
// re-applies the exact hover recipe the theme scopes to `:hover`.
const SEARCH_HOVER_SX = {
  '& .MuiInputAdornment-positionStart': { color: '#1EAEFF' },
  '& .MuiOutlinedInput-root': { boxShadow: '0px 4px 9px 0px rgba(74, 78, 95, 0.1)' },
} as const;
// Forced responsive variant: the field's tablet sizing is viewport-media-gated, so a
// wide-viewport showcase tile re-applies it directly — 52px tall, 24px magnifier, 16px
// text. (Mobile matches desktop except width, so its tile only overrides the width.)
const SEARCH_TABLET_SX = {
  '& .MuiOutlinedInput-root': { height: '3.25rem', minHeight: '3.25rem', fontSize: '1rem' },
  '& .MuiInputAdornment-positionStart svg': { width: '1.5rem', height: '1.5rem' },
  // The ghost overlay's typed mirror, completion and caret are viewport-media-gated
  // too, so the forced-tablet tile re-applies the tablet sizes (16px runs, 2px caret)
  // — otherwise the desktop 14px mirror leaves the caret 7px short of the typed text.
  '& .ui-ghost-run': { fontSize: '1rem' },
  // The dropdown's tablet sizing is media-gated too: 7px visible gap, 62px rows,
  // 16px text, 22px inset (Figma node 439:19410).
  '& .MuiAutocomplete-paper': { marginTop: '0.4375rem' },
  '& .MuiAutocomplete-listbox .MuiAutocomplete-option': {
    minHeight: '3.875rem',
    fontSize: '1rem',
    paddingLeft: '1.375rem',
  },
} as const;
// Active/open state: Figma tints the magnifier brand-blue (the focus/hover accent).
const SEARCH_ACTIVE_SX = { '& .MuiInputAdornment-positionStart': { color: '#1EAEFF' } } as const;
// The paper's field-width collapse and 8px gap are media-gated (mobile), so a forced-
// mobile open tile re-zeros the min-width and re-applies the gap.
const SEARCH_MOBILE_PAPER_SX = {
  '& .MuiAutocomplete-paper': { minWidth: 0, marginTop: '0.375rem' },
} as const;

// Builds a search-field tile for a size/state combination. Responsive sizing is
// viewport-gated and hover/open visuals are pointer-gated, so each is forced here.
function searchNode(opts: {
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

export const SEARCH_GROUP: GroupSpec = {
  title: 'Пошук',
  width: 477,
  states: [
    { label: 'Rest', node: searchNode({}) },
    { label: 'Hover', node: searchNode({ hover: true }) },
    { label: 'Open', tall: true, node: searchNode({ open: true }) },
    { label: 'Tablet — Rest', width: 360, node: searchNode({ tablet: true }) },
    { label: 'Tablet — Hover', width: 360, node: searchNode({ tablet: true, hover: true }) },
    {
      label: 'Tablet — Open',
      width: 360,
      tall: true,
      node: searchNode({ tablet: true, open: true }),
    },
    { label: 'Mobile — Rest', width: 355, node: searchNode({}) },
    { label: 'Mobile — Hover', width: 355, node: searchNode({ hover: true }) },
    {
      label: 'Mobile — Open',
      width: 355,
      tall: true,
      node: searchNode({ open: true, mobilePaper: true }),
    },
  ],
};
