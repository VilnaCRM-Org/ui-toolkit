import React from 'react';

import colorTheme from '@/components/ui-color-theme';

import { Glyph } from '../field-controls';

// The row's expand chevron. It reuses the shared `Glyph` wrapper (currentColor
// stroke, round caps/joins, aria-hidden + focusable="false") but supplies its own
// down-pointing path baked at the Figma 1.667px stroke weight — the shared
// `ChevronDownGlyph` is 1.5px, so it could not match the export weight. It always
// points DOWN; the expanded "up" state is a CSS `rotate(180deg)` on its wrapper,
// so the flip is purely visual and never touches the accessibility tree.
const CHEVRON_DOWN_PATH: string = 'M5 7.5 10 12.5 15 7.5';

export function ItemChevronGlyph(): React.ReactElement {
  return (
    <Glyph
      path={CHEVRON_DOWN_PATH}
      viewBox="0 0 20 20"
      strokeWidth="1.667"
      width="24"
      height="24"
    />
  );
}

// The open-padlock auth indicator, ported from the Figma export (the ONLY lock
// glyph in the whole file — the open one, identical on all 33 uses). It is a
// FILL icon (Font/250 #57595B), so it does not use the stroke-based `Glyph`.
//
// Decorative for Story 3.1 (a11y contract §5.2): because every row shows the same
// open padlock, it carries zero discriminating information, so it is aria-hidden
// and contributes nothing to the row's accessible name. A future *locked* variant
// would make it informational and would then require a text channel in the name.
const PADLOCK_PATH: string = [
  'M14.1673 7.50004H7.50065V5.83337',
  'C7.49944 5.33853 7.6451 4.85445 7.9192 4.44246',
  'C8.1933 4.03046 8.5835 3.70907 9.04039 3.519',
  'C9.49727 3.32893 10.0003 3.27872 10.4857 3.37474',
  'C10.9712 3.47076 11.4172 3.70868 11.7673 4.05837',
  'C12.0806 4.37843 12.3047 4.77489 12.4173 5.20837',
  'C12.4447 5.31452 12.4927 5.41424 12.5586 5.50185',
  'C12.6245 5.58945 12.707 5.66321 12.8014 5.71893',
  'C12.8958 5.77464 13.0002 5.81122 13.1088 5.82656',
  'C13.2173 5.84191 13.3278 5.83573 13.434 5.80837',
  'C13.5401 5.78101 13.6399 5.73301 13.7275 5.66711',
  'C13.8151 5.60121 13.8888 5.51871 13.9445 5.4243',
  'C14.0003 5.32989 14.0368 5.22544 14.0522 5.1169',
  'C14.0675 5.00835 14.0613 4.89785 14.034 4.7917',
  'C13.8441 4.0707 13.4676 3.41248 12.9423 2.88337',
  'C12.3591 2.30201 11.6168 1.90648 10.8089 1.74674',
  'C10.0011 1.58699 9.1641 1.67019 8.40353 1.98583',
  'C7.64297 2.30147 6.99299 2.83539 6.53566 3.52018',
  'C6.07833 4.20497 5.83416 5.00991 5.83398 5.83337V7.50004',
  'C5.17094 7.50004 4.53506 7.76343 4.06622 8.23227',
  'C3.59738 8.70111 3.33398 9.33699 3.33398 10V15.8334',
  'C3.33398 16.4964 3.59738 17.1323 4.06622 17.6011',
  'C4.53506 18.07 5.17094 18.3334 5.83398 18.3334H14.1673',
  'C14.8304 18.3334 15.4662 18.07 15.9351 17.6011',
  'C16.4039 17.1323 16.6673 16.4964 16.6673 15.8334V10',
  'C16.6673 9.33699 16.4039 8.70111 15.9351 8.23227',
  'C15.4662 7.76343 14.8304 7.50004 14.1673 7.50004ZM15.0007 15.8334',
  'C15.0007 16.0544 14.9129 16.2663 14.7566 16.4226',
  'C14.6003 16.5789 14.3883 16.6667 14.1673 16.6667H5.83398',
  'C5.61297 16.6667 5.40101 16.5789 5.24473 16.4226',
  'C5.08845 16.2663 5.00065 16.0544 5.00065 15.8334V10',
  'C5.00065 9.77902 5.08845 9.56706 5.24473 9.41078',
  'C5.40101 9.2545 5.61297 9.1667 5.83398 9.1667H14.1673',
  'C14.3883 9.1667 14.6003 9.2545 14.7566 9.41078',
  'C14.9129 9.56706 15.0007 9.77902 15.0007 10V15.8334Z',
].join('');

export function ItemPadlockGlyph(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="24"
      height="24"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={PADLOCK_PATH} fill={colorTheme.palette.grey250.main} />
    </svg>
  );
}
