import { statusBadgeNode } from './micro-badge-nodes';
import type { GroupSpec } from './types';

// The Figma master is a bare 26x26 check-circle (board row y=1790), so the tile
// width is the master's own 26. Every delta between the four states is
// COLOUR-ONLY — nothing here may move. A non-interactive badge has no `:hover`
// rule at all (the recipe exists only on the wired branch), so the Hover tile
// forces the interactive recipe through the root class hook: that is the tile's
// whole purpose. Disabled derives from ACTIVE, not from rest — a solid fill with a
// white check, desaturated — so a disabled badge reads "done and frozen", never
// "empty". The Static tile paints `active` deliberately (Ruling 4): its
// `role="img"` name is what exposes the state, so no dev warning fires.
export const STATUS_BADGE_GROUPS: GroupSpec[] = [
  {
    title: 'Бейдж статусу',
    width: 26,
    states: [
      { label: 'Rest', node: statusBadgeNode({}) },
      { label: 'Hover', node: statusBadgeNode({ hover: true }) },
      { label: 'Active', node: statusBadgeNode({ active: true }) },
      { label: 'Disabled', node: statusBadgeNode({ disabled: true }) },
      { label: 'Static', node: statusBadgeNode({ active: true, staticBadge: true }) },
    ],
  },
];
