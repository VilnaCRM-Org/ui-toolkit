import React from 'react';

import { Glyph } from '../field-controls';

// The Untitled UI `bell-01` mark, identical in all four Figma states — only its
// stroke colour changes, and that arrives through `currentColor` from the badge
// root, so this glyph is stateless. The export's 1.66667 stroke is 2 × (20/24),
// i.e. a 24px/2px icon drawn at 20px, which is why the native 24 viewBox is kept
// and the rendered box is 20 (the `ui-item-row/item-icons.tsx` precedent). Split
// across lines only to respect max-len; the segments re-join on single spaces.
export const BELL_PATH: string = [
  'M9.3542 21.0001C10.0593 21.6224 10.9855 22 12 22C13.0144 22 13.9407',
  '21.6224 14.6458 21.0001M17.9999 8C17.9999 6.4087 17.3678 4.8826',
  '16.2427 3.7574C15.1174 2.6322 13.5913 2 12 2C10.4087 2 8.8826 2.6322',
  '7.7573 3.7574C6.6321 4.8826 6 6.4087 6 8C6 11.0902 5.2204 13.2059',
  '4.3496 14.6054C3.6151 15.7859 3.2478 16.3761 3.2613 16.5407C3.2762',
  '16.7231 3.3148 16.7926 3.4617 16.9016C3.5944 17 4.1926 17 5.3888',
  '17H18.6111C19.8074 17 20.4055 17 20.5382 16.9016C20.6851 16.7926',
  '20.7237 16.7231 20.7387 16.5407C20.7521 16.3761 20.3848 15.7859',
  '19.6503 14.6054C18.7795 13.2059 17.9999 11.0902 17.9999 8Z',
].join(' ');

/**
 * The bell, decorative in every state: the shared `Glyph` wrapper already sets
 * `aria-hidden` and `focusable="false"`, because the button around it carries the
 * whole accessible name (a11y contract §6, S7).
 */
export function BellGlyph(): React.ReactElement {
  return <Glyph path={BELL_PATH} viewBox="0 0 24 24" strokeWidth="1.667" width="20" height="20" />;
}
