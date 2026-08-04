import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

// Board D list rows, measured live from Figma file `xZ7ccrH6d4QyqLQsayFSEX`
// (`538:39708`, `538:39713`, `538:39719`). All three "variants" resolve to the
// same leaf shape — a 590x64 rounded rectangle, 8px radius, painted with the
// shared shimmer gradient and no inner anatomy — so the list repeats one row
// design rather than cycling three. They sit at y 1247 / 1317 / 1387: a 70px
// pitch over a 64px row, i.e. a 6px gap.
export const LIST_ROW_WIDTH: number = 590;
export const LIST_ROW_HEIGHT: string = '64px';
export const LIST_ROW_RADIUS: string = '8px';
export const LIST_ROW_GAP: string = '6px';
export const LIST_ROW_PITCH: number = 70;
export const DEFAULT_LIST_ROWS: number = 3;

export interface SkeletonListRow {
  key: string;
}

/** Stable keys for `rows` identical row placeholders (no design cycling). */
export function getListRowKeys(rows: number): SkeletonListRow[] {
  return Array.from({ length: rows }, (_unused, index) => ({ key: `row-${index + 1}` }));
}

// The rows fill their container and cap at the 590px board width, so the
// composition keeps the designed proportion yet still shrinks on narrow
// viewports. Consumers override both through `sx`.
export const listRootStyles: SystemStyleObject<Theme> = {
  width: '100%',
  maxWidth: `${LIST_ROW_WIDTH}px`,
};

export const listContentStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: LIST_ROW_GAP,
};
