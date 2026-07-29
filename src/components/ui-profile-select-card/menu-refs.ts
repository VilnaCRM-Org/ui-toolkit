import React from 'react';

import type { MenuOpenIntent } from './menu-focus';
import { createTaskScopedRef, type TaskScopedRef } from './task-scoped-ref';

/**
 * The mutable handles the trigger, the menu and the focus effects share. They are
 * refs rather than state because none of them may schedule a render: the open axis
 * belongs entirely to the consumer (a11y contract §3.1/§4).
 *
 * Three of them are INTERACTION-scoped rather than plain refs (Amendment A2):
 * everything a trigger or close path records is only ever a REQUEST, and a
 * consumer is free to decline it. A `TaskScopedRef` stays readable for the rest
 * of the gesture that set it — the second path of a click or a Tab, and the
 * commit a synchronous consumer makes inside it — and is empty by the next
 * gesture, so a declined request can never steer a later one.
 */
export interface MenuFocusRefs {
  /** The positioning wrapper — the outside-pointerdown exclusion zone (§4.5). */
  wrapper: React.RefObject<HTMLDivElement | null>;
  /** The trigger button — every focus return lands here (§4.4/§4.5/§4.6). */
  trigger: React.RefObject<HTMLButtonElement | null>;
  /** The `role="menu"` element, or null while the menu is unmounted. */
  menu: React.RefObject<HTMLDivElement | null>;
  /**
   * Which end the pending open should focus (§4.2), consumed by the open-focus
   * effect. Interaction-scoped, so a DECLINED open leaves nothing behind and a
   * later, unrelated open takes §4.2's intent-less `first` default.
   */
  intent: TaskScopedRef<MenuOpenIntent>;
  /**
   * Whether DOM focus is currently inside the menu. Tracked from the menu's own
   * focus/blur events rather than read from `document.activeElement` at unmount:
   * effect-cleanup ordering means the active element may already be `<body>` by
   * then (a11y contract §4.6).
   */
  focusInside: React.RefObject<boolean>;
  /**
   * Set by every close path that already owns focus — Escape and item activation
   * (which move focus to the trigger themselves) and outside interactions (whose
   * `pointerdown` fires before the browser moves focus, so no focus stealing). It
   * suppresses the §4.6 rescue. Tab is deliberately NOT one of them (Amendment
   * A1): it makes no focus call, so the rescue must stay armed to keep a
   * synchronous close from stranding focus on `<body>`. Interaction-scoped
   * (Amendment A2): a declined close must not disarm a LATER rescue.
   */
  skipRescue: TaskScopedRef<boolean>;
  /**
   * Raised by the first close request of a gesture and read by the rest of it.
   * A single gesture reaches the close paths twice — the pointerdown or keydown
   * that closes, then the §4.5 focus-out close fired by the focus move that same
   * gesture performs — so without the gate a consumer that keeps `open` true is
   * told to close twice (Amendment A2). Scoped, never sticky: a declined close
   * must not swallow the next gesture's Escape.
   */
  closeRequested: TaskScopedRef<boolean>;
}

// A React ref object is just `{ current }`, so the whole bundle is one literal —
// seven `useRef` calls would buy nothing and would push this hook past the
// metrics budget.
function createMenuFocusRefs(): MenuFocusRefs {
  return {
    wrapper: { current: null },
    trigger: { current: null },
    menu: { current: null },
    intent: createTaskScopedRef<MenuOpenIntent>(),
    focusInside: { current: false },
    skipRescue: createTaskScopedRef<boolean>(),
    closeRequested: createTaskScopedRef<boolean>(),
  };
}

/**
 * Creates the ref bundle once per component instance. The bundle identity is
 * stable, so effects can list it as a dependency without re-subscribing.
 */
export function useMenuFocusRefs(): MenuFocusRefs {
  const bundle: React.RefObject<MenuFocusRefs | null> = React.useRef(null);
  if (bundle.current == null) {
    bundle.current = createMenuFocusRefs();
  }
  return bundle.current;
}

/** Records whether DOM focus is inside the menu, for the §4.6 rescue decision. */
export function markMenuFocusInside(bundle: MenuFocusRefs, inside: boolean): void {
  const { focusInside } = bundle;
  focusInside.current = inside;
}

/**
 * Everything the trigger, the menu rows and the effects need to act on. `open` is
 * the EFFECTIVE open state (the menu that is actually mounted), and `requestOpen`
 * is already gated for the static and disabled branches, so the action helpers
 * never re-check either. `disabled` rides along all the same, because §6.1's
 * boundary is wider than the request: a disabled trigger must record no open
 * intent either (Amendment A2).
 *
 * The identity is memoised over the render inputs (`useMenuContext`), so the
 * handler `useCallback`s keyed on it — and therefore the menu row's own — really
 * are stable whenever the consumer's callbacks are.
 */
export interface MenuFocusContext {
  refs: MenuFocusRefs;
  open: boolean;
  disabled: boolean;
  requestOpen: (next: boolean) => void;
  onSelect: ((itemId: string) => void) | undefined;
}
