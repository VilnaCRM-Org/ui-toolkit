import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import type { MenuFocusContext } from './menu-refs';
import { ProfileSelectMenuItem } from './profile-select-menu-item';
import type { ProfileSelectCardModel } from './profile-select-model';
import type { ProfileSelectItem } from './types';
import { useMenuHandlers, type MenuHandlers } from './use-menu-handlers';

export interface ProfileSelectMenuProps {
  ctx: MenuFocusContext;
  id: string;
  /** The trigger's id — the APG menu-button shape names the menu after it (§2.5). */
  labelledBy: string;
  items: ProfileSelectItem[];
  sx: SxProps<Theme>;
}

/**
 * The action popup: a `role="menu"` holding one `role="menuitem"` button per
 * command. It renders IN PLACE, absolutely positioned 11px below the trigger —
 * no portal, because portaling would change Tab semantics (a11y contract §2.4).
 *
 * It carries no `aria-label` (§2.5), no live region (§8.1) and no transition
 * (§9.1).
 */
function ProfileSelectMenu({
  ctx,
  id,
  labelledBy,
  items,
  sx,
}: Readonly<ProfileSelectMenuProps>): React.ReactElement {
  const handlers: MenuHandlers = useMenuHandlers(ctx);
  return (
    <Box
      role="menu"
      id={id}
      aria-labelledby={labelledBy}
      ref={ctx.refs.menu}
      onKeyDown={handlers.onKeyDown}
      onFocus={handlers.onFocus}
      onBlur={handlers.onBlur}
      sx={sx}
    >
      {items.map((item: ProfileSelectItem) => (
        <ProfileSelectMenuItem key={item.id} item={item} onActivate={handlers.onActivate} />
      ))}
    </Box>
  );
}

export interface ProfileSelectMenuSlotProps {
  model: ProfileSelectCardModel;
  sx: SxProps<Theme>;
}

/**
 * Mounts the menu only while it is really open. The menu is UNMOUNTED when
 * closed, never `display:none`/`visibility:hidden` (§2.3), and an empty `items`
 * list never produces an empty `role="menu"` (§3.4) — `model.menuOpen` already
 * folds both that and the disabled dominance of §6.3 in.
 */
export function ProfileSelectMenuSlot({
  model,
  sx,
}: Readonly<ProfileSelectMenuSlotProps>): React.ReactElement | null {
  if (!model.menuOpen) {
    return null;
  }
  return (
    <ProfileSelectMenu
      ctx={model.ctx}
      id={model.menuId}
      labelledBy={model.triggerId}
      items={model.items}
      sx={sx}
    />
  );
}
