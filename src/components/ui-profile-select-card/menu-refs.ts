import React from 'react';

import type { MenuOpenIntent } from './menu-focus';

/**
 * The mutable handles the trigger, the menu and the focus effects share. They are
 * refs rather than state because none of them may schedule a render: the open axis
 * belongs entirely to the consumer (a11y contract §3.1/§4).
 */
export interface MenuFocusRefs {
  /** The positioning wrapper — the outside-pointerdown exclusion zone (§4.5). */
  wrapper: React.RefObject<HTMLDivElement | null>;
  /** The trigger button — every focus return lands here (§4.4/§4.5/§4.6). */
  trigger: React.RefObject<HTMLButtonElement | null>;
  /** The `role="menu"` element, or null while the menu is unmounted. */
  menu: React.RefObject<HTMLDivElement | null>;
  /** Which end the pending open should focus; cleared once consumed (§4.2). */
  intent: React.RefObject<MenuOpenIntent | null>;
  /**
   * Whether DOM focus is currently inside the menu. Tracked from the menu's own
   * focus/blur events rather than read from `document.activeElement` at unmount:
   * effect-cleanup ordering means the active element may already be `<body>` by
   * then (a11y contract §4.6).
   */
  focusInside: React.RefObject<boolean>;
  /**
   * Set by every close path that already owns focus — Escape and item activation
   * (which move focus to the trigger themselves), Tab (which must let focus
   * proceed naturally) and outside interactions (no focus stealing). It suppresses
   * the §4.6 rescue, so only a programmatic close ever pulls focus back.
   */
  skipRescue: React.RefObject<boolean>;
}

// A React ref object is just `{ current }`, so the whole bundle is one literal —
// six `useRef` calls would buy nothing and would push this hook past the metrics
// budget.
function createMenuFocusRefs(): MenuFocusRefs {
  return {
    wrapper: { current: null },
    trigger: { current: null },
    menu: { current: null },
    intent: { current: null },
    focusInside: { current: false },
    skipRescue: { current: false },
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
 * never re-check either.
 */
export interface MenuFocusContext {
  refs: MenuFocusRefs;
  open: boolean;
  requestOpen: (next: boolean) => void;
  onSelect: ((itemId: string) => void) | undefined;
}
