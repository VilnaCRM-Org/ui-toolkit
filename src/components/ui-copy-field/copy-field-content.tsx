import { Box } from '@mui/material';
import React from 'react';

import { srOnlySx } from '../field-controls';

import { CopyGlyph } from './copy-glyph';
import {
  COPY_FIELD_GLYPH_CLASS,
  COPY_FIELD_VALUE_CLASS,
  copyFieldGlyphSx,
  copyFieldValueSx,
} from './styles';

// The visible content — ONE DOM tree. The chip's accessible name is built
// here and nowhere else: the visible code first, then the visually-hidden
// copy suffix, so the visible text is contained in the name and comes first
// (SC 2.5.3). There is no `aria-label` anywhere in the tree — it would
// overwrite exactly that visible text.

export interface CopyFieldContentProps {
  value: string;
  copyLabel: string;
}

export function CopyFieldContent({
  value,
  copyLabel,
}: Readonly<CopyFieldContentProps>): React.ReactElement {
  return (
    <>
      <Box component="span" className={COPY_FIELD_VALUE_CLASS} sx={copyFieldValueSx}>
        {value}
      </Box>
      <Box component="span" sx={srOnlySx}>
        {copyLabel}
      </Box>
      {/* PAINT, never a control: the glyph duplicates the copy semantics the
          hidden suffix already carries, so it is aria-hidden and contributes
          nothing to the name. */}
      <Box component="span" className={COPY_FIELD_GLYPH_CLASS} sx={copyFieldGlyphSx}>
        <CopyGlyph />
      </Box>
    </>
  );
}
