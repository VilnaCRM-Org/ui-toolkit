import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { UiActionIconBar, UiNotificationBadge, UiStatusBadge } from '@/components';
import type { UiActionIconBarAction } from '@/components/ui-action-icon-bar/types';

import { BAR_ACTIONS, type ActionSample } from './fixtures';
import {
  ICON_BAR_ACTIVE_SX,
  ICON_BAR_HOVER_SX,
  NOTIFICATION_ACTIVE_SX,
  NOTIFICATION_HOVER_SX,
  STATUS_BADGE_HOVER_SX,
} from './micro-styles';

// The icon bar and the two badges live beside `micro-nodes.tsx` rather than in it:
// six builders in one module pushes the file past its maintainability floor, which
// is the same `media-nodes.tsx` split the field tiles already use.

// A wired tile needs a callback to render as a control; the showcase tiles are
// static screenshots, so every wired one shares this stable no-op.
function noop(): void {}

export interface IconBarTileOptions {
  hover?: boolean;
  active?: boolean;
  disabled?: boolean;
  pressed?: boolean;
  staticBar?: boolean;
}

// The six Figma actions, wired or static. Only the eye is a toggle — it is the one
// action with a `pressed` axis — and every other action gets the plain activation
// path. A static bar drops the toggle callback, so it drops the eye's `pressed`
// with it: state the static branch cannot expose is state it must not be handed
// (S2), and that is what keeps a `pressed` from landing where it would be ignored
// and dev-warn.
function barActions(opts: Readonly<IconBarTileOptions>): UiActionIconBarAction[] {
  const wire: (() => void) | undefined = opts.staticBar ? undefined : noop;
  const eyePressed: boolean | undefined = opts.staticBar ? undefined : opts.pressed;
  return BAR_ACTIONS.map((sample: ActionSample) => ({
    icon: sample.icon,
    label: sample.label,
    onActivate: sample.icon === 'eye' ? undefined : wire,
    onToggle: sample.icon === 'eye' ? wire : undefined,
    pressed: sample.icon === 'eye' ? eyePressed : undefined,
  }));
}

// Builds an icon-bar tile rendering all six actions in Figma order, so the parity
// reviewer sees the whole row at once. Hover and press are pointer-gated per lane,
// so both are forced through the bar's own `sx`.
export function actionIconBarNode(opts: Readonly<IconBarTileOptions>): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.hover ? [ICON_BAR_HOVER_SX] : []),
    ...(opts.active ? [ICON_BAR_ACTIVE_SX] : []),
  ];
  return (
    <UiActionIconBar
      label="Дії над рядком"
      actions={barActions(opts)}
      disabled={opts.disabled}
      sx={sx}
    />
  );
}

export interface StatusBadgeTileOptions {
  active?: boolean;
  hover?: boolean;
  disabled?: boolean;
  staticBadge?: boolean;
}

// Held in consts so each Cyrillic literal stays inside the byte-based line budget.
const TOGGLE_LABEL: string = 'Виконано';
const DONE_LABEL: string = 'Завдання виконано';
const NOT_DONE_LABEL: string = 'Завдання не виконано';

// The two label regimes, drawn on the board. A wired badge carries `aria-pressed`,
// so its name must be CONSTANT and state-free; a static `role="img"` badge has no
// state attribute at all, so its name must NAME the state being painted — that
// name is the colour-only mitigation.
function statusBadgeLabel(opts: Readonly<StatusBadgeTileOptions>): string {
  if (!opts.staticBadge) {
    return TOGGLE_LABEL;
  }
  return opts.active ? DONE_LABEL : NOT_DONE_LABEL;
}

// Builds a status-badge tile. A non-interactive badge has no `:hover` rule at all,
// so the hover tile forces the interactive recipe through the root class hook —
// that is the tile's whole purpose.
export function statusBadgeNode(opts: Readonly<StatusBadgeTileOptions>): React.ReactElement {
  const badge = (
    <UiStatusBadge
      label={statusBadgeLabel(opts)}
      active={opts.active}
      disabled={opts.disabled}
      onToggle={opts.staticBadge ? undefined : noop}
    />
  );
  return opts.hover ? <Box sx={STATUS_BADGE_HOVER_SX}>{badge}</Box> : badge;
}

export interface NotificationTileOptions {
  count?: number;
  hover?: boolean;
  active?: boolean;
  disabled?: boolean;
  staticBadge?: boolean;
}

// Builds a notification-badge tile. Hover and the pressed/expanded chrome are
// gated, so both are forced through the badge's own `sx`; the chip's active ring
// is cut out of the page surface, which the board already paints #FBFBFB.
export function notificationBadgeNode(opts: Readonly<NotificationTileOptions>): React.ReactElement {
  const sx: SxProps<Theme> = [
    ...(opts.hover ? [NOTIFICATION_HOVER_SX] : []),
    ...(opts.active ? [NOTIFICATION_ACTIVE_SX] : []),
  ];
  return (
    <UiNotificationBadge
      count={opts.count ?? 1}
      disabled={opts.disabled}
      onActivate={opts.staticBadge ? undefined : noop}
      sx={sx}
    />
  );
}
