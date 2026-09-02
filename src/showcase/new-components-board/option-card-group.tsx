import { optionCardNode } from './followup-nodes-a';
import type { GroupSpec } from './types';

// The Figma value box is 262px wide (Board A y=1486, node 439:19838 rest /
// 439:19845 hover / 439:19850 selected / 439:19855 disabled). "Active" is
// the SELECTED state, not a pointer-pressed one.
export const OPTION_CARD_GROUPS: GroupSpec[] = [
  {
    title: 'Картка опції',
    width: 262,
    states: [
      { label: 'Rest', node: optionCardNode({}) },
      { label: 'Hover', node: optionCardNode({ hover: true }) },
      { label: 'Selected', node: optionCardNode({ selected: true }) },
      { label: 'Disabled', node: optionCardNode({ disabled: true }) },
    ],
  },
];
