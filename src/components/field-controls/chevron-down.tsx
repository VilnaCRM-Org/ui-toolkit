import React from 'react';

import { Glyph } from './glyph';

// Decorative chevron-down for the Autocomplete popup indicator (Figma
// "select с поиском" / "Multiselect" glyph). Shared by the search/select-style
// controls so the thin chevron is defined once; the wrapper it renders into
// (`Glyph`) owns the sizing, `currentColor` stroke and aria-hiding.
const CHEVRON_PATH: string = 'M5 8l5 5 5-5';

export function ChevronDownGlyph(): React.ReactElement {
  return <Glyph path={CHEVRON_PATH} viewBox="0 0 20 20" strokeWidth="1.5" />;
}
