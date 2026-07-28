import { CAL_ACTIVE, CAL_ACTIVE_OTHER, CAL_REST } from './fixtures';
import { calendarNode, paginationNode, uploadNode } from './media-nodes';
import type { GroupSpec } from './types';

export const MEDIA_GROUPS: GroupSpec[] = [
  {
    title: 'Календар (діапазон дат)',
    width: 320,
    states: [
      { label: 'Rest', node: calendarNode({ value: CAL_REST }) },
      { label: 'Hover', node: calendarNode({ value: CAL_REST, hover: true }) },
      { label: 'Active', node: calendarNode({ value: CAL_ACTIVE }) },
      { label: 'Active (other month)', node: calendarNode({ value: CAL_ACTIVE_OTHER }) },
    ],
  },
  {
    title: 'Пагінація',
    width: 685,
    states: [
      { label: 'Rest', node: paginationNode({ value: 1 }) },
      { label: 'Hover', node: paginationNode({ value: 1, hover: true }) },
      { label: 'Current', node: paginationNode({ value: 2 }) },
      { label: 'Disabled', node: paginationNode({ value: 2, disabled: true }) },
    ],
  },
  {
    title: 'Завантаження файлу',
    width: 422,
    states: [
      { label: 'Rest', node: uploadNode({}) },
      { label: 'Hover', node: uploadNode({ hover: true }) },
      { label: 'Disabled', node: uploadNode({ disabled: true }) },
      { label: 'Error', node: uploadNode({ error: true }) },
    ],
  },
];
