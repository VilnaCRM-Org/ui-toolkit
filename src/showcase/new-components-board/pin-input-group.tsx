import { PIN_SAMPLE } from './fixtures';
import { pinInputNode } from './micro-nodes';
import type { GroupSpec } from './types';

// The Figma "2FA item" master (72:5172) IS a single 64x86 cell — the design ships
// no group, no gap and no separator — so the group width is the master's own 64
// and the single-cell tiles are one-cell fields. The 12px inter-cell gap is a
// ruling, not a Figma fact, which is what the six-cell tile draws: 6*64 + 5*12 =
// 444. Figma's "Active" column is the FOCUSED cell (shadow + caret), and the error
// tile is wider so its helper text — the non-colour channel — reads on one line.
export const PIN_INPUT_GROUPS: GroupSpec[] = [
  {
    title: 'Поле PIN-коду (2FA)',
    width: 64,
    states: [
      { label: 'Rest', node: pinInputNode({}) },
      { label: 'Hover', node: pinInputNode({ hover: true }) },
      { label: 'Active', node: pinInputNode({ focus: true }) },
      { label: 'Disabled', node: pinInputNode({ disabled: true }) },
      { label: 'Error', node: pinInputNode({ error: true }), width: 240 },
      {
        label: 'Group (6 cells)',
        node: pinInputNode({ length: 6, value: PIN_SAMPLE }),
        width: 444,
      },
    ],
  },
];
