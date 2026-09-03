import { Box } from '@mui/material';
import React from 'react';

import { chevronWrapSx, triggerLabelSx } from './styles';
import { TriggerChevronGlyph } from './trigger-chevron';

// The trigger's chevron, centred inside its 24x24 footprint. It does not rotate
// open — the Figma open frame still points it down — and its ink is the constant
// grey300 in every state, so the wrapper carries no per-state colour logic.
// The glyph is drawn from THIS control's Figma export rather than the shared
// `ChevronDownGlyph`; see `trigger-chevron.tsx` for why the shared one could not
// match the weight.
function TriggerChevron(): React.ReactElement {
  return (
    <Box component="span" sx={chevronWrapSx}>
      <TriggerChevronGlyph />
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
