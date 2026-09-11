import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { IntegrationCardContent } from './integration-card-content';
import { integrationCardSx } from './styles';
import type { UiIntegrationCardProps } from './types';
import { useIntegrationCard, type IntegrationCardModel } from './use-integration-card';

interface CardShellProps {
  card: UiIntegrationCardProps;
  model: IntegrationCardModel;
  sx: SxProps<Theme>;
}

// The wired card is ONE native `<button type="button" role="radio">` spanning the
// whole card (the `type` is mandatory — an untyped button submits the enclosing
// setup form). `aria-checked` is PERMANENT and never mixed (a11y contract §1.1);
// `aria-pressed` appears nowhere, because a toggle button carries no mutual
// exclusivity. No key handlers: the native button already fires on Enter and
// Space, and a manual handler would double-fire on Space (§4.1). A disabled card
// keeps the aria-disabled boundary — still a real, focusable button whose
// activation no-ops in the model — so keyboard focus is never dropped when a
// focused card flips disabled. The card never renders its own `role="radiogroup"`
// (§1.2); a wired card without one dev-warns instead.
function WiredCard({ card, model, sx }: Readonly<CardShellProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      role="radio"
      id={card.id}
      lang={card.lang}
      aria-checked={model.ariaChecked}
      aria-disabled={model.ariaDisabled}
      onClick={model.onActivate}
      ref={model.setCardRef}
      sx={sx}
    >
      <IntegrationCardContent name={card.name} logo={model.logo} />
    </Box>
  );
}

// The unwired card: static, non-interactive content — no role, no tabindex, and no
// ARIA of any kind, not even `aria-disabled` (§2.3/§6.2). The content tree is
// identical to the wired branch, and a truthy `selected` is deliberately NOT
// painted here (§3.4, dev-warned): the static branch never renders state it cannot
// expose programmatically, which is why the styles key the selected chrome off
// `[aria-checked="true"]` — an attribute this branch never has.
function StaticCard({ card, model, sx }: Readonly<CardShellProps>): React.ReactElement {
  return (
    <Box component="div" id={card.id} lang={card.lang} sx={sx}>
      <IntegrationCardContent name={card.name} logo={model.logo} />
    </Box>
  );
}

// One integration choice card (Figma Cards frame, node 439:19893): a radio glyph
// beside the brand name, with the brand logo centred below. Passing `onSelect`
// turns the whole card into a single `role="radio"` button inside the consumer's
// own radio group; without it the card is static content. The forwarded ref lands
// on that button — never on a wrapper — so a consumer can return focus to the card
// after a dialog closes. The card itself NEVER moves focus and NEVER flips
// `selected`: both belong to the consumer (§3.1/§4.2). See `types.ts` for the full
// prop contract.
const UiIntegrationCard: React.ForwardRefExoticComponent<
  UiIntegrationCardProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiIntegrationCardProps>(
  (props: Readonly<UiIntegrationCardProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: IntegrationCardModel = useIntegrationCard(props, ref);
    const sx: SxProps<Theme> = integrationCardSx({ interactive: model.interactive, sx: props.sx });
    if (model.interactive) {
      return <WiredCard card={props} model={model} sx={sx} />;
    }
    return <StaticCard card={props} model={model} sx={sx} />;
  }
);

UiIntegrationCard.displayName = 'UiIntegrationCard';

export default UiIntegrationCard;
