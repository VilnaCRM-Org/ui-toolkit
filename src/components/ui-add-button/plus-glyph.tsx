import React from 'react';

import { Glyph } from '../field-controls';

// The trailing plus (Figma "plus" instance, node 451:25779 and its per-state
// siblings) — an 18px box at stroke 1.5, NOT the shared `Glyph` 20px/1.667
// default. Ink flows from `currentColor`, so the root's own state selectors
// tint it and no SVG asset is committed.
export const PLUS_PATH: string = 'M9 3.75V14.25M3.75 9H14.25';

export function PlusGlyph(): React.ReactElement {
  return <Glyph path={PLUS_PATH} viewBox="0 0 18 18" strokeWidth="1.5" width="18" height="18" />;
}
