import { Box } from '@mui/material';
import React from 'react';

import { BackgroundPickerMenu } from './background-picker-menu';
import { BackgroundPickerTrigger } from './background-picker-trigger';
import type { UiBackgroundPickerProps } from './types';
import { useBackgroundPicker, type BackgroundPickerModel } from './use-background-picker';
import { useTriggerActionHandlers, type TriggerActionHandlers } from './use-trigger-handlers';

// The board-background dropdown card (Figma node 439:19673 rest / 439:19677
// hover / 439:19689 open / 439:19715 disabled): a 220px pill that grows
// downward into the SAME card when open, never a detached popper. Passing
// `onOpenChange` turns the trigger into a wired APG menu button whose rows are
// `menuitemradio`; without it the card is static content. The consumer owns
// `open`, the component owns focus. The card root carries no role of its own
// — only `lang`, the consumer `sx` and the outside-pointerdown exclusion zone
// — and the forwarded ref lands on the trigger button. See `types.ts` for the
// full prop contract.
const UiBackgroundPicker: React.ForwardRefExoticComponent<
  UiBackgroundPickerProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiBackgroundPickerProps>(
  (props: Readonly<UiBackgroundPickerProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: BackgroundPickerModel = useBackgroundPicker(props, ref);
    const handlers: TriggerActionHandlers = useTriggerActionHandlers(model.ctx);
    return (
      <Box ref={model.ctx.refs.wrapper} lang={props.lang} sx={model.cardSx}>
        <BackgroundPickerTrigger picker={props} model={model} handlers={handlers} />
        {model.menuOpen ? <BackgroundPickerMenu model={model} /> : null}
      </Box>
    );
  }
);

UiBackgroundPicker.displayName = 'UiBackgroundPicker';

export default UiBackgroundPicker;
