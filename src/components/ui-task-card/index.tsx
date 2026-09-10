import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { taskCardSx } from './styles';
import { TaskCardContent } from './task-card-content';
import type { UiTaskCardProps } from './types';
import { useTaskCard, type TaskCardModel } from './use-task-card';

interface WiredCardProps {
  card: UiTaskCardProps;
  model: TaskCardModel;
  sx: SxProps<Theme>;
  buttonRef: React.ForwardedRef<HTMLButtonElement>;
}

// The wired card is ONE native `<button type="button">` (the type is mandatory —
// an untyped button submits the board's enclosing filter form). No key handlers:
// the native button already fires on Enter and Space, and a manual handler would
// double-fire on Space. A disabled card keeps the aria-disabled boundary pattern —
// still a real, focusable button, activation no-ops in the model — so keyboard
// focus is never dropped when a focused card flips disabled.
function WiredCard({ card, model, sx, buttonRef }: Readonly<WiredCardProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={card.id}
      lang={card.lang}
      aria-disabled={model.ariaDisabled}
      onClick={model.onActivate}
      ref={buttonRef}
      sx={sx}
    >
      <TaskCardContent
        title={card.title}
        deadlineLabel={card.deadlineLabel}
        deadline={card.deadline}
        avatar={model.avatar}
      />
    </Box>
  );
}

interface StaticCardProps {
  card: UiTaskCardProps;
  model: TaskCardModel;
  sx: SxProps<Theme>;
}

// The unwired card: static, non-interactive content — no button role, no tabindex,
// no aria-disabled. The content tree is identical to the wired branch.
function StaticCard({ card, model, sx }: Readonly<StaticCardProps>): React.ReactElement {
  return (
    <Box component="div" id={card.id} lang={card.lang} sx={sx}>
      <TaskCardContent
        title={card.title}
        deadlineLabel={card.deadlineLabel}
        deadline={card.deadline}
        avatar={model.avatar}
      />
    </Box>
  );
}

// One kanban board task card: assignee photo, wrapping title, deadline label and
// deadline chip. Passing `onActivate` turns the whole card into a single native
// button (fire-and-forget, no disclosure semantics); without it the card is static
// content. The forwarded ref lands on that button — never on a wrapper — so a
// consumer can return focus to the card after a dialog closes. The card itself
// never moves focus. See `types.ts` for the full prop contract.
const UiTaskCard: React.ForwardRefExoticComponent<
  UiTaskCardProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiTaskCardProps>(
  (props: Readonly<UiTaskCardProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: TaskCardModel = useTaskCard(props);
    const sx: SxProps<Theme> = taskCardSx({ interactive: model.interactive, sx: props.sx });
    if (model.interactive) {
      return <WiredCard card={props} model={model} sx={sx} buttonRef={ref} />;
    }
    return <StaticCard card={props} model={model} sx={sx} />;
  }
);

UiTaskCard.displayName = 'UiTaskCard';

export default UiTaskCard;
