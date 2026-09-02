import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import type { SkeletonControlVariant } from './types';

// Board D `538:39802` (checkbox + text) and `538:39808` (radio + text), measured
// live from Figma file `xZ7ccrH6d4QyqLQsayFSEX`: a 179x24 row laid out as a
// centred flex line with an 8px gap — a 24x24 control placeholder followed by a
// 147x18 text bar on the shared 57px pill radius. The control radius is the only
// difference between the two nodes: 8px versus 44px on a 24px box, which is a
// full circle, so it is expressed as 50%.
export const CONTROL_SIZE: string = '24px';
export const CONTROL_TEXT_GAP: string = '8px';
export const CONTROL_TEXT_BAR_WIDTH: string = '147px';
export const CHECKBOX_CONTROL_RADIUS: string = '8px';
export const RADIO_CONTROL_RADIUS: string = '50%';
export const DEFAULT_CONTROL: SkeletonControlVariant = 'checkbox';

const controlRadii: Record<SkeletonControlVariant, string> = {
  checkbox: CHECKBOX_CONTROL_RADIUS,
  radio: RADIO_CONTROL_RADIUS,
};

export function getControlRadius(control: SkeletonControlVariant): string {
  return controlRadii[control];
}

export const controlTextContentStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: CONTROL_TEXT_GAP,
};

// Both Figma shapes are `shrink-0`: the row keeps its 24px control and 147px
// bar even when the host container is narrower than the 179px design width.
export const controlShapeStyles: SystemStyleObject<Theme> = {
  flexShrink: 0,
};
