import type React from 'react';

import { isInsideWidget, type MenuOpenIntent } from './menu-focus';
import { applyMenuNavigation, openIntentForKey } from './menu-keyboard';
import { beginInteraction, type MenuFocusContext, type MenuFocusRefs } from './menu-refs';

// Escape: flag the rescue off, focus the trigger SYNCHRONOUSLY, then request
// the close (a11y contract §4.3) — the order matters, because the menu unmounts
// on the consumer's next render and focus must already be somewhere real by
// then. Every close path that already put focus somewhere real sets the flag
// the same way, so the §4.6 rescue only ever fires for a close that would
// otherwise leave focus stranded on `<body>`; Tab is NOT one of those paths
// (Amendment A1) — it makes no focus call and deliberately leaves the rescue
// armed. The flag is interaction-scoped (Amendment A2), so a consumer that
// declines the close it accompanies cannot suppress a later, unrelated rescue.
function closeToTrigger(ctx: MenuFocusContext): void {
  const refs: MenuFocusRefs = ctx.refs;
  refs.skipRescue.set(true);
  refs.trigger.current?.focus();
  ctx.requestOpen(false);
}

// Focus already leaving the widget: close with no focus call, and suppress the
// §4.6 rescue — focus has a real destination of its own by then, so pulling it
// back to the trigger would fight the user's own move.
function closeWithoutFocus(ctx: MenuFocusContext): void {
  const refs: MenuFocusRefs = ctx.refs;
  refs.skipRescue.set(true);
  ctx.requestOpen(false);
}

// The two halves of every open path, in order: record which end focus should
// land on (§4.2), then ask the consumer to open. The intent is
// interaction-scoped (Amendment A2) — a consumer that declines or defers the
// open leaves nothing behind, and the eventual open takes §4.2's `first`.
function openWithIntent(ctx: MenuFocusContext, intent: MenuOpenIntent): void {
  const refs: MenuFocusRefs = ctx.refs;
  refs.intent.set(intent);
  ctx.requestOpen(true);
}

/**
 * Pointer activation. A click on an OPEN trigger closes it and leaves focus where
 * it is — on the trigger (§4.5). The outside-pointerdown listener excludes the
 * whole widget, so this is the single close, never a close-then-reopen.
 *
 * Never reached while disabled — `useTriggerHandlers` owns that boundary (§6.1).
 */
export function handleTriggerClick(ctx: MenuFocusContext): void {
  beginInteraction(ctx.refs);
  if (ctx.open) {
    ctx.requestOpen(false);
    return;
  }
  openWithIntent(ctx, 'first');
}

// The two arrow keys a CLOSED trigger handles (§4.1): ArrowDown opens onto the
// first row, ArrowUp onto the last. Enter and Space are deliberately absent —
// the native button already fires a click, and a manual handler would double-fire.
function openFromKey(ctx: MenuFocusContext, event: React.KeyboardEvent<HTMLElement>): void {
  const intent: MenuOpenIntent | null = openIntentForKey(event.key);
  if (intent == null) {
    return;
  }
  event.preventDefault();
  openWithIntent(ctx, intent);
}

/**
 * Trigger keydown. While closed it only ever records an open intent; while open,
 * Escape is the single key it handles (§4.5) — everything else happens inside the
 * menu, which owns focus by then.
 *
 * Never reached while disabled — `useTriggerHandlers` owns that boundary (§6.1).
 */
export function handleTriggerKeyDown(
  ctx: MenuFocusContext,
  event: React.KeyboardEvent<HTMLElement>
): void {
  beginInteraction(ctx.refs);
  if (!ctx.open) {
    openFromKey(ctx, event);
    return;
  }
  if (event.key === 'Escape') {
    ctx.requestOpen(false);
  }
}

/**
 * Menu keydown. Tab closes WITHOUT `preventDefault()` and without any DIRECT
 * focus call, so focus proceeds naturally out of the widget; Escape returns focus
 * to the trigger first; the rest is navigation.
 */
// The two closing keys. Tab is a PLAIN close request with the §4.6 rescue left
// ARMED (Amendment A1): a consumer that lowers `open` synchronously unmounts
// the focused row before the browser performs the move, and the rescue is what
// keeps sequential navigation a live starting point instead of `<body>`.
function closeFromMenuKey(ctx: MenuFocusContext, key: string): boolean {
  if (key === 'Tab') {
    ctx.requestOpen(false);
    return true;
  }
  if (key === 'Escape') {
    closeToTrigger(ctx);
    return true;
  }
  return false;
}

export function handleMenuKeyDown(
  ctx: MenuFocusContext,
  event: React.KeyboardEvent<HTMLElement>
): void {
  beginInteraction(ctx.refs);
  if (closeFromMenuKey(ctx, event.key)) {
    return;
  }
  applyMenuNavigation(event, ctx.refs.menu.current);
}

/**
 * Item activation, in the binding order of a11y contract §4.4: focus the trigger
 * synchronously, then report the action, then request the close.
 */
export function activateMenuItem(ctx: MenuFocusContext, itemId: string): void {
  const refs: MenuFocusRefs = ctx.refs;
  beginInteraction(refs);
  refs.skipRescue.set(true);
  refs.trigger.current?.focus();
  ctx.onSelect?.(itemId);
  ctx.requestOpen(false);
}

/**
 * Focus leaving the whole widget closes the menu with no focus call (§4.5). The
 * `open` guard keeps this from re-reporting a close that Tab already requested
 * when the consumer HONOURS it: by the time the browser moves focus, the
 * component has re-rendered closed. A consumer that declines it is covered by
 * the interaction-scoped close gate instead (Amendment A2).
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
