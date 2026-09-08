import { copyFieldNode } from './followup-nodes-c';
import { fourStates } from './four-states';
import type { GroupSpec } from './types';

// The Figma chip hugs its own board copy at 226px (Board A y=1729, node
// 451:25827 rest / 451:25831 hover / 451:25835 active / 451:25839
// disabled). The whole chip is one button — the hover/active target IS the
// chip, never a smaller nested control.
export const COPY_FIELD_GROUPS: GroupSpec[] = [
  {
    title: 'Поле копіювання коду',
    width: 226,
    states: fourStates({
      rest: copyFieldNode({}),
      hover: copyFieldNode({ hover: true }),
      third: { label: 'Active', node: copyFieldNode({ active: true }) },
      disabled: copyFieldNode({ disabled: true }),
    }),
  },
];
