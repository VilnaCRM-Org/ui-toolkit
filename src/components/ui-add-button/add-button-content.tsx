import { Box } from '@mui/material';
import React from 'react';

import { PlusGlyph } from './plus-glyph';
import {
  ADD_BUTTON_GLYPH_CLASS,
  ADD_BUTTON_LABEL_CLASS,
  addButtonGlyphSx,
  addButtonLabelSx,
} from './styles';

// The visible content shared by the wired (button) and static shells — ONE DOM
// tree, identical reading order: label first, then the decorative trailing
// plus (the Figma anatomy). The button's accessible name is the label alone;
// there is no `aria-label` anywhere in the tree.

export interface AddButtonContentProps {
  label: string;
}

export function AddButtonContent({ label }: Readonly<AddButtonContentProps>): React.ReactElement {
  return (
    <>
      <Box component="span" className={ADD_BUTTON_LABEL_CLASS} sx={addButtonLabelSx}>
        {label}
      </Box>
      <Box component="span" className={ADD_BUTTON_GLYPH_CLASS} sx={addButtonGlyphSx}>
        <PlusGlyph />
      </Box>
    </>
  );
}
