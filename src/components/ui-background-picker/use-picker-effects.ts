import React from 'react';

import { handleOutsidePointerDown } from './picker-actions';
import { focusMenuEdge } from './picker-dom';
import type { PickerCtx } from './picker-refs';

// Focus always enters the menu when it mounts, landing on the intent-recorded
// end (`first` by default, including a mouse-driven open).
function useOpenFocusEffect(ctx: PickerCtx): void {
  React.useLayoutEffect((): void => {
    if (!ctx.open) {
      return;
    }
    focusMenuEdge(ctx.refs.menu.current, ctx.refs.intent.current ?? 'first');
    ctx.refs.intent.clear();
  }, [ctx]);
}

// The document-level listener only exists while the menu does, so a closed
// card costs nothing.
function useOutsideCloseEffect(ctx: PickerCtx): void {
  React.useEffect((): (() => void) | undefined => {
    if (!ctx.open) {
      return undefined;
    }
    const onPointerDown = (event: PointerEvent): void => handleOutsidePointerDown(ctx, event);
    document.addEventListener('pointerdown', onPointerDown);
    return (): void => document.removeEventListener('pointerdown', onPointerDown);
  }, [ctx]);
}

/** The component's half of the open/focus ownership split, bundled for the hook. */
export function usePickerEffects(ctx: PickerCtx): void {
  useOpenFocusEffect(ctx);
  useOutsideCloseEffect(ctx);
}
