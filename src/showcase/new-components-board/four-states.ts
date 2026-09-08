import type React from 'react';

import type { StateSpec } from './types';

export interface FourStateNodes {
  rest: React.ReactNode;
  hover: React.ReactNode;
  /**
   * The third tile. Most Board A follow-up controls paint a pointer-pressed
   * `Active`; the option card paints `Selected`, which is a different word AND
   * a different flag on its own factory — so the caller names it.
   */
  third: { label: string; node: React.ReactNode };
  disabled: React.ReactNode;
}

/**
 * The four-tile row every Board A follow-up control paints. The labels and
 * their order live here once so the groups cannot drift apart in what they show
 * or what they call it; each control still builds its own nodes, because the
 * flags that force each state belong to that control's own tile factory.
 */
export function fourStates(nodes: Readonly<FourStateNodes>): StateSpec[] {
  return [
    { label: 'Rest', node: nodes.rest },
    { label: 'Hover', node: nodes.hover },
    { label: nodes.third.label, node: nodes.third.node },
    { label: 'Disabled', node: nodes.disabled },
  ];
}
