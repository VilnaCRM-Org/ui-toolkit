// Layout styling for UiSegmentedControl (Figma Board B period switcher, node
// 439:19374; rest 439:19868 / hover 439:19877 — the only two painted states).
// Each segment owns its own state chrome through the `[aria-checked]` /
// `[aria-disabled]` / `:hover` selectors below, so the STATIC (span) branch —
// which never carries those attributes — automatically paints the rest
// presentation.
import { alpha } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// The one raw-alpha literal in this module (00-shared.md recipe convention):
// Figma has no alpha token, only the solid `white` base. Node 439:19877's
// hovered (non-selected) segment fill.
const HOVER_FILL: string = alpha(palette.white.main, 0.52);

// The shared toolkit focus recipe (00-shared.md) — the ONLY non-Figma visual
// this module paints; the design has no focus master at all.
const FOCUS_RING: object = {
  '&:focus-visible': {
    outline: 'none',
    boxShadow: `inset 0 0 0 2px ${palette.darkPrimary.main}`,
  },
};

// 339x50 master: 4px padding on every side, no border, no shadow. Extraction
// arithmetic: 4 + 112 + 102 + 117 + 4 = 339 across, 42 + 4 + 4 = 50 down — so
// no explicit height is set here, it falls out of the segment height + this
// padding exactly.
export const TRACK_BASE: SxProps<Theme> = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'stretch',
  gap: 0,
  padding: '0.25rem',
  backgroundColor: palette.grey500.main,
  borderRadius: '0.5rem',
};

// Shared by both the wired `<button>` and the static `<span>`: Inter Medium
// 14/18, centred content. `flex: 1 1 auto` is the brief's own recipe — three
// fixed-width Figma labels (112/102/117px) emerge from content sizing plus an
// equal share of slack, rather than a hardcoded per-label width.
export const SEGMENT_BASE: SxProps<Theme> = {
  boxSizing: 'border-box',
  display: 'flex',
  flex: '1 1 auto',
  alignItems: 'center',
  justifyContent: 'center',
  height: '2.625rem',
  padding: '0.5rem 1rem',
  margin: 0,
  border: 'none',
  borderRadius: '0.5rem',
  backgroundColor: 'transparent',
  font: 'inherit',
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  color: palette.grey300.main,
  whiteSpace: 'nowrap',
};

// Button-only additions. Hover previews a segment WITHOUT moving selection
// (extraction "hover ≠ select"), so it is gated off both the checked and the
// disabled attribute; the checked rule is declared after it and the disabled
// rule after that, so ink resolves correctly on a segment that is both
// checked and disabled — no Figma master for that combination, so it is
// grey300 ink only (a deviation, recorded in the story/report). No shadow
// anywhere: the selected pill is flat (extraction "Shadow: none").
function interactiveSegmentSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&:hover:not([aria-checked="true"]):not([aria-disabled="true"])': {
      backgroundColor: HOVER_FILL,
      color: palette.darkPrimary.main,
    },
    '&[aria-checked="true"]': {
      backgroundColor: palette.white.main,
      color: palette.darkPrimary.main,
    },
    '&[aria-disabled="true"]': {
      cursor: 'default',
      color: palette.grey300.main,
    },
    ...FOCUS_RING,
  };
}

export interface SegmentStyleConfig {
  interactive: boolean;
}

/** One segment's `sx`: static layout, plus (button) state chrome. */
export function segmentSx(config: SegmentStyleConfig): SxProps<Theme> {
  return {
    ...SEGMENT_BASE,
    ...(config.interactive ? interactiveSegmentSx() : null),
  };
}

export interface TrackStyleConfig {
  sx: SxProps<Theme> | undefined;
}

/** The track root `sx`: static layout, consumer `sx` merged last. */
export function trackSx(config: TrackStyleConfig): SxProps<Theme> {
  const extra: SxProps<Theme> = config.sx ?? {};
  return [TRACK_BASE, ...(Array.isArray(extra) ? extra : [extra])];
}
