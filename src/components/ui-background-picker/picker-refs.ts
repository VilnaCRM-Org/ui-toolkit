import React from 'react';

/** Which end of the menu a pending open should land on. */
export type PickerFocusIntent = 'first' | 'last';

/**
 * A mutable cell exposing `set`/`clear` methods rather than a writable
 * `current`, so consumers that only hold a reference to the cell (a function
 * parameter) mutate it through a method instead of a raw property write —
 * `no-param-reassign` flags the latter, and the method keeps the write inside
 * the cell's own closure.
 */
export interface PickerIntentCell {
  current: PickerFocusIntent | null;
  set: (value: PickerFocusIntent) => void;
  clear: () => void;
}

function createIntentCell(): PickerIntentCell {
  const cell: PickerIntentCell = {
    current: null,
    set: (value: PickerFocusIntent): void => {
      cell.current = value;
    },
    clear: (): void => {
      cell.current = null;
    },
  };
  return cell;
}

/**
 * The mutable handles the trigger, the menu and the effects share. `intent` is
 * written once and read once by the same open transition — this picker
 * deliberately skips the profile-card's task-scoped-ref rescue machinery (a11y
 * contract keeps the keyboard "small").
 */
export interface PickerRefs {
  /** The card root — the outside-pointerdown exclusion zone. */
  wrapper: React.RefObject<HTMLDivElement | null>;
  /** The trigger button — every focus return lands here. */
  trigger: React.RefObject<HTMLButtonElement | null>;
  /** The `role="menu"` element, or null while the menu is unmounted. */
  menu: React.RefObject<HTMLDivElement | null>;
  /** Which end the next open should focus; cleared once consumed. */
  intent: PickerIntentCell;
}

function createPickerRefs(): PickerRefs {
  return {
    wrapper: { current: null },
    trigger: { current: null },
    menu: { current: null },
    intent: createIntentCell(),
  };
}

/** Creates the ref bundle once per component instance. */
export function usePickerRefs(): PickerRefs {
  const bundle: React.RefObject<PickerRefs | null> = React.useRef(null);
  if (bundle.current == null) {
    bundle.current = createPickerRefs();
  }
  return bundle.current;
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
 * forwarded ref, which lands on the button so a consumer can return focus to
 * the picker after a dialog closes. Reads its fields through a destructured
 * LOCAL binding rather than the parameter itself, so the `.current` writes
 * below are local-variable mutations, not `no-param-reassign` violations.
 */
export function assignTriggerNode(assignment: Readonly<TriggerNodeAssignment>): void {
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

/**
 * Everything the trigger, the rows and the effects act on. `open` is the
 * EFFECTIVE open state (the menu that is actually mounted).
 */
export interface PickerCtx {
  refs: PickerRefs;
  open: boolean;
  disabled: boolean;
  /** The coerced `value ?? ''`, read only by row activation. */
  value: string;
  requestOpen: (next: boolean) => void;
  onSelect: ((id: string) => void) | undefined;
}

/**
 * Memoises the action context over its real inputs, so the trigger/menu
 * handler `useCallback`s keyed on it are genuinely stable across a re-render
 * that changes nothing they depend on.
 */
export function usePickerCtx(input: Readonly<PickerCtx>): PickerCtx {
  const { refs, open, disabled, value, requestOpen, onSelect } = input;
  return React.useMemo(
    (): PickerCtx => ({ refs, open, disabled, value, requestOpen, onSelect }),
    [disabled, onSelect, open, refs, requestOpen, value]
  );
}
