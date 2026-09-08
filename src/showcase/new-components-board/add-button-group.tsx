import { addButtonNode } from './followup-nodes-b';
import { fourStates } from './four-states';
import type { GroupSpec } from './types';

// The Figma "plus" chip hugs its own board copy at 178px (Board A y=1640,
// node 451:25777 rest / 451:25781 hover / 451:25785 active / 451:25789
// disabled). Hover and active differ only by border colour — active's is
// the LIGHTER one, kept exactly as painted.
export const ADD_BUTTON_GROUPS: GroupSpec[] = [
  {
    title: 'Кнопка додавання',
    width: 178,
    states: fourStates({
      rest: addButtonNode({}),
      hover: addButtonNode({ hover: true }),
      third: { label: 'Active', node: addButtonNode({ active: true }) },
      disabled: addButtonNode({ disabled: true }),
    }),
  },
];
