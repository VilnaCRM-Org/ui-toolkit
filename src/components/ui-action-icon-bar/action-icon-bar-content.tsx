import React from 'react';

import { ActionButton } from './action-button';
import type { UiActionIconBarAction } from './types';

export interface ActionIconBarContentProps {
  actions: readonly UiActionIconBarAction[];
  barDisabled: boolean;
}

// The row's children, in array order — which is paint order AND tab order, since
// every wired action is an independent tab stop (there is no roving tabindex).
// The same tree is rendered under the `role="group"` root and under the static
// one, so the reading order never changes between the two branches.
export function ActionIconBarContent({
  actions,
  barDisabled,
}: Readonly<ActionIconBarContentProps>): React.ReactElement {
  return (
    <>
      {actions.map((action: UiActionIconBarAction, index: number) => (
        <ActionButton
          key={action.id ?? `${action.icon}-${index}`}
          action={action}
          barDisabled={barDisabled}
        />
      ))}
    </>
  );
}
