import { Box } from '@mui/material';
import React from 'react';

import { BackgroundPickerTriggerContent } from './background-picker-content';
import type { UiBackgroundPickerProps } from './types';
import { DEFAULT_TRIGGER_LABEL, type BackgroundPickerModel } from './use-background-picker';
import type { TriggerActionHandlers } from './use-trigger-handlers';

export interface BackgroundPickerTriggerProps {
  picker: UiBackgroundPickerProps;
  model: BackgroundPickerModel;
  handlers: TriggerActionHandlers;
}

// The wired trigger is ONE native `<button type="button">` (the type is
// mandatory — an untyped button submits an enclosing form) carrying the APG
// menu-button wiring: `aria-haspopup="menu"` and a permanent `aria-expanded`,
// with `aria-controls` only while the menu is mounted, so a closed picker
// leaves no dangling idref. A disabled picker keeps the `aria-disabled`
// boundary — still a real, focusable button whose open paths no-op.
function WiredTrigger({
  picker,
  model,
  handlers,
}: Readonly<BackgroundPickerTriggerProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={model.triggerId}
      aria-haspopup="menu"
      aria-expanded={model.ariaExpanded}
      aria-controls={model.ariaControls}
      aria-disabled={model.ariaDisabled}
      onClick={handlers.onClick}
      onKeyDown={handlers.onKeyDown}
      ref={model.setTriggerRef}
      sx={model.triggerSx}
    >
      <BackgroundPickerTriggerContent
        label={picker.label ?? DEFAULT_TRIGGER_LABEL}
        disabled={model.disabled}
      />
    </Box>
  );
}

export interface StaticTriggerProps {
  picker: UiBackgroundPickerProps;
  model: BackgroundPickerModel;
}

// The unwired card: static, non-interactive content — no button role, no
// tabindex, and no ARIA of any kind, not even `aria-disabled`. The disabled
// paint still applies (it is driven by `model.disabled`, not a selector), and
// the content tree is identical to the wired branch.
function StaticTrigger({ picker, model }: Readonly<StaticTriggerProps>): React.ReactElement {
  return (
    <Box component="div" id={picker.id} sx={model.triggerSx}>
      <BackgroundPickerTriggerContent
        label={picker.label ?? DEFAULT_TRIGGER_LABEL}
        disabled={model.disabled}
      />
    </Box>
  );
}

/** Picks the wired or static shell; both paint the identical closed trigger. */
export function BackgroundPickerTrigger(
  props: Readonly<BackgroundPickerTriggerProps>
): React.ReactElement {
  const { picker, model, handlers } = props;
  if (model.interactive) {
    return <WiredTrigger picker={picker} model={model} handlers={handlers} />;
  }
  return <StaticTrigger picker={picker} model={model} />;
}
