import React from 'react';

// The month previous/next chevrons, traced from the Figma glyph: a 6x10 FILLED
// arrow with rounded joins (fill #969B9D) — not a thin stroke, so the weight
// matches the design. The repo has no `@mui/icons-material` dependency, so the
// path is inlined. The enclosing `IconButton` carries the accessible name, so the
// glyph is hidden from assistive tech (`aria-hidden` + `focusable="false"`).
// `fill` uses `currentColor` so the theme tints it (grey300 at rest, grey400 when
// disabled). The 6x10 arrow is centred in a 16px box (the Figma icon frame) via the
// viewBox offset; the left chevron is the right one mirrored horizontally.
const CHEVRON_RIGHT_PATH: string =
  'M0.246315 9.07131C-0.0812683 8.74604 -0.082204 8.2165 0.244228 7.89007L3.47756 ' +
  '4.65674L0.244229 1.42341C-0.0822029 1.09698 -0.0812676 0.567439 0.246316 0.242163C0.572266 ' +
  '-0.0814923 1.09859 -0.0805625 1.4234 0.244242L5.83589 4.65674L1.42339 9.06924C1.09859 ' +
  '9.39404 0.572265 9.39497 0.246315 9.07131Z';

export interface ChevronGlyphProps {
  direction: 'left' | 'right';
}

export function ChevronGlyph({ direction }: Readonly<ChevronGlyphProps>): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="-5.12 -3.18 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d={CHEVRON_RIGHT_PATH} fill="currentColor" />
    </svg>
  );
}
