import React from 'react';

import { Glyph } from '../field-controls';

// The prev/next chevron. Reuses the shared `Glyph` wrapper (20x20 box,
// `currentColor` stroke, round caps/joins, aria-hidden) so the icon plumbing is
// defined once, but supplies its own left/right paths and the Figma 1.67px stroke
// weight — the shared `ChevronDownGlyph` is baked at 1.5px and points down, so it
// could not match the spec without a rotation transform. Each leaf is 5px wide x
// 10px tall, centred in the 20px box (Figma nodes 439:19467+).
const LEFT_PATH: string = 'M12.5 5L7.5 10L12.5 15';
const RIGHT_PATH: string = 'M7.5 5L12.5 10L7.5 15';

export interface PaginationChevronProps {
  direction: 'left' | 'right';
}

export function PaginationChevron({
  direction,
}: Readonly<PaginationChevronProps>): React.ReactElement {
  const path: string = direction === 'left' ? LEFT_PATH : RIGHT_PATH;
  return <Glyph path={path} viewBox="0 0 20 20" strokeWidth="1.67" />;
}
