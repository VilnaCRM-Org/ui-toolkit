import { filterChipNode } from './micro-nodes';
import type { GroupSpec } from './types';

// The Figma "Tags" master is 256x30 (node 397:19014), so the tile width comes
// straight from it — 256 is only what the sample string measures, since the chip
// hugs its contents. Hover, Active and Focus are forced: `:hover`, `:active` and
// `:focus-visible` never fire under a static screenshot. "Active" is the PRESSED
// state (A2), not an "applied filter" variant — Figma ships no source for one.
// The Static tile drops `onRemove`, which leaves plain content with no role, no
// tab stop and no ARIA, and deliberately does NOT paint disabled.
export const FILTER_CHIP_GROUPS: GroupSpec[] = [
  {
    title: 'Чіп фільтра',
    width: 256,
    states: [
      { label: 'Rest', node: filterChipNode({}) },
      { label: 'Hover', node: filterChipNode({ hover: true }) },
      { label: 'Active', node: filterChipNode({ active: true }) },
      { label: 'Focus', node: filterChipNode({ focus: true }) },
      { label: 'Disabled', node: filterChipNode({ disabled: true }) },
      { label: 'Static', node: filterChipNode({ staticChip: true }) },
    ],
  },
];
