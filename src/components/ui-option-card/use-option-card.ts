import { useDevWarning } from '@/utils/dev-warn';

import optionCardWarning from './option-card-warnings';
import type { UiOptionCardProps } from './types';

/**
 * The view model the card renders from: the wired/static split, the always-
 * controlled `selected` axis and the `aria-disabled` boundary all live here.
 */
export interface OptionCardModel {
  /** True when `onSelect` is present — the card renders as a `role="radio"` button. */
  interactive: boolean;
  /** `aria-checked`, permanent on a wired card and never absent. */
  ariaChecked: boolean;
  /** `aria-disabled` for a disabled wired card; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** Fired on activation; a no-op while disabled or already selected. */
  onActivate: () => void;
}

/** The two booleans every activation decision is gated on. */
interface ActivationGate {
  disabled: boolean;
  selected: boolean;
}

// Activation is gated before any model work: a disabled card swallows it so
// `onSelect` never fires, and an already-selected card fires nothing either —
// native radio `change` semantics.
function makeActivate(gate: ActivationGate, onSelect?: () => void): () => void {
  return (): void => {
    if (gate.disabled || gate.selected) return;
    onSelect?.();
  };
}

export function useOptionCard(props: UiOptionCardProps): OptionCardModel {
  useDevWarning(optionCardWarning(props));
  const interactive: boolean = props.onSelect != null;
  const disabled: boolean = props.disabled ?? false;
  // Always controlled, coerced from nullish: the component never self-flips it,
  // so a card that starts unselected can never drift uncontrolled.
  const selected: boolean = props.selected ?? false;
  return {
    interactive,
    ariaChecked: selected,
    ariaDisabled: interactive && disabled ? true : undefined,
    onActivate: makeActivate({ disabled, selected }, props.onSelect),
  };
}
