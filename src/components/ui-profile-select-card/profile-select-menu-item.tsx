import { Box } from '@mui/material';
import React from 'react';

import { menuItemSx } from './styles';
import type { ProfileSelectItem } from './types';

export interface ProfileSelectMenuItemProps {
  item: ProfileSelectItem;
  onActivate: (itemId: string) => void;
}

/**
 * One menu command: a native `<button type="button" role="menuitem">`, a direct
 * child of the `role="menu"` container with no `<li>` interposition (a11y
 * contract §2.2). Native activation is the whole point — Enter and Space fire a
 * click on their own, so there is no key handler here and nothing double-fires.
 *
 * `tabIndex={-1}` keeps the menu at zero tab stops; focus arrives only through
 * the component's own `.focus()` calls (§4.3 forbids roving tabindex and
 * `aria-activedescendant` alike). The visible label IS the accessible name (§5.4).
 *
 * The click handler is memoised on the row's own id and on `onActivate`, and
 * both are genuinely stable now that the action context is memoised upstream
 * (`useMenuRuntime`, Amendment A2) — before that the dependency changed on every
 * commit and the memoisation bought nothing.
 */
export function ProfileSelectMenuItem({
  item,
  onActivate,
}: Readonly<ProfileSelectMenuItemProps>): React.ReactElement {
  const itemId: string = item.id;
  const handleClick: () => void = React.useCallback(
    (): void => onActivate(itemId),
    [itemId, onActivate]
  );
  return (
    <Box
      component="button"
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={handleClick}
      sx={menuItemSx}
    >
      {item.label}
    </Box>
  );
}
