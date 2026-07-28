import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { UiItemRow, UiSearchInput, UiTaskCard } from '@/components';
import type { ItemRowMethod } from '@/components/ui-item-row/types';
import type { TaskAssignee } from '@/components/ui-task-card/types';

import { SUGGESTIONS, TASK_AVATAR_SRC } from './fixtures';
import {
  SEARCH_ACTIVE_SX,
  SEARCH_HOVER_SX,
  SEARCH_MOBILE_PAPER_SX,
  SEARCH_TABLET_SX,
  TASK_CARD_HOVER_SX,
} from './styles';

// The assignee of the Figma task-card master: the design's own sample person and
// the photo it draws, so the tiles match the master pixel for pixel.
const TASK_ASSIGNEE: TaskAssignee = { name: 'Евгения Маслова', avatarSrc: TASK_AVATAR_SRC };

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
  muted?: boolean;
  expanded?: boolean;
  sx?: SxProps<Theme>;
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
