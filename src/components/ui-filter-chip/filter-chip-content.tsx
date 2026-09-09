import { Box } from '@mui/material';
import React from 'react';

import { srOnlySx } from '../field-controls';

import { ChipGlyph } from './chip-glyph';
import {
  CHIP_GLYPH_CLASS,
  CHIP_LABEL_CLASS,
  CHIP_VALUE_CLASS,
  chipGlyphSx,
  chipLabelRowSx,
  chipLabelSx,
  chipValueSx,
} from './styles';

// The visible content shared by the wired (button) and static shells. The chip's
// accessible name is built here and nowhere else: the two visible segments
// first, then the visually-hidden removal suffix, so the visible text is
// contained in the name and comes first (SC 2.5.3). There is no `aria-label`
// anywhere in the tree — it would overwrite exactly that visible text.
//
// `lang` marks the FILTER TEXT subtree, never the whole chip: the removal suffix
// is toolkit copy in the page language, so a chip whose value is Russian must
// not relabel a Ukrainian ", видалити фільтр" as Russian too (SC 3.1.2). A
// consumer overriding `removeLabel` supplies it in the page language.

export interface FilterChipContentProps {
  label: string;
  filterValue: string;
  lang: string | undefined;
  /**
   * The hidden action suffix — `null` on a static chip, which has no removal to
   * announce. Rendering it there would promise assistive tech an action the
   * chip cannot perform, which no reading-order symmetry justifies.
   */
  removeLabel: string | null;
}

export function FilterChipContent({
  label,
  filterValue,
  lang,
  removeLabel,
}: Readonly<FilterChipContentProps>): React.ReactElement {
  return (
    <>
      <Box component="span" lang={lang} sx={chipLabelRowSx}>
        <Box component="span" className={CHIP_LABEL_CLASS} sx={chipLabelSx}>
          {label}
        </Box>
        <Box component="span" className={CHIP_VALUE_CLASS} sx={chipValueSx}>
          {filterValue}
        </Box>
      </Box>
      {removeLabel == null ? null : (
        <Box component="span" sx={srOnlySx}>
          {removeLabel}
        </Box>
      )}
      {/* PAINT, never a control: the × duplicates the removal semantics the
          hidden suffix already carries, so it is aria-hidden and contributes
          nothing to the name. The static branch still renders it decoratively
          (the `UiItemRow` chevron precedent) so the two trees stay visually
          identical. */}
      <Box component="span" className={CHIP_GLYPH_CLASS} sx={chipGlyphSx}>
        <ChipGlyph />
      </Box>
    </>
  );
}
