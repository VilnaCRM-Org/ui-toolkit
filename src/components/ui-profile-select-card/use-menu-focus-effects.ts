import React from 'react';

import { focusMenuEnd, isInsideWidget } from './menu-focus';
import type { MenuFocusRefs } from './menu-refs';

// a11y contract §4.6 — the programmatic-close rescue. It fires only when focus
// was still inside the vanishing menu AND no close path already took ownership of
// it (Escape, item activation, Tab and outside interactions all set the flag), so
// focus is never silently dropped to `<body>` and never yanked back on Tab.
function rescueFocus(bundle: MenuFocusRefs): void {
  const { focusInside, skipRescue, trigger } = bundle;
  const rescue: boolean = focusInside.current && !skipRescue.current;
  focusInside.current = false;
  skipRescue.current = false;
  if (rescue) {
    trigger.current?.focus();
  }
}

// a11y contract §4.5 — outside interactions close the menu with no focus stealing.
// The exclusion covers the whole wrapper (trigger AND menu), which is what stops
// a click on an open trigger from firing close-then-reopen.
function closeOnOutsidePointer(
  bundle: MenuFocusRefs,
  requestOpen: (next: boolean) => void,
  event: PointerEvent
): void {
  const { wrapper, skipRescue } = bundle;
  if (isInsideWidget(wrapper.current, event.target)) {
    return;
  }
  skipRescue.current = true;
  requestOpen(false);
}

export interface MenuFocusEffectsConfig {
  refs: MenuFocusRefs;
  /** The EFFECTIVE open state — true exactly while the menu is mounted. */
  open: boolean;
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
    intent.current = null;
    focusInside.current = true;
    return (): void => rescueFocus(refs);
  }, [open, refs]);
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
 * owns `open`, and these two effects own focus around it. Focus enters the menu
 * when it mounts and is rescued back to the trigger when the menu vanishes
 * underneath it, so focus is never dropped to `<body>`.
 */
export function useMenuFocusEffects(config: Readonly<MenuFocusEffectsConfig>): void {
  useMenuOpenFocus(config.refs, config.open);
  useOutsideClose(config);
}
