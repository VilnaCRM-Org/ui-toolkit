import React from 'react';

import { Glyph } from '../field-controls';

// The trigger's chevron. Reuses the shared `Glyph` wrapper (currentColor stroke,
// round caps/joins, aria-hidden) so the icon plumbing stays defined once, but
// supplies this control's own geometry: Figma draws it from a 24px box at a 2px
// stroke (node `439:19675`, a `chevron-left` instance rotated to point down —
// its export is `M15 18L9 12L15 6` at stroke-width 2, which is this path
// rotated). The shared `ChevronDownGlyph` is baked at a 20px box and 1.5px, so
// it rendered a 10x6 mark where Figma paints 12x6 — visibly smaller and thinner.
// Same reason `ui-pagination`, `ui-item-row` and `ui-profile-select-card` each
// carry their own chevron rather than the shared one.
const CHEVRON_PATH: string = 'M6 9L12 15L18 9';

export function TriggerChevronGlyph(): React.ReactElement {
  return <Glyph path={CHEVRON_PATH} viewBox="0 0 24 24" strokeWidth="2" width="24" height="24" />;
}
