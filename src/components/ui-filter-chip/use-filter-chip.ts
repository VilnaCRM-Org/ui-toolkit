import { useDevWarning } from '@/utils/dev-warn';

import filterChipWarning from './filter-chip-warnings';
import type { UiFilterChipProps } from './types';

/**
 * The visually-hidden suffix appended to the visible label, in Ukrainian like
 * every other built-in string in the toolkit (the `UiPagination` 'Попередня' /
 * 'Наступна' precedent). It opens with a comma so screen readers pause between
 * the filter text and the verb.
 */
export const DEFAULT_REMOVE_LABEL: string = ', видалити фільтр';

// The view model the chip renders from. It keeps the component thin: the
// wired/static split, the `aria-disabled` boundary and the name suffix
// resolution all live here.
export interface FilterChipModel {
  /** True when `onRemove` is present — the chip renders as a native button. */
  interactive: boolean;
  /** `aria-disabled` for a disabled wired chip; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** The hidden suffix that turns the visible text into an action name. */
  removeLabel: string;
  /** Fired on activation; a no-op while disabled. */
  onActivate: () => void;
}

// Activation is gated in the model layer, before any DOM concern: a disabled chip
// swallows it so `onRemove` never fires (the `aria-disabled` boundary), which is
// what lets the button stay focusable and keeps focus from being dropped when a
// focused chip flips disabled. A DECLINED removal leaves the chip mounted and
// eligible, so the next activation fires again.
function makeActivate(disabled: boolean, onRemove?: () => void): () => void {
  return (): void => {
    if (disabled) return;
    onRemove?.();
  };
}

export function useFilterChip(props: UiFilterChipProps): FilterChipModel {
  useDevWarning(filterChipWarning(props));
  const interactive: boolean = props.onRemove != null;
  const disabled: boolean = props.disabled ?? false;
  return {
    interactive,
    ariaDisabled: interactive && disabled ? true : undefined,
    removeLabel: props.removeLabel ?? DEFAULT_REMOVE_LABEL,
    onActivate: makeActivate(disabled, props.onRemove),
  };
}
