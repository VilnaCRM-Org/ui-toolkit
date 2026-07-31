import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { PaymentCardContent } from './payment-card-content';
import { paymentOptionCardSx } from './styles';
import type { UiPaymentOptionCardProps } from './types';
import { usePaymentCard, type PaymentCardModel } from './use-payment-card';

interface CardShellProps {
  card: UiPaymentOptionCardProps;
  model: PaymentCardModel;
  sx: SxProps<Theme>;
}

// The wired card is ONE native `<button type="button" role="radio">` spanning the
// whole 279x90 card (the `type` is mandatory — an untyped button submits the
// enclosing checkout form). `aria-checked` is PERMANENT and never mixed;
// `aria-pressed` appears nowhere, because a toggle button carries no mutual
// exclusivity. No key handlers: the native button already fires on Enter and
// Space, and a manual handler would double-fire on Space. A disabled card keeps
// the aria-disabled boundary — still a real, focusable button whose activation
// no-ops in the model — so keyboard focus is never dropped when a focused card
// flips disabled. The card never renders its own `role="radiogroup"`; a wired card
// without one dev-warns instead.
function WiredCard({ card, model, sx }: Readonly<CardShellProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      role="radio"
      id={card.id}
      aria-checked={model.ariaChecked}
      aria-disabled={model.ariaDisabled}
      onClick={model.onActivate}
      ref={model.setCardRef}
      sx={sx}
    >
      <PaymentCardContent name={card.name} logo={model.logo} />
    </Box>
  );
}

// The unwired card: static, non-interactive content — no role, no tabindex, and no
// ARIA of any kind, not even `aria-disabled`. The content tree is identical to the
// wired branch, and a truthy `selected` is deliberately NOT painted here
// (dev-warned): the static branch never renders state it cannot expose
// programmatically, which is why the styles key the selected and disabled chrome
// off `[aria-checked="true"]` / `[aria-disabled="true"]` — attributes this branch
// never has.
function StaticCard({ card, model, sx }: Readonly<CardShellProps>): React.ReactElement {
  return (
    <Box component="div" id={card.id} sx={sx}>
      <PaymentCardContent name={card.name} logo={model.logo} />
    </Box>
  );
}

// One payment-provider choice card (Figma Board A row y=1004): a selection circle
// anchored top-left with the provider wordmark centred on the card's own axis, and
// no text at all. Passing `onSelect` turns the whole card into a single
// `role="radio"` button inside the consumer's own radio group; without it the card
// is static content. The wordmark's `alt={name}` is the card's entire accessible
// name — the one deliberate deviation from `UiIntegrationCard`, whose logo is
// decorative because a visible brand name sits beside it. The forwarded ref lands
// on the button — never on a wrapper — so a consumer can return focus to the card
// after a dialog closes. The card itself NEVER moves focus and NEVER flips
// `selected`: both belong to the consumer. See `types.ts` for the full contract.
const UiPaymentOptionCard: React.ForwardRefExoticComponent<
  UiPaymentOptionCardProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiPaymentOptionCardProps>(
  (props: Readonly<UiPaymentOptionCardProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: PaymentCardModel = usePaymentCard(props, ref);
    const sx: SxProps<Theme> = paymentOptionCardSx({
      interactive: model.interactive,
      sx: props.sx,
    });
    if (model.interactive) {
      return <WiredCard card={props} model={model} sx={sx} />;
    }
    return <StaticCard card={props} model={model} sx={sx} />;
  }
);

UiPaymentOptionCard.displayName = 'UiPaymentOptionCard';

export default UiPaymentOptionCard;
