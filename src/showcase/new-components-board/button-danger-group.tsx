import { dangerButtonNode } from './followup-nodes-a';
import type { GroupSpec } from './types';

// The Figma "Cancel" pill is 98x42 (Board A y=1354, node 439:19822 rest /
// 439:19824 hover / 439:19826 active / 439:19828 disabled) — the `UiButton`
// `name="danger"` variant, not a new module (Story 3.7 §2). Active is
// deliberately LIGHTER than hover, kept exactly as painted.
export const BUTTON_DANGER_GROUPS: GroupSpec[] = [
  {
    title: 'Небезпечна кнопка',
    width: 98,
    states: [
      { label: 'Rest', node: dangerButtonNode({}) },
      { label: 'Hover', node: dangerButtonNode({ hover: true }) },
      { label: 'Active', node: dangerButtonNode({ active: true }) },
      { label: 'Disabled', node: dangerButtonNode({ disabled: true }) },
    ],
  },
];
