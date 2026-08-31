import type React from 'react';

import { focusMenuEnd, moveMenuFocus, type MenuOpenIntent } from './menu-focus';

// The ONLY two keys the closed trigger handles itself (a11y contract §4.1):
// Enter and Space stay native, because the trigger is a real button and a manual
// handler would double-fire on Space.
const OPEN_INTENT_KEYS: Readonly<Record<string, MenuOpenIntent | undefined>> = {
  ArrowDown: 'first',
  ArrowUp: 'last',
};

// Row-relative moves inside the open menu; both wrap at the ends.
const MENU_MOVES: Readonly<Record<string, number | undefined>> = {
  ArrowDown: 1,
  ArrowUp: -1,
};

// Home/End jump to the ends. Reuses the open-intent vocabulary so both entry
// points resolve through one focus helper.
const MENU_EDGES: Readonly<Record<string, MenuOpenIntent | undefined>> = {
  Home: 'first',
  End: 'last',
};

/** The open intent an ArrowDown/ArrowUp on the closed trigger records, else null. */
export function openIntentForKey(key: string): MenuOpenIntent | null {
  return OPEN_INTENT_KEYS[key] ?? null;
}

function applyMenuEdgeKey(event: React.KeyboardEvent<HTMLElement>, menu: HTMLElement | null): void {
  const edge: MenuOpenIntent | undefined = MENU_EDGES[event.key];
  if (edge == null) {
    return;
  }
  event.preventDefault();
  focusMenuEnd(menu, edge);
}

/**
 * Arrow/Home/End navigation inside the open menu. Every handled key calls
 * `preventDefault()` so the page does not scroll under the popup; every other key
 * — including Enter and Space, which activate the row natively — falls through
 * untouched (a11y contract §4.3/§4.7).
 */
export function applyMenuNavigation(
  event: React.KeyboardEvent<HTMLElement>,
  menu: HTMLElement | null
): void {
  const delta: number | undefined = MENU_MOVES[event.key];
  if (delta == null) {
    applyMenuEdgeKey(event, menu);
    return;
  }
  event.preventDefault();
  moveMenuFocus(menu, delta);
}
