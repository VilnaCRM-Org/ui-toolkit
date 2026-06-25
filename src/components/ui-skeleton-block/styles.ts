import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { baseSkeletonStyle } from '../ui-skeletons';

// Returns a plain style object (not `SxProps`) so it stays a valid element of a
// merged `sx` array in UiSkeletonBlock — `SxProps` can itself be an array and is
// rejected by MUI as an array element.
export default function getBlockSkeletonStyles(
  width: string | number,
  height: string | number,
  borderRadius: string | number
): SystemStyleObject<Theme> {
  return {
    ...baseSkeletonStyle,
    width,
    height,
    borderRadius,
  };
}
