import type { SxProps, Theme } from '@mui/material';

import { websiteBreakpointValues } from '../ui-breakpoints';

// The list mirrors the website's swagger operation stack, so it follows the WEBSITE
// breakpoint scale: `for-large-screens` is max-width 1024px, `for-small-screens`
// max-width 640px. Tablet-first, so the narrower mobile rule wins where they overlap.
const TABLET_MAX: string = `@media (max-width: ${websiteBreakpointValues.lg}px)`;
const MOBILE_MAX: string = `@media (max-width: ${websiteBreakpointValues.sm}px)`;

// A bare vertical stack: full-width rows, no bullets/margins/padding and no border
// or background of its own. The row gap follows the website's `.opblock`
// margin-bottom tiers — 8px, widening to 16px through the 641–1024px band and back
// to 8px below it. `list-style: none` is paired with an explicit `role="list"` on
// the component (Safari/VoiceOver strips list semantics from an unstyled list — a
// sanctioned redundant-ARIA exception).
export const listSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  width: '100%',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  [TABLET_MAX]: { gap: '1rem' },
  [MOBILE_MAX]: { gap: '0.5rem' },
};

// One list item: a plain block wrapper holding a single row, no list marker.
export const listItemSx: SxProps<Theme> = {
  display: 'block',
  margin: 0,
  padding: 0,
  listStyle: 'none',
};
