import React from 'react';

import { Glyph } from '../field-controls';

// The `copy-02` Figma export (rest 451:25829 / hover 451:25833 / active
// 451:25837 / disabled pixel-derived), byte-identical across all four state
// columns — only the stroke colour changes, which arrives through
// `currentColor` on the shared `Glyph` wrapper. This is Untitled-UI's copy
// icon, NOT any existing repo glyph — do not substitute a similar one.
//
// The `d` string is assembled from whitespace-split fragments joined with a
// single space (the `ui-action-icon-bar/icon-paths.ts` idiom), because SVG
// treats runs of whitespace as coordinate separators and the 100-column line
// limit cannot hold the path whole. Splitting only ever happens at an
// existing space, so the joined result is the original path.
export const COPY_ICON_PATH: string = [
  'M13.3333 6.66667V4.33333C13.3333 3.39991 13.3333 2.9332 13.1517 2.57668C12.9919 2.26308',
  '12.7369 2.00811 12.4233 1.84832C12.0668 1.66667 11.6001 1.66667 10.6667',
  '1.66667H4.33333C3.39991 1.66667 2.9332 1.66667 2.57668 1.84832C2.26308 2.00811 2.00811',
  '2.26308 1.84832 2.57668C1.66667 2.9332 1.66667 3.39991 1.66667 4.33333V10.6667C1.66667',
  '11.6001 1.66667 12.0668 1.84832 12.4233C2.00811 12.7369 2.26308 12.9919 2.57668',
  '13.1517C2.9332 13.3333 3.39991 13.3333 4.33333 13.3333H6.66667M9.33333',
  '18.3333H15.6667C16.6001 18.3333 17.0668 18.3333 17.4233 18.1517C17.7369 17.9919 17.9919',
  '17.7369 18.1517 17.4233C18.3333 17.0668 18.3333 16.6001 18.3333 15.6667V9.33333C18.3333',
  '8.39991 18.3333 7.9332 18.1517 7.57668C17.9919 7.26308 17.7369 7.00811 17.4233',
  '6.84832C17.0668 6.66667 16.6001 6.66667 15.6667 6.66667H9.33333C8.39991 6.66667 7.9332',
  '6.66667 7.57668 6.84832C7.26308 7.00811 7.00811 7.26308 6.84832 7.57668C6.66667 7.9332',
  '6.66667 8.39991 6.66667 9.33333V15.6667C6.66667 16.6001 6.66667 17.0668 6.84832',
  '17.4233C7.00811 17.7369 7.26308 17.9919 7.57668 18.1517C7.9332 18.3333 8.39991 18.3333',
  '9.33333 18.3333Z',
].join(' ');

export function CopyGlyph(): React.ReactElement {
  return (
    <Glyph path={COPY_ICON_PATH} viewBox="0 0 20 20" strokeWidth="1.667" width="20" height="20" />
  );
}
