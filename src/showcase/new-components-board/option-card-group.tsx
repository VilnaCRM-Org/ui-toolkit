import { optionCardNode } from './followup-nodes-a';
import { fourStates } from './four-states';
import type { GroupSpec } from './types';

// The Figma value box is 262px wide (Board A y=1486, node 439:19838 rest /
// 439:19845 hover / 439:19850 selected / 439:19855 disabled). "Active" is
// the SELECTED state, not a pointer-pressed one.
export const OPTION_CARD_GROUPS: GroupSpec[] = [
  {
    title: 'Картка опції',
    width: 262,
    states: fourStates({
      rest: optionCardNode({}),
      hover: optionCardNode({ hover: true }),
      third: { label: 'Selected', node: optionCardNode({ selected: true }) },
      disabled: optionCardNode({ disabled: true }),
    }),
  },
];
