import React from 'react';

import { handleTriggerClick, handleTriggerKeyDown, handleWidgetFocusOut } from './menu-actions';
import type { MenuFocusContext } from './menu-refs';

/** The handlers the trigger button and the positioning wrapper are wired with. */
export interface TriggerHandlers {
  onClick: () => void;
  /** ArrowDown/ArrowUp (and Escape while open) only — Enter and Space stay native. */
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  /** On the WRAPPER: focus leaving the whole widget closes the menu (§4.5). */
  onWidgetBlur: (event: React.FocusEvent<HTMLDivElement>) => void;
}

/** Binds the trigger's module-level actions to the current context. */
export function useTriggerHandlers(ctx: MenuFocusContext): TriggerHandlers {
  const onClick: TriggerHandlers['onClick'] = React.useCallback(
    (): void => handleTriggerClick(ctx),
    [ctx]
  );
  const onKeyDown: TriggerHandlers['onKeyDown'] = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>): void => handleTriggerKeyDown(ctx, event),
    [ctx]
  );
  const onWidgetBlur: TriggerHandlers['onWidgetBlur'] = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>): void => handleWidgetFocusOut(ctx, event),
    [ctx]
  );
  return { onClick, onKeyDown, onWidgetBlur };
}
