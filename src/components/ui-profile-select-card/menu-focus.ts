import type React from 'react';

/**
 * Which end of the menu a pending open should land on (a11y contract §4.1/§4.2):
 * `first` for Enter/Space/ArrowDown/pointer, `last` only for ArrowUp.
 */
export type MenuOpenIntent = 'first' | 'last';

// The menu contributes zero tab stops, so its items are found by role rather than
// by a roving `tabindex="0"` (a11y contract §4.3 forbids both roving tabindex and
// `aria-activedescendant`). They are direct children of the `role="menu"` element.
const MENU_ITEM_SELECTOR: string = '[role="menuitem"]';

function isActive(item: HTMLElement): boolean {
  return item === document.activeElement;
}

function menuItemsOf(menu: HTMLElement | null): HTMLElement[] {
  if (menu == null) {
    return [];
  }
  return Array.from(menu.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR));
}

// Arrow navigation wraps at BOTH ends (a11y contract §4.3), so the index is
// normalised into range rather than clamped; the double modulo keeps a negative
// index (ArrowUp from the first row) positive.
function wrapIndex(index: number, count: number): number {
  if (count === 0) {
    return 0;
  }
  return ((index % count) + count) % count;
}

function focusMenuItemAt(items: HTMLElement[], index: number): void {
  items[wrapIndex(index, items.length)]?.focus();
}

/** Focuses the first or last row — the open transition and Home/End both use it. */
export function focusMenuEnd(menu: HTMLElement | null, intent: MenuOpenIntent): void {
  const items: HTMLElement[] = menuItemsOf(menu);
  focusMenuItemAt(items, intent === 'last' ? items.length - 1 : 0);
}

/** Moves focus by `delta` rows, wrapping. `delta` is +1 (down) or -1 (up). */
export function moveMenuFocus(menu: HTMLElement | null, delta: number): void {
  const items: HTMLElement[] = menuItemsOf(menu);
  const current: number = items.findIndex(isActive);
  focusMenuItemAt(items, (current < 0 ? 0 : current) + delta);
}

/**
 * Whether an event target sits inside the widget. The outside-close listener MUST
 * exclude both the trigger and the menu (a11y contract §4.5): the wrapper contains
 * both, so a click on an open trigger never fires close-then-reopen.
 */
export function isInsideWidget(wrapper: HTMLElement | null, target: EventTarget | null): boolean {
  if (wrapper == null || !(target instanceof Node)) {
    return false;
  }
  return wrapper.contains(target);
}

/** The consumer's half of an attach or detach, without the component's own handle. */
export interface ForwardedRefAssignment {
  /** The consumer's ref, in either of React's two shapes. */
  forwarded: React.ForwardedRef<HTMLButtonElement>;
  node: HTMLButtonElement | null;
}

export interface TriggerNodeAssignment extends ForwardedRefAssignment {
  /** The component's own handle, used by every focus move. */
  own: React.RefObject<HTMLButtonElement | null>;
}

/** A React 19 ref-callback cleanup, or nothing when the consumer returned none. */
export type TriggerRefCleanup = (() => void) | undefined;

// The attach half, for either ref shape. A callback consumer may hand back a
// React 19 cleanup; anything else it returns is not one and is dropped.
function applyForwardedRef(assignment: ForwardedRefAssignment): TriggerRefCleanup {
  const { forwarded, node } = assignment;
  if (typeof forwarded === 'function') {
    const returned: unknown = forwarded(node);
    return typeof returned === 'function' ? (returned as () => void) : undefined;
  }
  if (forwarded != null) {
    forwarded.current = node;
  }
  return undefined;
}

// The detach half. A consumer that gave a cleanup gets exactly that and no
// `null` call; one that did not still gets the `null` call it expects.
function releaseForwardedRef(
  forwarded: React.ForwardedRef<HTMLButtonElement>,
  cleanup: TriggerRefCleanup
): void {
  if (cleanup !== undefined) {
    cleanup();
    return;
  }
  applyForwardedRef({ forwarded, node: null });
}

/**
 * Threads the trigger node into the component's own ref AND the consumer's
 * forwarded ref, which lands on the button (never the wrapper) so a consumer can
 * return focus to the card after a dialog closes.
 *
 * React 19 takes a ref callback's return value as that ref's unmount cleanup,
 * and it only ever sees the ONE callback this component installs — so a consumer
 * callback's own cleanup would be swallowed here. Returning a cleanup that runs
 * it (after clearing the component's own handle) is what keeps a forwarded ref
 * behaving exactly as it would on a plain `<button>`.
 */
export function assignTriggerNode(assignment: TriggerNodeAssignment): () => void {
  const { forwarded, own, node } = assignment;
  own.current = node;
  const cleanup: TriggerRefCleanup = applyForwardedRef({ forwarded, node });
  return (): void => {
    own.current = null;
    releaseForwardedRef(forwarded, cleanup);
  };
}
