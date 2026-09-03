import React from 'react';

import { Glyph } from '../field-controls';

// The leading ×, ported from the Figma export (Board A, node children …794 /
// …798 / …802 / …806). This is a THIRD distinct x-glyph in the repo — it must
// never be substituted for `ui-filter-chip`'s `ChipGlyph` (20px box, 1.667
// stroke) or `ui-action-icon-bar`'s `x-close` (24px box, 2 stroke): all three
// differ in viewBox, box size, path coordinates AND stroke width.
export const CLOSE_PATH: string = 'M12.75 5.25L5.25 12.75M5.25 5.25L12.75 12.75';

export function ClearGlyph(): React.ReactElement {
  return <Glyph path={CLOSE_PATH} viewBox="0 0 18 18" strokeWidth="1.5" width="18" height="18" />;
}
