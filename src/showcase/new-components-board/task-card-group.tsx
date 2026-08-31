import { taskCardNode } from './nodes';
import type { GroupSpec } from './types';

// The Figma master is 372px wide; board screens stack the same anatomy at 561/770,
// so the tile width comes straight from the master.
export const TASK_CARD_GROUPS: GroupSpec[] = [
  {
    title: 'Картка завдання (Дошка)',
    width: 372,
    states: [
      { label: 'Rest', node: taskCardNode({}) },
      { label: 'Hover', node: taskCardNode({ hover: true }) },
      { label: 'Disabled', node: taskCardNode({ disabled: true }) },
      { label: 'Static', node: taskCardNode({ staticCard: true }) },
      { label: 'Unassigned', node: taskCardNode({ unassigned: true }) },
    ],
  },
];
