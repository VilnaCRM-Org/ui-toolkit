import type React from 'react';

import { focusMenuEdge, moveMenuFocus } from './picker-dom';
import type { PickerCtx, PickerFocusIntent } from './picker-refs';

// The two arrow keys a CLOSED trigger handles: ArrowDown opens onto the first
// row, ArrowUp onto the last.
//
// A Map, not an object literal: an object literal is looked up through its
// prototype, so a key named `toString` or `constructor` would resolve to an
// inherited function and sail past the `== null` guard below as a valid
// intent. A Map only ever answers for keys actually put in it.
const OPEN_INTENT_KEYS: ReadonlyMap<string, PickerFocusIntent> = new Map<string, PickerFocusIntent>(
  [
    ['ArrowDown', 'first'],
    ['ArrowUp', 'last'],
  ]
);

/** The open intent an ArrowDown/ArrowUp on the closed trigger records, else null. */
export function openIntentForKey(key: string): PickerFocusIntent | null {
  return OPEN_INTENT_KEYS.get(key) ?? null;
}

function openFromKey(ctx: PickerCtx, event: React.KeyboardEvent<HTMLElement>): void {
  const intent: PickerFocusIntent | null = openIntentForKey(event.key);
  if (intent == null) {
    return;
  }
  event.preventDefault();
  ctx.refs.intent.set(intent);
  ctx.requestOpen(true);
}

/** Trigger keydown: records an open intent while closed, Escape only while open. */
export function handleTriggerKeyDown(
  ctx: PickerCtx,
  event: React.KeyboardEvent<HTMLElement>
): void {
  if (!ctx.open) {
    openFromKey(ctx, event);
    return;
  }
  if (event.key === 'Escape') {
    ctx.requestOpen(false);
  }
}

function closeToTrigger(ctx: PickerCtx): void {
  ctx.refs.trigger.current?.focus();
  ctx.requestOpen(false);
}

// Row-relative moves inside the open menu; both wrap at the ends. A Map for
// the same prototype-lookup reason as OPEN_INTENT_KEYS above.
const MENU_MOVES: ReadonlyMap<string, number> = new Map<string, number>([
  ['ArrowDown', 1],
  ['ArrowUp', -1],
]);

function applyMenuMove(event: React.KeyboardEvent<HTMLElement>, menu: HTMLElement | null): boolean {
  const delta: number | undefined = MENU_MOVES.get(event.key);
  if (delta == null) {
    return false;
  }
  event.preventDefault();
  moveMenuFocus(menu, delta);
  return true;
}

// Home/End jump to the ends, reusing the open-intent vocabulary. A Map, again
// so an inherited property name cannot read as an edge.
const MENU_EDGES: ReadonlyMap<string, PickerFocusIntent> = new Map<string, PickerFocusIntent>([
  ['Home', 'first'],
  ['End', 'last'],
]);

function applyMenuEdge(event: React.KeyboardEvent<HTMLElement>, menu: HTMLElement | null): void {
  const edge: PickerFocusIntent | undefined = MENU_EDGES.get(event.key);
  if (edge == null) {
    return;
  }
  event.preventDefault();
  focusMenuEdge(menu, edge);
}

/**
 * Menu keydown: Escape returns focus to the trigger then closes; ArrowUp/Down
 * move; Home/End jump. Enter/Space activate the row natively and are untouched.
 */
export function handleMenuKeyDown(ctx: PickerCtx, event: React.KeyboardEvent<HTMLElement>): void {
  if (event.key === 'Escape') {
    closeToTrigger(ctx);
    return;
  }
  const menu: HTMLElement | null = ctx.refs.menu.current;
  if (applyMenuMove(event, menu)) {
    return;
  }
  applyMenuEdge(event, menu);
}
