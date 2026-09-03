import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { OptionCardContent } from './option-card-content';
import { optionCardSx } from './styles';
import type { UiOptionCardProps } from './types';
import { useOptionCard, type OptionCardModel } from './use-option-card';

interface WiredCardProps {
  card: UiOptionCardProps;
  model: OptionCardModel;
  sx: SxProps<Theme>;
  cardRef: React.ForwardedRef<HTMLButtonElement>;
}

// The wired card is ONE native `<button type="button" role="radio">` spanning the
// whole card (the `type` is mandatory — an untyped button submits the enclosing
// form). `aria-checked` is PERMANENT and never mixed; `aria-pressed` appears
// nowhere, because a toggle button carries no mutual exclusivity. No key
// handlers: the native button already fires on Enter and Space. A disabled card
// keeps the aria-disabled boundary — still a real, focusable button whose
// activation no-ops in the model — so keyboard focus is never dropped when a
// focused card flips disabled. The card never renders its own `role="radiogroup"`.
function WiredCard({ card, model, sx, cardRef }: Readonly<WiredCardProps>): React.ReactElement {
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
      ref={cardRef}
      sx={sx}
    >
      <OptionCardContent label={card.label} valueLabel={card.valueLabel} />
    </Box>
  );
}

interface StaticCardProps {
  card: UiOptionCardProps;
  sx: SxProps<Theme>;
}

// The unwired card: static, non-interactive content — no role, no tabindex, and no
// ARIA of any kind. The content tree is identical to the wired branch, and a
// truthy `selected` is deliberately NOT painted here (dev-warned): the static
// branch never renders state it cannot expose programmatically, which is why the
// styles key the selected/disabled chrome off `[aria-checked]`/`[aria-disabled]` —
// attributes this branch never has. It carries no ref target either — the
// contract lands the forwarded ref on the button only.
function StaticCard({ card, sx }: Readonly<StaticCardProps>): React.ReactElement {
  return (
    <Box component="div" id={card.id} lang={card.lang} sx={sx}>
      <OptionCardContent label={card.label} valueLabel={card.valueLabel} />
    </Box>
  );
}

// One board follow-up option card (Figma Board A row y=1486): a caption over a
// value box. Passing `onSelect` turns the whole card into a single `role="radio"`
// button inside the consumer's own radio group; without it the card is static
// content. The forwarded ref lands on that button — never on a wrapper. See
// `types.ts` for the full prop contract.
const UiOptionCard: React.ForwardRefExoticComponent<
  UiOptionCardProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiOptionCardProps>(
  (props: Readonly<UiOptionCardProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: OptionCardModel = useOptionCard(props);
    const sx: SxProps<Theme> = optionCardSx({ interactive: model.interactive, sx: props.sx });
    if (model.interactive) {
      return <WiredCard card={props} model={model} sx={sx} cardRef={ref} />;
    }
    return <StaticCard card={props} sx={sx} />;
  }
);

UiOptionCard.displayName = 'UiOptionCard';

export default UiOptionCard;
