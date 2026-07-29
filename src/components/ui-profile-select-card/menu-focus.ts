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

export interface TriggerNodeAssignment {
  /** The consumer's ref, in either of React's two shapes. */
  forwarded: React.ForwardedRef<HTMLButtonElement>;
  /** The component's own handle, used by every focus move. */
  own: React.RefObject<HTMLButtonElement | null>;
  node: HTMLButtonElement | null;
}

/**
 * Threads the trigger node into the component's own ref AND the consumer's
 * forwarded ref, which lands on the button (never the wrapper) so a consumer can
 * return focus to the card after a dialog closes.
 */
export function assignTriggerNode(assignment: TriggerNodeAssignment): void {
  const { forwarded, own, node } = assignment;
  own.current = node;
  if (typeof forwarded === 'function') {
    forwarded(node);
    return;
  }
  if (forwarded != null) {
    forwarded.current = node;
  }
}
