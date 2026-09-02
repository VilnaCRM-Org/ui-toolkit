import { Box } from '@mui/material';
import React from 'react';

import { ChevronDownGlyph } from '../field-controls';

import { chevronWrapSx, triggerLabelSx } from './styles';

// The trigger's chevron: the SHARED field-controls glyph (never a redrawn
// path), centred inside a 24x24 footprint. It does not rotate open — the Figma
// open frame still points it down — and its ink is the constant grey300 in
// every state, so the wrapper carries no per-state colour logic.
function TriggerChevron(): React.ReactElement {
  return (
    <Box component="span" sx={chevronWrapSx}>
      <ChevronDownGlyph />
    </Box>
  );
}

export interface BackgroundPickerTriggerContentProps {
  label: string;
  disabled: boolean;
}

/**
 * The visible trigger content shared by the wired (button) and static shells —
 * ONE DOM tree, identical reading order. The label is a real text node, so the
 * trigger's accessible name is content-derived with no `aria-label` anywhere.
 */
export function BackgroundPickerTriggerContent({
  label,
  disabled,
}: Readonly<BackgroundPickerTriggerContentProps>): React.ReactElement {
  return (
    <>
      <Box component="span" sx={triggerLabelSx(disabled)}>
        {label}
      </Box>
      <TriggerChevron />
    </>
  );
}
