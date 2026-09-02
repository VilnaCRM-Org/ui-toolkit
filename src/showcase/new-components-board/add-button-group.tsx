import { addButtonNode } from './followup-nodes-b';
import type { GroupSpec } from './types';

// The Figma "plus" chip hugs its own board copy at 178px (Board A y=1640,
// node 451:25777 rest / 451:25781 hover / 451:25785 active / 451:25789
// disabled). Hover and active differ only by border colour — active's is
// the LIGHTER one, kept exactly as painted.
export const ADD_BUTTON_GROUPS: GroupSpec[] = [
  {
    title: 'Кнопка додавання',
    width: 178,
    states: [
      { label: 'Rest', node: addButtonNode({}) },
      { label: 'Hover', node: addButtonNode({ hover: true }) },
      { label: 'Active', node: addButtonNode({ active: true }) },
      { label: 'Disabled', node: addButtonNode({ disabled: true }) },
    ],
  },
];
