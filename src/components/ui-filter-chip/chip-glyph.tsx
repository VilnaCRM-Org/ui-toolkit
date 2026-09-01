import React from 'react';

import { Glyph } from '../field-controls';

// The chip's remove ×, ported from the Figma export. All four state exports are
// the same path with a different stroke colour, which arrives through
// `currentColor` on the shared `Glyph` wrapper (round caps/joins, `fill: none`,
// `aria-hidden` + `focusable="false"`), so no SVG asset is committed.
//
// The exported 10-unit leaf maps 1 unit = 1px inside the 20px box, offset by
// +5px: 0.833333 → 5.83333 and 9.16667 → 14.16667, a 10x10 paint box running
// 5.0 → 15.0. This is deliberately NOT the stock Untitled-UI `x-close`
// (`M18 6L6 18M6 6L18 18`) — the arms are one 24-unit step shorter each side, so
// an existing 24px x-close asset must never be substituted for it.
export const X_CLOSE_PATH: string =
  'M14.16667 5.83333L5.83333 14.16667M5.83333 5.83333L14.16667 14.16667';

export function ChipGlyph(): React.ReactElement {
  return (
    <Glyph path={X_CLOSE_PATH} viewBox="0 0 20 20" strokeWidth="1.667" width="20" height="20" />
  );
}
