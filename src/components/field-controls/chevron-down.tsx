import React from 'react';

// Decorative inline chevron-down for the Autocomplete popup indicator (Figma
// "select с поиском" / "Multiselect" glyph). Shared by the search/select-style
// controls so the thin chevron is defined once. The repo has no
// `@mui/icons-material` dependency. Hidden from assistive tech (`aria-hidden` +
// `focusable="false"`); MUI's popup indicator button carries the accessible name.
// `stroke` uses `currentColor` so the theme tints it.
const CHEVRON_PATH: string = 'M5 8l5 5 5-5';

export function ChevronDownGlyph(): React.ReactElement {
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
        d={CHEVRON_PATH}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
