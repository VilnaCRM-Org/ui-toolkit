import { useDevWarning } from '@/utils/dev-warn';

import addButtonWarning from './add-button-warnings';
import type { UiAddButtonProps } from './types';

/**
 * The default visible label, in Ukrainian like every other built-in string in
 * the toolkit (the `UiPagination` 'Попередня' / 'Наступна' precedent).
 */
export const DEFAULT_LABEL: string = 'Додати стовпець';

// The view model the button renders from. It keeps the component thin: the
// wired/static split, the `aria-disabled` boundary and the label fallback all
// live here.
export interface AddButtonModel {
  /** True when `onActivate` is present — the button renders as a native button. */
  interactive: boolean;
  /** `aria-disabled` for a disabled wired button; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** The resolved visible label, defaulted when the prop is omitted. */
  label: string;
  /** Fired on activation; a no-op while disabled. */
  onActivate: () => void;
}

// Activation is gated in the model layer, before any DOM concern: a disabled
// button swallows it so `onActivate` never fires (the `aria-disabled`
// boundary), which is what lets the button stay focusable.
function makeActivate(disabled: boolean, onActivate?: () => void): () => void {
  return (): void => {
    if (disabled) return;
    onActivate?.();
  };
}

export function useAddButton(props: UiAddButtonProps): AddButtonModel {
  useDevWarning(addButtonWarning(props));
  const interactive: boolean = props.onActivate != null;
  const disabled: boolean = props.disabled ?? false;
  return {
    interactive,
    ariaDisabled: interactive && disabled ? true : undefined,
    label: props.label ?? DEFAULT_LABEL,
    onActivate: makeActivate(disabled, props.onActivate),
  };
}
