import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import colorTheme from '../ui-color-theme';
import { SKELETON_BORDER_COLOR } from '../ui-skeletons';

// Board D menu, measured live from Figma file `xZ7ccrH6d4QyqLQsayFSEX` node
// `538:39489`: a 238x791 white card with a 12px radius and a 1px `#E1E7EA`
// stroke. Inside it, six 238x54 nav rows sit at y 21 / 75 / 129 / 183 / 237 and
// (after the divider) 719, one 238x192 expanded section at y 291, and a
// full-width rule at y 692.5. Every row repeats the same anatomy: a 24px circle
// whose box starts at x 22 and a 147x18 title bar at x 56, both centred on the
// row. The circle is a flat `#E5E9ED` and the bars carry the shimmer gradient,
// so all of them are shared-primitive shapes, not literal colours.
export const MENU_WIDTH: number = 238;
export const MENU_HEIGHT: number = 791;
export const MENU_BORDER_WIDTH: number = 1;
export const MENU_RADIUS: string = '12px';
export const MENU_PADDING_TOP: number = 21;
export const MENU_PADDING_BOTTOM: number = 18;

export const NAV_ROW_HEIGHT: number = 54;
/** Nav rows drawn above the expanded section; the section and the footer add one each. */
export const NAV_ROW_COUNT: number = 5;
export const ICON_SIZE: number = 24;
export const ICON_INSET: number = 22;
export const TITLE_INSET: number = 56;
export const TITLE_WIDTH: number = 147;
export const ICON_TITLE_GAP: number = TITLE_INSET - ICON_INSET - ICON_SIZE;

// Expanded section `538:39516`: its header row is the plain nav row nudged 2px
// down (title at y 20, circle box at y 17 inside the section), and the three
// 115x14 sub-rows start at x 61 / y 59 on a 26px pitch.
export const SECTION_HEIGHT: number = 192;
export const SECTION_TOP_OFFSET: number = 2;
export const SUB_ROW_COUNT: number = 3;
export const SUB_ROW_WIDTH: number = 115;
export const SUB_ROW_HEIGHT: number = 14;
export const SUB_ROW_INSET: number = 61;
export const SUB_ROW_PITCH: number = 26;
export const SUB_ROW_GAP: number = SUB_ROW_PITCH - SUB_ROW_HEIGHT;
/** Gap between the section header row (ends at y 56) and the first sub-row (y 59). */
export const SUB_LIST_OFFSET: number = 3;
/** Divider bottom (y 693) to the top of the trailing row (y 719). */
export const DIVIDER_GAP: number = 26;

// Figma draws the card stroke INSIDE the 238x791 box, so every measured inset is
// quoted from the outer edge. CSS lays content out past the border instead, so
// the border width comes off each inset to land the shapes on the same pixel.
function insideStroke(inset: number): string {
  return `${inset - MENU_BORDER_WIDTH}px`;
}

export interface SkeletonMenuRow {
  key: string;
}

/** Stable keys for a repeated menu shape (`prefix-1`, `prefix-2`, ...). */
export function getMenuRowKeys(prefix: string, count: number): SkeletonMenuRow[] {
  return Array.from({ length: count }, (_unused, index) => ({ key: `${prefix}-${index + 1}` }));
}

export const menuRootStyles: SystemStyleObject<Theme> = {
  boxSizing: 'border-box',
  width: `${MENU_WIDTH}px`,
  height: `${MENU_HEIGHT}px`,
  backgroundColor: colorTheme.palette.white.main,
  border: `${MENU_BORDER_WIDTH}px solid ${SKELETON_BORDER_COLOR}`,
  borderRadius: MENU_RADIUS,
};

export const menuContentStyles: SystemStyleObject<Theme> = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  paddingTop: insideStroke(MENU_PADDING_TOP),
  paddingBottom: insideStroke(MENU_PADDING_BOTTOM),
};

export const navRowStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: `${ICON_TITLE_GAP}px`,
  height: `${NAV_ROW_HEIGHT}px`,
  paddingLeft: insideStroke(ICON_INSET),
};

export const sectionStyles: SystemStyleObject<Theme> = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  height: `${SECTION_HEIGHT}px`,
  paddingTop: `${SECTION_TOP_OFFSET}px`,
};

export const subListStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: `${SUB_ROW_GAP}px`,
  marginTop: `${SUB_LIST_OFFSET}px`,
  paddingLeft: insideStroke(SUB_ROW_INSET),
};

// `marginTop: auto` bottom-anchors the divider and the trailing row, which is
// what the 209px of empty canvas between the section and the rule encodes. The
// rule is a border rather than a background so Contrast Themes repaint it as
// CanvasText instead of dropping it with the rest of the fills.
export const dividerStyles: SystemStyleObject<Theme> = {
  marginTop: 'auto',
  height: 0,
  borderTop: `${MENU_BORDER_WIDTH}px solid ${SKELETON_BORDER_COLOR}`,
  marginBottom: `${DIVIDER_GAP}px`,
};
