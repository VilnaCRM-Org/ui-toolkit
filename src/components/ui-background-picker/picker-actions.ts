import type { PickerCtx } from './picker-refs';

/**
 * Pointer/Enter/Space activation on the trigger. A click on an OPEN trigger
 * closes it and leaves focus where it is; a click on a closed one opens onto
 * the first row.
 *
 * Never reached while disabled — the caller owns that boundary.
 */
export function handleTriggerClick(ctx: PickerCtx): void {
  if (ctx.open) {
    ctx.requestOpen(false);
    return;
  }
  ctx.refs.intent.set('first');
  ctx.requestOpen(true);
}

function isInsideWidget(wrapper: HTMLElement | null, target: EventTarget | null): boolean {
  if (wrapper == null || !(target instanceof Node)) {
    return false;
  }
  return wrapper.contains(target);
}

/** An outside `pointerdown` closes the menu with no focus call. */
export function handleOutsidePointerDown(ctx: PickerCtx, event: PointerEvent): void {
  if (isInsideWidget(ctx.refs.wrapper.current, event.target)) {
    return;
  }
  ctx.requestOpen(false);
}

/**
 * Row activation: close, focus the trigger, THEN report the change — and only
 * when the row was not already the checked one (re-picking it closes silently).
 */
export function handleRowActivate(ctx: PickerCtx, id: string): void {
  const changed: boolean = id !== ctx.value;
  ctx.requestOpen(false);
  ctx.refs.trigger.current?.focus();
  if (changed) {
    ctx.onSelect?.(id);
  }
}
