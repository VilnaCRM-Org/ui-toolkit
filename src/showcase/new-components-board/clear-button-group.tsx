import { clearButtonNode } from './followup-nodes-b';
import type { GroupSpec } from './types';

// The Figma clear row hugs its own board copy at 152px (Board A y=1699,
// node 451:25793 rest / 451:25797 hover / 451:25801 active / 451:25805
// disabled). No fill, border, radius or shadow in any state — only the
// label/glyph ink.
export const CLEAR_BUTTON_GROUPS: GroupSpec[] = [
  {
    title: 'Очистити фільтри',
    width: 152,
    states: [
      { label: 'Rest', node: clearButtonNode({}) },
      { label: 'Hover', node: clearButtonNode({ hover: true }) },
      { label: 'Active', node: clearButtonNode({ active: true }) },
      { label: 'Disabled', node: clearButtonNode({ disabled: true }) },
    ],
  },
];
