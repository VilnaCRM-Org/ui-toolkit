import React from 'react';

// Decorative inline chevrons for the month previous/next buttons. The repo has
// no `@mui/icons-material` dependency. A single direction-parameterised glyph
// keeps the SVG in one place; the enclosing `IconButton` carries the accessible
// name, so the glyph is hidden from assistive tech (`aria-hidden` +
// `focusable="false"`). `stroke` uses `currentColor` so the theme tints it.
const CHEVRON_PATHS: Record<'left' | 'right', string> = {
  left: 'M12.5 5L7.5 10l5 5',
  right: 'M7.5 5l5 5-5 5',
};

export interface ChevronGlyphProps {
  direction: 'left' | 'right';
}

export function ChevronGlyph({ direction }: Readonly<ChevronGlyphProps>): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={CHEVRON_PATHS[direction]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
