import { useDevWarning } from '@/utils/dev-warn';

import statusBadgeWarning from './status-badge-warnings';
import type { UiStatusBadgeProps } from './types';

// The view model the badge renders from. It keeps the component thin: the
// static/wired split, the always-controlled `active` axis and the `aria-disabled`
// boundary all live here, so neither shell in `index.tsx` holds any logic.
export interface StatusBadgeModel {
  /** True when `onToggle` is present — the badge renders as a toggle button. */
  interactive: boolean;
  /** The coerced `active` axis; drives the chrome in BOTH modes. */
  active: boolean;
  /** `aria-pressed` on a wired badge; absent entirely on a static one (S2). */
  ariaPressed: boolean | undefined;
  /** `aria-disabled` for a disabled wired badge; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** Fired on activation; a no-op while disabled (the aria-disabled boundary). */
  onActivate: () => void;
}

// Activation is gated in the model layer, before the DOM ever sees it: a disabled
// badge swallows it so `onToggle` never fires. Unlike the 3.4 radio there is NO
// already-in-state gate — a toggle legitimately fires from both states, and it is
// the consumer, never the badge, that decides what the next state is.
function makeToggle(disabled: boolean, onToggle?: () => void): () => void {
  return (): void => {
    if (disabled) return;
    onToggle?.();
  };
}

export function useStatusBadge(props: UiStatusBadgeProps): StatusBadgeModel {
  useDevWarning(statusBadgeWarning(props));
  const interactive: boolean = props.onToggle != null;
  const disabled: boolean = props.disabled ?? false;
  // Always controlled, coerced from nullish: the component never self-flips it,
  // so a badge that starts inactive can never drift uncontrolled.
  const active: boolean = props.active ?? false;
  return {
    interactive,
    active,
    ariaPressed: interactive ? active : undefined,
    ariaDisabled: interactive && disabled ? true : undefined,
    onActivate: makeToggle(disabled, props.onToggle),
  };
}
