import { multiSelectNode, radioNode, selectNode } from './field-nodes';
import { PICKED, PICKED3 } from './fixtures';
import { searchNode } from './nodes';
import type { GroupSpec } from './types';

export const FIELD_GROUPS: GroupSpec[] = [
  {
    title: 'Пошук',
    width: 477,
    states: [
      { label: 'Rest', node: searchNode({}) },
      { label: 'Hover', node: searchNode({ hover: true }) },
      { label: 'Open', tall: true, node: searchNode({ open: true }) },
      { label: 'Tablet — Rest', width: 360, node: searchNode({ tablet: true }) },
      { label: 'Tablet — Hover', width: 360, node: searchNode({ tablet: true, hover: true }) },
      {
        label: 'Tablet — Open',
        width: 360,
        tall: true,
        node: searchNode({ tablet: true, open: true }),
      },
      { label: 'Mobile — Rest', width: 355, node: searchNode({}) },
      { label: 'Mobile — Hover', width: 355, node: searchNode({ hover: true }) },
      {
        label: 'Mobile — Open',
        width: 355,
        tall: true,
        node: searchNode({ open: true, mobilePaper: true }),
      },
    ],
  },
  {
    title: 'Select з пошуком',
    width: 262,
    states: [
      { label: 'Rest', node: selectNode({}) },
      { label: 'Hover', node: selectNode({ hover: true }) },
      { label: 'Open', tall: true, node: selectNode({ open: true }) },
    ],
  },
  {
    title: 'Multiselect',
    width: 430,
    states: [
      { label: 'Filled', node: multiSelectNode({ value: PICKED }) },
      { label: 'Filled ×3', node: multiSelectNode({ value: PICKED3 }) },
      { label: 'Item hover', node: multiSelectNode({ value: PICKED, hover: true }) },
      { label: 'Empty', node: multiSelectNode({ value: [] }) },
      { label: 'Open', tall: true, node: multiSelectNode({ value: PICKED, open: true }) },
    ],
  },
  {
    title: 'Radio button',
    width: 262,
    states: [{ label: 'Selected', node: radioNode() }],
  },
];
