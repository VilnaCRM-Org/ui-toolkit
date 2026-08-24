import type { SxProps, Theme } from '@mui/material';

// A bare vertical stack: full-width rows 8px apart, no bullets/margins/padding and
// no border or background of its own. `list-style: none` is paired with an
// explicit `role="list"` on the component (Safari/VoiceOver strips list semantics
// from an unstyled list — a sanctioned redundant-ARIA exception).
export const listSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  width: '100%',
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

// One list item: a plain block wrapper holding a single row, no list marker.
export const listItemSx: SxProps<Theme> = {
  display: 'block',
  margin: 0,
  padding: 0,
  listStyle: 'none',
};
