import { MOBILE_MAX } from './fixtures';

// Forced interaction-state visuals (Figma draws these as separate frames). Each
// re-applies the exact hover recipe the theme scopes to `:hover`.
export const SEARCH_HOVER_SX = {
  '& .MuiInputAdornment-positionStart': { color: '#1EAEFF' },
  '& .MuiOutlinedInput-root': { boxShadow: '0px 4px 9px 0px rgba(74, 78, 95, 0.1)' },
} as const;
// Forced responsive variant: the field's tablet sizing is viewport-media-gated, so a
// wide-viewport showcase tile re-applies it directly — 52px tall, 24px magnifier, 16px
// text. (Mobile matches desktop except width, so its tile only overrides the width.)
export const SEARCH_TABLET_SX = {
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
export const SEARCH_ACTIVE_SX = {
  '& .MuiInputAdornment-positionStart': { color: '#1EAEFF' },
} as const;
// The paper's field-width collapse and 8px gap are media-gated (mobile), so a forced-
// mobile open tile re-zeros the min-width and re-applies the gap.
export const SEARCH_MOBILE_PAPER_SX = {
  '& .MuiAutocomplete-paper': { minWidth: 0, marginTop: '0.375rem' },
} as const;
export const SELECT_HOVER_SX = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D0D4D8' },
} as const;
export const UPLOAD_HOVER_SX = {
  '& .ui-file-upload-pill': { backgroundColor: '#00A3FF' },
  // Hover also darkens the field stroke grey400 -> grey300 (the theme's `:hover`
  // recipe), which a statically-forced tile must re-apply itself.
  '& .ui-file-upload-dropzone': { borderColor: '#969B9D' },
} as const;
// Forced chip-hover: a 1px brand-blue border + the × filled into a blue circle with
// a white glyph (Figma node 622:44563).
export const MS_CHIP_HOVER_SX = {
  '& .MuiChip-root': { borderColor: '#1EAEFF' },
  '& .ui-chip-x': { backgroundColor: '#1EAEFF', color: '#FFFFFF' },
} as const;
// Forced day-hover: the theme scopes the light-blue disc to `:hover`, so a static
// tile re-applies it to one day (the 5th, found by its accessible-name prefix).
export const CAL_HOVER_SX = {
  '& [aria-label^="5 "] .ui-day-circle': { backgroundColor: 'rgba(30, 174, 255, 0.1)' },
} as const;
// Forced page-cell hover: the theme scopes the light-blue fill to `:hover`, so a
// static tile re-applies the Figma hover recipe (Primary @10% fill, no border,
// Primary ink) to one rest cell (page 3), found by its accessible name.
export const PAGINATION_HOVER_SX = {
  '& [aria-label="Сторінка 3"]': {
    backgroundColor: 'rgba(30, 174, 255, 0.1)',
    borderColor: 'transparent',
    color: '#1EAEFF',
  },
} as const;
// Forced item-row hover recipes: the theme scopes each accent/shadow to `:hover`,
// so a static tile re-applies the Figma hover values through the row's own `sx`
// (which lands on the container and reaches the badge/path class hooks). Non-grey
// hover only darkens the accent border + badge ink and adds the row shadow; the
// path/description hold, so they are left untouched.
export const ROW_GET_HOVER_SX = {
  borderColor: '#0091E2',
  boxShadow: '0 4px 9px rgba(30, 185, 255, 0.18)',
  '& .ui-item-row__badge': { color: '#0091E2' },
} as const;
export const ROW_PUT_HOVER_SX = {
  borderColor: '#DD9F00',
  boxShadow: '0 4px 9px rgba(221, 168, 55, 0.18)',
  '& .ui-item-row__badge': { color: '#DD9F00' },
} as const;
export const ROW_POST_HOVER_SX = {
  borderColor: '#00AE70',
  boxShadow: '0 4px 9px rgba(75, 157, 71, 0.18)',
  '& .ui-item-row__badge': { color: '#00AE70' },
} as const;
export const ROW_DELETE_HOVER_SX = {
  borderColor: '#FF2F2F',
  boxShadow: '0 4px 9px rgba(199, 44, 44, 0.18)',
  '& .ui-item-row__badge': { color: '#FF2F2F' },
} as const;
// Grey hover keeps its brand-gray border but darkens the badge ink + path to
// #1C2022 and gains the grey row shadow (the description stays Font/400).
export const ROW_GREY_HOVER_SX = {
  boxShadow: '0 4px 9px rgba(106, 106, 106, 0.18)',
  '& .ui-item-row__badge': { color: '#1C2022' },
  '& .ui-item-row__path': { color: '#1C2022' },
} as const;
// The 480px mobile layout is viewport-media-gated, so a fixed-width tile re-applies
// it directly: no badge pill (transparent, no side padding), the Inter text column
// stacks, and the icons shrink to 20px. The mobile badge also swaps its box-shadow
// for a drop-shadow filter (box-shadow on a transparent box smudges behind the
// glyphs) — this tile forces the GET recipe shadow, so it re-applies that filter.
// The text column + icon group carry no class hook, so they are reached by their
// position (2nd/3rd span child of the container).
export const ROW_MOBILE_SX = {
  gap: '1rem',
  paddingLeft: '0.625rem',
  paddingRight: '1rem',
  '& .ui-item-row__badge': {
    backgroundColor: 'transparent',
    padding: '0.5rem 0',
    fontSize: '0.875rem',
    lineHeight: 'normal',
    boxShadow: 'none',
    filter: 'drop-shadow(0 8px 13.5px rgba(49, 59, 67, 0.14))',
  },
  '& .ui-item-row__path': {
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: '1.125rem',
  },
  '& .ui-item-row__description': {
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: '1.125rem',
  },
  '& > span:nth-of-type(2)': {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.125rem',
  },
  '& > span:nth-of-type(3)': { gap: '0.5rem' },
  '& svg': { width: '1.25rem', height: '1.25rem' },
} as const;

// ---- board layout -----------------------------------------------------------

export const pageSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3rem',
  padding: '2.5rem',
  [MOBILE_MAX]: { padding: '1rem', gap: '2rem' },
  backgroundColor: '#FBFBFB',
  fontFamily: 'Inter',
} as const;
export const groupTitleSx = {
  fontFamily: 'Inter',
  fontWeight: 600,
  fontSize: '1rem',
  color: '#1A1C1E',
  marginBottom: '1.25rem',
} as const;
export const rowSx = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2rem',
  alignItems: 'flex-start',
} as const;
export const itemBaseSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
} as const;
export const tallSx = { position: 'relative', minHeight: '340px' } as const;
export const stateLabelSx = {
  fontFamily: 'Inter',
  fontWeight: 600,
  fontSize: '0.6875rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#969B9D',
} as const;
