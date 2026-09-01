import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import UiIntegrationCard from '@/components/ui-integration-card';
import UiItemRow from '@/components/ui-item-row';
import type { ItemRowMethod } from '@/components/ui-item-row/types';
import UiProfileSelectCard from '@/components/ui-profile-select-card';
import UiSearchInput from '@/components/ui-search-input';
import UiTaskCard from '@/components/ui-task-card';
import type { TaskAssignee } from '@/components/ui-task-card/types';

import {
  PROFILE_AVATAR_SRC,
  PROFILE_ITEMS,
  SUGGESTIONS,
  TASK_AVATAR_SRC,
  type IntegrationSample,
} from './fixtures';
import {
  INTEGRATION_CARD_HOVER_SX,
  PROFILE_CARD_HOVER_SX,
  PROFILE_MENU_ROW_HOVER_SX,
  SEARCH_ACTIVE_SX,
  SEARCH_HOVER_SX,
  SEARCH_MOBILE_PAPER_SX,
  SEARCH_TABLET_SX,
  TASK_CARD_HOVER_SX,
} from './styles';

// The assignee of the Figma task-card master: the design's own sample person and
// the photo it draws, so the tiles match the master pixel for pixel.
const TASK_ASSIGNEE: TaskAssignee = {
  name: 'Евгения Маслова',
  avatarSrc: TASK_AVATAR_SRC,
};

// Builds a search-field tile for a size/state combination. Responsive sizing is
// viewport-gated and hover/open visuals are pointer-gated, so each is forced here.
export function searchNode(opts: {
  tablet?: boolean;
  hover?: boolean;
  open?: boolean;
  mobilePaper?: boolean;
}): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.tablet ? [SEARCH_TABLET_SX] : []),
    ...(opts.hover ? [SEARCH_HOVER_SX] : []),
    ...(opts.open ? [SEARCH_ACTIVE_SX] : []),
    ...(opts.mobilePaper ? [SEARCH_MOBILE_PAPER_SX] : []),
  ];
  return (
    <Box sx={sx}>
      <UiSearchInput
        aria-label="Пошук"
        placeholder="Щось шукаєте?"
        options={SUGGESTIONS}
        value={opts.open ? 'Топ прод' : undefined}
        open={opts.open || undefined}
        disablePortal={opts.open || undefined}
      />
    </Box>
  );
}

// A wired tile needs a handler to render as a button; the showcase tiles are
// static screenshots, so every wired one shares this stable no-op.
function noop(): void {}

// Builds an item-row tile. Rest/muted render straight from props; hover and mobile
// are forced through `sx` (media/pointer-gated in the component). The expanded tile
// is a wired row (noop toggle) so its chevron flips up and tints to the accent.
export function itemRowNode(opts: {
  method: ItemRowMethod;
  path: string;
  description: string;
  muted?: boolean | undefined;
  expanded?: boolean | undefined;
  sx?: SxProps<Theme> | undefined;
}): React.ReactElement {
  return (
    <UiItemRow
      method={opts.method}
      path={opts.path}
      description={opts.description}
      muted={opts.muted}
      expanded={opts.expanded}
      onToggle={opts.expanded ? noop : undefined}
      sx={opts.sx}
    />
  );
}

// Builds a task-card tile on the master's own content. Disabled and unassigned
// render straight from props; the static tile drops `onActivate` (no button role);
// the hover recipe is pointer-gated, so it is forced through a wrapping `sx`.
export function taskCardNode(opts: {
  unassigned?: boolean;
  disabled?: boolean;
  staticCard?: boolean;
  hover?: boolean;
}): React.ReactElement {
  const card = (
    <UiTaskCard
      title="Подготовить бриф для заказчика @zakazchik"
      deadlineLabel="Дедлайн"
      deadline="12.09 15:00"
      assignee={opts.unassigned ? undefined : TASK_ASSIGNEE}
      disabled={opts.disabled}
      onActivate={opts.staticCard ? undefined : noop}
    />
  );
  return opts.hover ? <Box sx={TASK_CARD_HOVER_SX}>{card}</Box> : card;
}

// The person the profile-select-card master draws, beside the master's own photo.
const PROFILE_NAME: string = 'Евгения Маслова';

interface ProfileTileOptions {
  open?: boolean;
  disabled?: boolean;
  staticCard?: boolean;
  hover?: boolean;
}

// Both forced visuals ride the card's own `sx`, which lands on the positioning
// wrapper: the trigger is its direct child, and the menu (while open) is the
// other. The card hover recipe is pointer-gated, and the master's open frame
// captures the middle command under the pointer, so a static tile re-applies each.
function profileTileSx(opts: ProfileTileOptions): SxProps<Theme> {
  return [
    ...(opts.hover ? [PROFILE_CARD_HOVER_SX] : []),
    ...(opts.open ? [PROFILE_MENU_ROW_HOVER_SX] : []),
  ];
}

// Builds a profile-card tile on the master's own person, photo and commands. The
// open tile is wired (a no-op `onOpenChange` makes it a menu button) so the menu
// really mounts 11px below the trigger; the static tile drops the handler, which
// leaves plain content with no ARIA and no menu at all.
export function profileSelectCardNode(opts: ProfileTileOptions): React.ReactElement {
  return (
    <UiProfileSelectCard
      name={PROFILE_NAME}
      avatarSrc={PROFILE_AVATAR_SRC}
      items={PROFILE_ITEMS}
      open={opts.open}
      disabled={opts.disabled}
      onOpenChange={opts.staticCard ? undefined : noop}
      sx={profileTileSx(opts)}
    />
  );
}

interface IntegrationTileOptions {
  brand: IntegrationSample;
  selected?: boolean;
  hover?: boolean;
  staticCard?: boolean;
}

// Builds an integration-card tile on a master's own brand and mark. The static
// tile drops `onSelect`, which leaves plain content with no ARIA at all; every
// other tile is wired, so it is wrapped in the `role="radiogroup"` the card
// deliberately never renders for itself (a11y contract §1.2/§12.2) — the board is
// the CONSUMER here. The wrapper carries no `aria-label`: the tile's own visible
// state label names it, exactly as every other board group titles its states, and
// the component tree never carries one either (§5.1). The hover recipe is
// pointer-gated, so it is forced through the card's own `sx`.
export function integrationCardNode(opts: IntegrationTileOptions): React.ReactElement {
  const card = (
    <UiIntegrationCard
      name={opts.brand.name}
      logo={opts.brand.logo}
      selected={opts.selected}
      onSelect={opts.staticCard ? undefined : noop}
      sx={opts.hover ? INTEGRATION_CARD_HOVER_SX : undefined}
    />
  );
  if (opts.staticCard) {
    return card;
  }
  return <Box role="radiogroup">{card}</Box>;
}
