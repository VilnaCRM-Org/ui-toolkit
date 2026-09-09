import { Box } from '@mui/material';
import React from 'react';

import { ProfileSelectMenuSlot } from './profile-select-menu';
import { ProfileSelectTrigger } from './profile-select-trigger';
import { profileMenuSx, profileWrapperSx } from './styles';
import type { UiProfileSelectCardProps } from './types';
import { useProfileSelectCard, type ProfileSelectCardModel } from './use-profile-select-card';
import { useTriggerHandlers, type TriggerHandlers } from './use-trigger-handlers';

// The profile menu-button card (Figma Cards frame, node 439:19893): an avatar,
// the person name and a grey chevron on a 48px trigger that opens an action menu
// 11px below it. Passing `onOpenChange` turns the trigger into a wired APG menu
// button; without it the card is static content. The consumer owns `open`, the
// component owns focus (a11y contract §4). The positioning wrapper carries no
// role and no landmark — only `lang`, the consumer `sx` and the focus-out close
// (§2.1/§4.5) — and the forwarded ref lands on the trigger button, never here.
// See `types.ts` for the full prop contract.
const UiProfileSelectCard: React.ForwardRefExoticComponent<
  UiProfileSelectCardProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiProfileSelectCardProps>(
  (props: Readonly<UiProfileSelectCardProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: ProfileSelectCardModel = useProfileSelectCard(props, ref);
    const handlers: TriggerHandlers = useTriggerHandlers(model.ctx);
    return (
      <Box
        ref={model.ctx.refs.wrapper}
        lang={props.lang}
        onBlur={handlers.onWidgetBlur}
        sx={profileWrapperSx(props.sx)}
      >
        <ProfileSelectTrigger card={props} model={model} handlers={handlers} />
        <ProfileSelectMenuSlot model={model} sx={profileMenuSx(props.menuSx)} />
      </Box>
    );
  }
);

UiProfileSelectCard.displayName = 'UiProfileSelectCard';

export default UiProfileSelectCard;
