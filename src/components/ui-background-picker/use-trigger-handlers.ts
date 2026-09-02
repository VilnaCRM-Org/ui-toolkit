import React from 'react';

import { handleTriggerClick } from './picker-actions';
import { handleTriggerKeyDown } from './picker-keyboard';
import type { PickerCtx } from './picker-refs';

/** The two handlers the wired trigger button is wired with. */
export interface TriggerActionHandlers {
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

// The `aria-disabled` boundary lands here: a disabled trigger records no open
// intent either, so a consumer that re-enables the picker with `open` already
// true still opens onto the default `first` row.
export function useTriggerActionHandlers(ctx: PickerCtx): TriggerActionHandlers {
  const onClick: TriggerActionHandlers['onClick'] = React.useCallback((): void => {
    if (!ctx.disabled) {
      handleTriggerClick(ctx);
    }
  }, [ctx]);
  const onKeyDown: TriggerActionHandlers['onKeyDown'] = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>): void => {
      if (!ctx.disabled) {
        handleTriggerKeyDown(ctx, event);
      }
    },
    [ctx]
  );
  return { onClick, onKeyDown };
}
