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

// The visible content shared by the wired (button) and static shells — ONE DOM
// tree, identical reading order. The chip's accessible name is built here and
// nowhere else: the two visible segments first, then the visually-hidden removal
// suffix, so the visible text is contained in the name and comes first
// (SC 2.5.3). There is no `aria-label` anywhere in the tree — it would overwrite
// exactly that visible text.

export interface FilterChipContentProps {
  label: string;
  filterValue: string;
  removeLabel: string;
}

export function FilterChipContent({
  label,
  filterValue,
  removeLabel,
}: Readonly<FilterChipContentProps>): React.ReactElement {
  return (
    <>
      <Box component="span" sx={chipLabelRowSx}>
        <Box component="span" className={CHIP_LABEL_CLASS} sx={chipLabelSx}>
          {label}
        </Box>
        <Box component="span" className={CHIP_VALUE_CLASS} sx={chipValueSx}>
          {filterValue}
        </Box>
      </Box>
      <Box component="span" sx={srOnlySx}>
        {removeLabel}
      </Box>
      {/* PAINT, never a control: the × duplicates the removal semantics the
          hidden suffix already carries, so it is aria-hidden and contributes
          nothing to the name. The static branch still renders it decoratively
          (the `UiItemRow` chevron precedent) so both trees stay identical. */}
      <Box component="span" className={CHIP_GLYPH_CLASS} sx={chipGlyphSx}>
        <ChipGlyph />
      </Box>
    </>
  );
}
