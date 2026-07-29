import type React from 'react';

import { isInsideWidget, type MenuOpenIntent } from './menu-focus';
import { applyMenuNavigation, openIntentForKey } from './menu-keyboard';
import type { MenuFocusContext, MenuFocusRefs } from './menu-refs';

// Every close path that owns focus itself flags the rescue off first, so the
// §4.6 programmatic-close rescue only ever fires for a close the component did
// NOT initiate.
function focusTrigger(ctx: MenuFocusContext): void {
  const refs: MenuFocusRefs = ctx.refs;
  refs.skipRescue.current = true;
  refs.trigger.current?.focus();
}

// Escape: focus the trigger SYNCHRONOUSLY, then request the close (a11y contract
// §4.3) — the order matters, because the menu unmounts on the consumer's next
// render and focus must already be somewhere real by then.
function closeToTrigger(ctx: MenuFocusContext): void {
  focusTrigger(ctx);
  ctx.requestOpen(false);
}

// The close paths that must NOT touch focus: Tab (focus proceeds naturally out of
// the widget) and focus already leaving the widget. Both still suppress the §4.6
// rescue, or the vanishing menu would yank focus back to the trigger.
function closeWithoutFocus(ctx: MenuFocusContext): void {
  const refs: MenuFocusRefs = ctx.refs;
  refs.skipRescue.current = true;
  ctx.requestOpen(false);
}

/**
 * Pointer activation. A click on an OPEN trigger closes it and leaves focus where
 * it is — on the trigger (§4.5). The outside-pointerdown listener excludes the
 * whole widget, so this is the single close, never a close-then-reopen.
 */
export function handleTriggerClick(ctx: MenuFocusContext): void {
  if (ctx.open) {
    ctx.requestOpen(false);
    return;
  }
  const refs: MenuFocusRefs = ctx.refs;
  refs.intent.current = 'first';
  ctx.requestOpen(true);
}

// The two arrow keys a CLOSED trigger handles (§4.1): ArrowDown opens onto the
// first row, ArrowUp onto the last. Enter and Space are deliberately absent —
// the native button already fires a click, and a manual handler would double-fire.
function openFromKey(ctx: MenuFocusContext, event: React.KeyboardEvent<HTMLElement>): void {
  const intent: MenuOpenIntent | null = openIntentForKey(event.key);
  if (intent == null) {
    return;
  }
  const refs: MenuFocusRefs = ctx.refs;
  event.preventDefault();
  refs.intent.current = intent;
  ctx.requestOpen(true);
}

/**
 * Trigger keydown. While closed it only ever records an open intent; while open,
 * Escape is the single key it handles (§4.5) — everything else happens inside the
 * menu, which owns focus by then.
 */
export function handleTriggerKeyDown(
  ctx: MenuFocusContext,
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

/**
 * Menu keydown. Tab closes WITHOUT `preventDefault()` and without any focus call,
 * so focus proceeds naturally out of the widget and is never yanked back to the
 * trigger; Escape returns focus to the trigger first; the rest is navigation.
 */
export function handleMenuKeyDown(
  ctx: MenuFocusContext,
  event: React.KeyboardEvent<HTMLElement>
): void {
  if (event.key === 'Tab') {
    closeWithoutFocus(ctx);
    return;
  }
  if (event.key === 'Escape') {
    closeToTrigger(ctx);
    return;
  }
  applyMenuNavigation(event, ctx.refs.menu.current);
}

/**
 * Item activation, in the binding order of a11y contract §4.4: focus the trigger
 * synchronously, then report the action, then request the close.
 */
export function activateMenuItem(ctx: MenuFocusContext, itemId: string): void {
  focusTrigger(ctx);
  ctx.onSelect?.(itemId);
  ctx.requestOpen(false);
}

/**
 * Focus leaving the whole widget closes the menu with no focus call (§4.5). The
 * `open` guard keeps this from re-reporting a close that Tab already requested:
 * by the time the browser moves focus, the component has re-rendered closed.
 */
export function handleWidgetFocusOut(
  ctx: MenuFocusContext,
  event: React.FocusEvent<HTMLElement>
): void {
  if (!ctx.open || isInsideWidget(ctx.refs.wrapper.current, event.relatedTarget)) {
    return;
  }
  closeWithoutFocus(ctx);
}
