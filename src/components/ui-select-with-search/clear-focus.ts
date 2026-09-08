import React from 'react';

const CLEAR_SELECTOR: string = '.MuiAutocomplete-clearIndicator';
const INPUT_SELECTOR: string = 'input';

function focusFieldInput(root: HTMLElement): void {
  const input: HTMLInputElement | null = root.querySelector<HTMLInputElement>(INPUT_SELECTOR);
  if (input !== null) {
    input.focus();
  }
}

/**
 * Moves focus off the clear × and onto the field's own input, but only while the
 * × is what currently holds focus. Exported so both halves — "the × has focus"
 * and "it does not" — can be driven directly, the way `picker-dom.ts` exposes
 * its own element helpers.
 */
export function restoreFieldFocus(root: HTMLElement | null): void {
  if (root === null) {
    return;
  }
  const clear: Element | null = root.querySelector(CLEAR_SELECTOR);
  if (clear !== null && document.activeElement === clear) {
    focusFieldInput(root);
  }
}

/**
 * Keeps a keyboard user's place when a fetch starts under the clear ×.
 *
 * This control, alone among the three comboboxes, puts the clear × in the tab
 * order (DEV-63) because it is the primary way to drop a selection. The busy
 * paint then takes that same slot and hides the × with `display: none`, and a
 * focused element hidden that way resets `document.activeElement` to `<body>`
 * in every browser — so clearing a value with the keyboard, when that clear is
 * what starts the consumer's refetch, would drop focus to the top of the page
 * (SC 2.4.3 Focus Order; SC 2.1.1 Keyboard). Focus therefore moves to the
 * field's own input: the semantic owner of the widget, still visible while
 * busy, and where the user was already working.
 *
 * No extra announcement rides along — the control's polite `role="status"`
 * region already speaks the busy state, and a second "focus moved" message
 * would be redundant noise (SC 4.1.3 Status Messages).
 *
 * The other two comboboxes keep MUI's `tabIndex={-1}` on their clear button, so
 * it can never hold focus and they need no guard.
 */
export function useClearFocusGuard(
  loading: boolean | null | undefined
): React.RefObject<HTMLDivElement | null> {
  const rootRef: React.RefObject<HTMLDivElement | null> = React.useRef<HTMLDivElement | null>(null);

  React.useEffect((): void => {
    if (loading === true) {
      restoreFieldFocus(rootRef.current);
    }
  }, [loading]);

  return rootRef;
}
