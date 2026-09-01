import type React from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import paymentCardWarning from './payment-card-warnings';
import { resolvePaymentMark, type ResolvedPaymentLogo } from './payment-logo';
import type { UiPaymentOptionCardProps } from './types';
import usePaymentCardRef from './use-payment-card-ref';

// The view model the card renders from. It keeps the component thin: the
// wired/static split, the always-controlled `selected` axis, the `aria-disabled`
// boundary and the enabled/disabled wordmark choice all live here.
export interface PaymentCardModel {
  /** True when `onSelect` is present — the card renders as a `role="radio"` button. */
  interactive: boolean;
  /** `aria-checked`, permanent on a wired card and never absent. */
  ariaChecked: boolean;
  /** `aria-disabled` for a disabled wired card; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** The mark to paint, or `null` when the bundle is unusable. */
  logo: ResolvedPaymentLogo | null;
  /** Fired on activation; a no-op while disabled or already selected. */
  onActivate: () => void;
  /** Callback ref for the card button; also feeds the consumer's forwarded ref. */
  setCardRef: React.RefCallback<HTMLButtonElement>;
}

/** The two booleans every activation decision is gated on. */
interface ActivationGate {
  disabled: boolean;
  selected: boolean;
}

// Activation is gated in the model layer, before any model work: a disabled card
// swallows it so `onSelect` never fires (the `aria-disabled` boundary), and an
// already-selected card fires nothing either — native radio `change` semantics,
// which is also what prevents duplicate selection side-effects. A DECLINED
// selection leaves `selected` false, so the next activation fires again.
function makeActivate(gate: ActivationGate, onSelect?: () => void): () => void {
  return (): void => {
    if (gate.disabled || gate.selected) return;
    onSelect?.();
  };
}

export function usePaymentCard(
  props: UiPaymentOptionCardProps,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>
): PaymentCardModel {
  useDevWarning(paymentCardWarning(props));
  const interactive: boolean = props.onSelect != null;
  const disabled: boolean = props.disabled ?? false;
  // Always controlled, coerced from nullish: the component never self-flips it, so
  // a card that starts unselected can never drift uncontrolled.
  const selected: boolean = props.selected ?? false;
  // The grey wordmark rides the same `aria-disabled` boundary the CSS chrome keys
  // off, so the static branch — which exposes no state programmatically — can never
  // paint a disabled-looking card.
  const ariaDisabled: true | undefined = interactive && disabled ? true : undefined;
  const setCardRef: React.RefCallback<HTMLButtonElement> = usePaymentCardRef(
    forwardedRef,
    interactive
  );
  return {
    interactive,
    ariaChecked: selected,
    ariaDisabled,
    logo: resolvePaymentMark({ card: props, disabled: ariaDisabled === true }),
    onActivate: makeActivate({ disabled, selected }, props.onSelect),
    setCardRef,
  };
}
