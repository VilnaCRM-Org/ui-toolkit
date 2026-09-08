import { socialIconButtonRowNode } from './followup-nodes-c';
import type { GroupSpec } from './types';

// The Figma row is four 40x40 chips at 48px pitch (Board A y=493, rest
// 439:19285 / hover 439:19296 / active 439:19307 / disabled 439:19318). One
// chip is the component; a row of four is the board's own composition, so
// every tile paints all four networks at the board's own 8px gap:
// 4*40 + 3*8 = 184.
export const SOCIAL_ICON_BUTTON_GROUPS: GroupSpec[] = [
  {
    title: 'Кнопка соцмережі',
    width: 184,
    states: [
      { label: 'Rest', node: socialIconButtonRowNode({}) },
      { label: 'Hover', node: socialIconButtonRowNode({ hover: true }) },
      { label: 'Active', node: socialIconButtonRowNode({ active: true }) },
      { label: 'Disabled', node: socialIconButtonRowNode({ disabled: true }) },
    ],
  },
];
