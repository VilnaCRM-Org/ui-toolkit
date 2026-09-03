import React from 'react';

import { Glyph } from '../field-controls';

// The chevron glyph (Figma node 451:25766 "chevron-left", 20x20 box, 1.66667px
// stroke). The layer name and the exported SVG both draw a left-pointing "<",
// but the on-canvas instance carries a horizontal flip the export lost — every
// rendered state points RIGHT. Pixel parity therefore follows the render, not
// the layer name (see extraction.md "Orientation mismatch"), which is why
// `direction` defaults to `'right'` in `types.ts`. These are the same two paths
// `PaginationChevron` (ui-pagination/page-chevron.tsx) builds, redeclared here
// because that component's internals are private to its own module.
const LEFT_PATH: string = 'M12.5 5L7.5 10L12.5 15';
const RIGHT_PATH: string = 'M7.5 5L12.5 10L7.5 15';

export interface ChevronGlyphProps {
  direction: 'left' | 'right';
}

export function ChevronGlyph({ direction }: Readonly<ChevronGlyphProps>): React.ReactElement {
  const path: string = direction === 'left' ? LEFT_PATH : RIGHT_PATH;
  return <Glyph path={path} viewBox="0 0 20 20" strokeWidth="1.67" />;
}
