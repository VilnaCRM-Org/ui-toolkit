import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { SKELETON_BORDER_COLOR } from '../ui-skeletons';

import type { SkeletonWidgetCard } from './types';

// Card chrome, measured live from Board D of Figma file
// `xZ7ccrH6d4QyqLQsayFSEX` (`538:38698`, `538:38709`, `632:46278`, `632:46447`).
// Only the surfaces the shapes sit ON carry hex values here — every grey shape
// fill is the static representation of the shimmer and renders through the
// primitives instead, exactly as `auth-skeleton` already does for its card.

/** Card shell: `#F9FAFC` fill, 1px brand-grey stroke, 12px radius, clipped. */
const CARD_BACKGROUND: string = '#F9FAFC';
const CARD_RADIUS: string = '12px';

/** Header band: white, 48px tall, divided from the body by the brand grey. */
const HEADER_BACKGROUND: string = '#FFFFFF';
const HEADER_HEIGHT: string = '48px';
/** 16px from the card's left edge; the dots glyph box ends 15px from the right. */
const HEADER_PADDING: string = '0 15px 0 16px';
/** 147x18 title bar — the `l` text primitive at its Board D width. */
export const TITLE_BAR_WIDTH: string = '147px';

// `dots-horizontal` (`538:38701`): three 4px discs on a 7px pitch, inked in the
// palette's grey300. It is the one live affordance the header keeps painted.
const HEADER_DOT_COLOR: string = '#969B9D';
export const HEADER_DOT_SIZE: string = '4px';
const HEADER_DOT_GAP: string = '3px';
export const HEADER_DOT_KEYS: string[] = ['dot-1', 'dot-2', 'dot-3'];

/**
 * Card shell. The footprint caps the designed width but still shrinks, and the
 * forced-colours border keeps the card outlined once the fill is dropped.
 */
export function getCardStyles(card: SkeletonWidgetCard): SystemStyleObject<Theme> {
  return {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden',
    width: '100%',
    maxWidth: `${card.width}px`,
    height: `${card.height}px`,
    border: `1px solid ${SKELETON_BORDER_COLOR}`,
    borderRadius: CARD_RADIUS,
    backgroundColor: CARD_BACKGROUND,
    '@media (forced-colors: active)': { border: '1px solid CanvasText' },
  };
}

export const widgetContentStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
};

export const headerStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  boxSizing: 'border-box',
  height: HEADER_HEIGHT,
  padding: HEADER_PADDING,
  backgroundColor: HEADER_BACKGROUND,
  borderBottom: `1px solid ${SKELETON_BORDER_COLOR}`,
};

export const titleBarStyles: SystemStyleObject<Theme> = { flexShrink: 0 };

export const headerDotsStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: HEADER_DOT_GAP,
};

export const headerDotStyles: SystemStyleObject<Theme> = {
  width: HEADER_DOT_SIZE,
  height: HEADER_DOT_SIZE,
  borderRadius: '50%',
  backgroundColor: HEADER_DOT_COLOR,
};
