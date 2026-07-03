import React from 'react';

// Decorative inline magnifier — the repo has no `@mui/icons-material` dependency.
// Hidden from assistive tech (`aria-hidden` + `focusable="false"` to kill the
// legacy phantom tab stop); the combobox carries the real accessible name, so
// the glyph is never announced or focusable and carries no `<title>`/`role="img"`.
// `fill="currentColor"` lets the theme tint it (grey at rest, brand-blue on focus).
const SEARCH_PATH: string =
  'M9 3a6 6 0 104.472 10.03l3.249 3.248a.75.75 0 101.06-1.06l-3.248-3.249' +
  'A6 6 0 009 3zM4.5 9a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z';

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
      <path d={SEARCH_PATH} fill="currentColor" />
    </svg>
  );
}
