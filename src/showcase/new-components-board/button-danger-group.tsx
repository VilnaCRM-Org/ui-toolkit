import { dangerButtonNode } from './followup-nodes-a';
import { fourStates } from './four-states';
import type { GroupSpec } from './types';

// The Figma "Cancel" pill is 98x42 (Board A y=1354, node 439:19822 rest /
// 439:19824 hover / 439:19826 active / 439:19828 disabled) — the `UiButton`
// `name="danger"` variant, not a new module (Story 3.7 §2). Active is
// deliberately LIGHTER than hover, kept exactly as painted.
export const BUTTON_DANGER_GROUPS: GroupSpec[] = [
  {
    title: 'Небезпечна кнопка',
    width: 98,
    states: fourStates({
      rest: dangerButtonNode({}),
      hover: dangerButtonNode({ hover: true }),
      third: { label: 'Active', node: dangerButtonNode({ active: true }) },
      disabled: dangerButtonNode({ disabled: true }),
    }),
  },
];
