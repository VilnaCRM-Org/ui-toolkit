import { backgroundPickerNode } from './followup-nodes-a';
import type { GroupSpec } from './types';

// The Figma card is 220px wide (Board A y=1114, node 439:19673 rest /
// 439:19677 hover / 439:19689 open / 439:19715 disabled). The "Active"
// column IS the open menu, not a pointer-pressed state; the open card grows
// downward in normal flow, so its tile reserves the extra vertical room.
export const BACKGROUND_PICKER_GROUPS: GroupSpec[] = [
  {
    title: 'Фон дошки',
    width: 220,
    states: [
      { label: 'Rest', node: backgroundPickerNode({}) },
      { label: 'Hover', node: backgroundPickerNode({ hover: true }) },
      { label: 'Open', tall: true, node: backgroundPickerNode({ open: true }) },
      { label: 'Disabled', node: backgroundPickerNode({ disabled: true }) },
    ],
  },
];
