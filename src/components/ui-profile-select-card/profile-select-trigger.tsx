import { Box } from '@mui/material';
import React from 'react';

import { ProfileSelectCardContent } from './profile-select-card-content';
import type { ProfileSelectCardModel } from './profile-select-model';
import type { UiProfileSelectCardProps } from './types';
import type { TriggerHandlers } from './use-trigger-handlers';

export interface ProfileSelectTriggerProps {
  card: UiProfileSelectCardProps;
  model: ProfileSelectCardModel;
  handlers: TriggerHandlers;
}

// The wired trigger is ONE native `<button type="button">` (the type is mandatory
// — an untyped button submits an enclosing form) carrying the APG menu-button
// wiring: `aria-haspopup="menu"` and `aria-expanded` in BOTH states, and
// `aria-controls` only while the menu is mounted, so a closed card leaves no
// dangling idref (a11y contract §1.2). A disabled card keeps the aria-disabled
// boundary pattern — still a real, focusable button whose open paths no-op — so
// keyboard focus is never dropped when a focused card flips disabled.
function WiredTrigger({
  card,
  model,
  handlers,
}: Readonly<ProfileSelectTriggerProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={model.triggerId}
      aria-haspopup="menu"
      aria-expanded={model.ariaExpanded}
      aria-controls={model.ariaControls}
      aria-disabled={model.ariaDisabled}
      onClick={handlers.onClick}
      onKeyDown={handlers.onKeyDown}
      ref={model.setTriggerRef}
      sx={model.triggerSx}
    >
      <ProfileSelectCardContent name={card.name} avatarSrc={model.avatarSrc} />
    </Box>
  );
}

export interface StaticCardProps {
  card: UiProfileSelectCardProps;
  model: ProfileSelectCardModel;
}

// The unwired card: static, non-interactive content — no button role, no
// tabindex, and no ARIA of any kind, not even `aria-disabled` (§3.3/§6.2). The
// content tree is identical to the wired branch, so the reading order never
// changes, and the menu never renders even if `open` was passed.
function StaticCard({ card, model }: Readonly<StaticCardProps>): React.ReactElement {
  return (
    <Box component="div" id={card.id} sx={model.triggerSx}>
      <ProfileSelectCardContent name={card.name} avatarSrc={model.avatarSrc} />
    </Box>
  );
}

/** Picks the wired or static shell; both paint the identical closed card. */
export function ProfileSelectTrigger(
  props: Readonly<ProfileSelectTriggerProps>
): React.ReactElement {
  const { card, model, handlers } = props;
  if (model.interactive) {
    return <WiredTrigger card={card} model={model} handlers={handlers} />;
  }
  return <StaticCard card={card} model={model} />;
}
