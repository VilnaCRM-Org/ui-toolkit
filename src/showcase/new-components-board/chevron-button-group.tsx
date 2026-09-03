import { chevronButtonNode } from './followup-nodes-b';
import type { GroupSpec } from './types';

// The Figma circle is 30x30 (Board A y=1622, node 451:25765 rest / 451:25768
// hover / 451:25771 active / 451:25774 disabled). Glyph ink never changes —
// only the fill/border/shadow repaint between states.
export const CHEVRON_BUTTON_GROUPS: GroupSpec[] = [
  {
    title: 'Кнопка-шеврон',
    width: 30,
    states: [
      { label: 'Rest', node: chevronButtonNode({}) },
      { label: 'Hover', node: chevronButtonNode({ hover: true }) },
      { label: 'Active', node: chevronButtonNode({ active: true }) },
      { label: 'Disabled', node: chevronButtonNode({ disabled: true }) },
    ],
  },
];
