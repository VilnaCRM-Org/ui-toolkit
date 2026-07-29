import React from 'react';

import { activateMenuItem, handleMenuKeyDown } from './menu-actions';
import { markMenuFocusInside, type MenuFocusContext, type MenuFocusRefs } from './menu-refs';

/** The four handlers the `role="menu"` element and its rows are wired with. */
export interface MenuHandlers {
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Focus/blur ride on the container so the §4.6 rescue knows where focus was. */
  onFocus: () => void;
  onBlur: () => void;
  onActivate: (itemId: string) => void;
}

/**
 * Binds the menu's module-level actions to the current context. Memoised only so
 * the JSX attributes stay plain identifiers; the context itself is rebuilt every
 * render, because the open axis lives in the consumer.
 */
export function useMenuHandlers(ctx: MenuFocusContext): MenuHandlers {
  const refs: MenuFocusRefs = ctx.refs;
  const onKeyDown: MenuHandlers['onKeyDown'] = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => handleMenuKeyDown(ctx, event),
    [ctx]
  );
  const onFocus: MenuHandlers['onFocus'] = React.useCallback(
    (): void => markMenuFocusInside(refs, true),
    [refs]
  );
  const onBlur: MenuHandlers['onBlur'] = React.useCallback(
    (): void => markMenuFocusInside(refs, false),
    [refs]
  );
  const onActivate: MenuHandlers['onActivate'] = React.useCallback(
    (itemId: string): void => activateMenuItem(ctx, itemId),
    [ctx]
  );
  return { onKeyDown, onFocus, onBlur, onActivate };
}
