import React from 'react';

// Decorative inline magnifier — the repo has no `@mui/icons-material` dependency.
// Hidden from assistive tech (`aria-hidden` + `focusable="false"` to kill the
// legacy phantom tab stop); the combobox carries the real accessible name, so
// the glyph is never announced or focusable and carries no `<title>`/`role="img"`.
// `stroke="currentColor"` lets the theme tint it (grey at rest, brand-blue on
// focus). Drawn as a thin *outline* magnifier — a lens circle plus a diagonal
// handle — to match the Figma "Magnifier / 24 / Outline" glyph (stroked, not a
// filled donut); `strokeWidth` stays 1.5 (non-text-contrast floor, WCAG 1.4.11).
const LENS_D: string = 'M9 3a6 6 0 100 12 6 6 0 000-12z';
const HANDLE_D: string = 'M17 17l-3.6-3.6';

export function SearchGlyph(): React.ReactElement {
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
        d={LENS_D}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={HANDLE_D} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
