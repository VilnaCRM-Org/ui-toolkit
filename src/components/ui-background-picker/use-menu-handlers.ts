import React from 'react';

import { handleRowActivate } from './picker-actions';
import { handleMenuKeyDown } from './picker-keyboard';
import type { PickerCtx } from './picker-refs';

/** The handlers the `role="menu"` element and its rows are wired with. */
export interface MenuActionHandlers {
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onRowActivate: (id: string) => void;
}

export function useMenuActionHandlers(ctx: PickerCtx): MenuActionHandlers {
  const onKeyDown: MenuActionHandlers['onKeyDown'] = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => handleMenuKeyDown(ctx, event),
    [ctx]
  );
  const onRowActivate: MenuActionHandlers['onRowActivate'] = React.useCallback(
    (id: string): void => handleRowActivate(ctx, id),
    [ctx]
  );
  return { onKeyDown, onRowActivate };
}
