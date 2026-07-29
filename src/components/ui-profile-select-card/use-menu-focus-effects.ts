import React from 'react';

import { focusMenuEnd, isInsideWidget } from './menu-focus';
import type { MenuFocusRefs } from './menu-refs';
import type { ProfileSelectItem } from './types';

// Focus counts as STRANDED only when nothing real holds it: removing the focused
// node parks the document on `<body>` (or on nothing at all). If a handler or the
// browser has already put focus on a live element, there is nothing to rescue and
// the rescue must not fight that move.
function isFocusStranded(): boolean {
  const active: Element | null = document.activeElement;
  return active == null || active === document.body;
}

// a11y contract §4.6 — the stranded-focus rescue. It fires only when focus was
// still inside the vanishing menu, no close path already took ownership of it
// (Escape, item activation and outside interactions all set the flag), and focus
// really was left on `<body>`.
//
// Tab relies on it (Amendment A1): a consumer that lowers `open` synchronously
// unmounts the focused row BEFORE the browser performs the move. In a browser
// that implements the sequential-focus-navigation starting point the transient
// trigger focus is invisible — the default Tab action then advances FROM the
// trigger to the same destination the starting-point fixup would have picked —
// and in a browser without that fixup focus provably never lands on `<body>`
// (WCAG SC 2.4.3).
function rescueFocus(bundle: MenuFocusRefs): void {
  const { focusInside, skipRescue, trigger } = bundle;
  const rescue: boolean = focusInside.current && skipRescue.current !== true && isFocusStranded();
  focusInside.current = false;
  skipRescue.clear();
  if (rescue) {
    trigger.current?.focus();
  }
}

// a11y contract §4.6, third case (Amendment A2). Here the menu SURVIVES and the
// focused ROW does not: a controlled `items` change can drop the row that held
// focus, which parks the document on `<body>` — removing a focused node fires no
// blur, so `focusInside` still records where focus was — with the menu still
// mounted. The A1 cleanup only watches the menu itself vanishing, so this
// commit-time check covers the row-level case, and it rescues INSIDE the menu:
// the menu is still open, so the trigger would be the wrong destination. Zero
// surviving rows is NOT this case — §3.4 unmounts the menu, and A1 applies.
function rescueInsideMenu(bundle: MenuFocusRefs): void {
  const { focusInside, menu } = bundle;
  if (!focusInside.current || !isFocusStranded()) {
    return;
  }
  focusMenuEnd(menu.current, 'first');
}

// a11y contract §4.5 — outside interactions close the menu with no focus stealing.
// The exclusion covers the whole wrapper (trigger AND menu), which is what stops
// a click on an open trigger from firing close-then-reopen. `skipRescue` is
// mandatory here and stays: `pointerdown` runs BEFORE the browser moves focus off
// the menu row, so an armed rescue would grab the trigger out from under the
// element the user is pointing at. It is interaction-scoped (Amendment A2), so a
// consumer that declines this close cannot disarm a later rescue.
function closeOnOutsidePointer(
  bundle: MenuFocusRefs,
  requestOpen: (next: boolean) => void,
  event: PointerEvent
): void {
  const { wrapper, skipRescue } = bundle;
  if (isInsideWidget(wrapper.current, event.target)) {
    return;
  }
  skipRescue.set(true);
  requestOpen(false);
}

export interface MenuFocusEffectsConfig {
  refs: MenuFocusRefs;
  /** The EFFECTIVE open state — true exactly while the menu is mounted. */
  open: boolean;
  /** The rows currently rendered; a shrinking list can strand focus (§4.6). */
  items: ProfileSelectItem[];
  requestOpen: (next: boolean) => void;
}

// a11y contract §4.2 — focus ALWAYS enters the menu when it mounts, pointer and
// keyboard alike, landing on the end the recorded intent asks for (`first` by
// default, including programmatic opens). The cleanup is the §4.6 rescue.
function useMenuOpenFocus(refs: MenuFocusRefs, open: boolean): void {
  React.useLayoutEffect((): (() => void) | undefined => {
    if (!open) {
      return undefined;
    }
    const { menu, intent, focusInside } = refs;
    focusMenuEnd(menu.current, intent.current ?? 'first');
    intent.clear();
    focusInside.current = true;
    return (): void => rescueFocus(refs);
  }, [open, refs]);
}

// Declared after the open-focus effect so it runs after it: the mount case is
// already focused by then, and this only ever sees a genuinely stranded focus.
function useMenuItemsRescue(refs: MenuFocusRefs, open: boolean, items: ProfileSelectItem[]): void {
  React.useLayoutEffect((): void => {
    if (open) {
      rescueInsideMenu(refs);
    }
  }, [items, open, refs]);
}

// The document-level listener only exists while the menu does, so a closed card
// costs nothing.
function useOutsideClose(config: Readonly<MenuFocusEffectsConfig>): void {
  const { refs, open, requestOpen } = config;
  React.useEffect((): (() => void) | undefined => {
    if (!open) {
      return undefined;
    }
    const onPointerDown = (event: PointerEvent): void =>
      closeOnOutsidePointer(refs, requestOpen, event);
    document.addEventListener('pointerdown', onPointerDown);
    return (): void => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, refs, requestOpen]);
}

/**
 * The component's half of the ownership split (a11y contract §4): the consumer
 * owns `open`, and these three effects own focus around it. Focus enters the menu
 * when it mounts, is re-seated on the first surviving row when a controlled
 * `items` change removes the row that held it, and is rescued back to the trigger
 * when the menu vanishes underneath it and nothing else has claimed focus — so
 * focus is never dropped to `<body>`.
 */
export function useMenuFocusEffects(config: Readonly<MenuFocusEffectsConfig>): void {
  useMenuOpenFocus(config.refs, config.open);
  useMenuItemsRescue(config.refs, config.open, config.items);
  useOutsideClose(config);
}
