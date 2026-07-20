import React from 'react';

// Decorative folder glyph from the Figma file-upload trigger (node 449:25747,
// icon 251:8666), traced at its native 18.333x16.667 viewBox so the stroke
// weight matches the design exactly. Inline rather than an asset because the
// repo has no icon dependency and the other glyphs (ChevronDownGlyph) follow the
// same pattern. Hidden from assistive tech — the input it sits inside carries
// the accessible name. `stroke` uses `currentColor` so the pill's colour tints it.
const FOLDER_PATH: string =
  'M10 4.16685L9.07038 2.30761C8.80284 1.77252 8.66905 1.50495 8.46948 1.30948C8.29298 ' +
  '1.13662 8.08027 1.00516 7.84673 0.924604C7.58264 0.833513 7.28351 0.833513 6.68524 ' +
  '0.833513H3.5C2.56658 0.833513 2.09987 0.833513 1.74335 1.01517C1.42975 1.17496 ' +
  '1.17478 1.42993 1.01499 1.74353C0.833335 2.10005 0.833335 2.56676 0.833335 ' +
  '3.50018V4.16685M0.833335 4.16685H13.5C14.9001 4.16685 15.6002 4.16685 16.135 ' +
  '4.43933C16.6054 4.67901 16.9878 5.06146 17.2275 5.53187C17.5 6.06665 17.5 6.76671 ' +
  '17.5 8.16685V11.8335C17.5 13.2336 17.5 13.9337 17.2275 14.4685C16.9878 14.9389 ' +
  '16.6054 15.3213 16.135 15.561C15.6002 15.8335 14.9001 15.8335 13.5 15.8335H4.83333C3.4332 ' +
  '15.8335 2.73314 15.8335 2.19836 15.561C1.72795 15.3213 1.3455 14.9389 1.10582 ' +
  '14.4685C0.833335 13.9337 0.833335 13.2336 0.833335 11.8335V4.16685Z';

export function FolderGlyph(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 18.3333 16.6668"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={FOLDER_PATH}
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
