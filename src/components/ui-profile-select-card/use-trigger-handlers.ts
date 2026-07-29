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

/**
 * Binds the trigger's module-level actions to the current context, whose identity
 * is memoised upstream (`useMenuRuntime`) so these callbacks are stable across a
 * re-render that changes nothing they depend on (Amendment A2).
 *
 * The §6.1 `aria-disabled` boundary lands here for the two trigger paths, so a
 * disabled trigger is a no-op end to end: no `preventDefault()` on an arrow key
 * and — the part `useOpenRequest`'s gate cannot reach — no recorded open intent.
 * Gating only the request left the intent ref set, and a consumer that re-enabled
 * the card with `open` already true then opened onto that stale end, although
 * §4.2 defines an intent-less open as `first` (Amendment A2). The focus-out close
 * is deliberately NOT gated: it cannot fire on a card whose menu §6.3 keeps shut.
 */
export function useTriggerHandlers(ctx: MenuFocusContext): TriggerHandlers {
  const onClick: TriggerHandlers['onClick'] = React.useCallback((): void => {
    if (!ctx.disabled) {
      handleTriggerClick(ctx);
    }
  }, [ctx]);
  const onKeyDown: TriggerHandlers['onKeyDown'] = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>): void => {
      if (!ctx.disabled) {
        handleTriggerKeyDown(ctx, event);
      }
    },
    [ctx]
  );
  const onWidgetBlur: TriggerHandlers['onWidgetBlur'] = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>): void => handleWidgetFocusOut(ctx, event),
    [ctx]
  );
  return { onClick, onKeyDown, onWidgetBlur };
}
