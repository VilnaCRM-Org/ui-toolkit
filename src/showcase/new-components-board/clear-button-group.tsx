import { clearButtonNode } from './followup-nodes-b';
import { fourStates } from './four-states';
import type { GroupSpec } from './types';

// The Figma clear row hugs its own board copy at 152px (Board A y=1699,
// node 451:25793 rest / 451:25797 hover / 451:25801 active / 451:25805
// disabled). No fill, border, radius or shadow in any state — only the
// label/glyph ink.
export const CLEAR_BUTTON_GROUPS: GroupSpec[] = [
  {
    title: 'Очистити фільтри',
    width: 152,
    states: fourStates({
      rest: clearButtonNode({}),
      hover: clearButtonNode({ hover: true }),
      third: { label: 'Active', node: clearButtonNode({ active: true }) },
      disabled: clearButtonNode({ disabled: true }),
    }),
  },
];
