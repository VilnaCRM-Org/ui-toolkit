import React from 'react';

import { Glyph } from '../field-controls';

// The Untitled-UI check, at 1.6x the standard weight — Figma renders the stroke
// at 2.1333px inside a 16px frame, which normalises to `strokeWidth="3.2"` on the
// native 24 viewBox (2.13333 x 1.5). Do NOT "correct" it to 2 and do not reuse
// `ui-item-row`'s 1.667: the heavy stroke is the whole visual character here.
//
// The leaf points are (13.3333, 4) -> (6, 11.3333) -> (2.6667, 8) in the 16px
// frame, x1.5 into the 24 viewBox below. Keeping the FULL viewBox is what
// reproduces Figma's optical lift — the leaf centre sits at (13, 12.6667) in the
// 26px badge, ~0.33px above the true centre — automatically under a plain
// flex-centred 16px box. Cropping the viewBox to the leaf bbox loses it.
export const CHECK_PATH: string = 'M20 6L9 17L4 12';

/**
 * The badge's only content, and pure decoration: `Glyph` hides it from the
 * accessibility tree and strokes it in `currentColor`, so the badge root's own
 * `color` drives all four state colours with no per-state SVG and no asset
 * import. The badge root carries the accessible name.
 */
export function CheckGlyph(): React.ReactElement {
  return <Glyph path={CHECK_PATH} viewBox="0 0 24 24" strokeWidth="3.2" width="16" height="16" />;
}
