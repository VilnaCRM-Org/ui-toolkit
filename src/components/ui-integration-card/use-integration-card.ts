import type React from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import integrationCardWarning from './integration-card-warnings';
import { resolveLogo, type ResolvedLogo } from './integration-logo';
import type { UiIntegrationCardProps } from './types';
import useCardRef from './use-card-ref';

// The view model the card renders from. It keeps the component thin: the
// wired/static split, the always-controlled `selected` axis, the `aria-disabled`
// boundary and the logo resolution all live here.
export interface IntegrationCardModel {
  /** True when `onSelect` is present — the card renders as a `role="radio"` button. */
  interactive: boolean;
  /** `aria-checked`, permanent on a wired card and never absent (§1.1). */
  ariaChecked: boolean;
  /** `aria-disabled` for a disabled wired card; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** The mark to paint, or `null` when the bundle is unusable (§3.5). */
  logo: ResolvedLogo | null;
  /** Fired on activation; a no-op while disabled or already selected (§3.2/§6.1). */
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
// swallows it so `onSelect` never fires (the `aria-disabled` boundary, §6.1), and
// an already-selected card fires nothing either — native radio `change` semantics,
// which is also what prevents duplicate selection side-effects (§3.2). A DECLINED
// selection leaves `selected` false, so the next activation fires again.
function makeActivate(gate: ActivationGate, onSelect?: () => void): () => void {
  return (): void => {
    if (gate.disabled || gate.selected) return;
    onSelect?.();
  };
}

export function useIntegrationCard(
  props: UiIntegrationCardProps,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>
): IntegrationCardModel {
  useDevWarning(integrationCardWarning(props));
  const interactive: boolean = props.onSelect != null;
  const disabled: boolean = props.disabled ?? false;
  // Always controlled, coerced from nullish (§3.1): the component never self-flips
  // it, so a card that starts unselected can never drift uncontrolled.
  const selected: boolean = props.selected ?? false;
  const setCardRef: React.RefCallback<HTMLButtonElement> = useCardRef(forwardedRef, interactive);
  return {
    interactive,
    ariaChecked: selected,
    ariaDisabled: interactive && disabled ? true : undefined,
    logo: resolveLogo(props.logo),
    onActivate: makeActivate({ disabled, selected }, props.onSelect),
    setCardRef,
  };
}
