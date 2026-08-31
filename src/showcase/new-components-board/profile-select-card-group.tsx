import { profileSelectCardNode } from './nodes';
import type { GroupSpec } from './types';

// The Figma master is 225px wide (Cards frame, node 439:19893), so the tile width
// comes straight from it. The open tile is `tall`: the menu hangs 11px below a 48px
// trigger and is 136px high, so the tile has to reserve the whole ~195px stack.
export const PROFILE_SELECT_CARD_GROUPS: GroupSpec[] = [
  {
    title: 'Картка профілю (меню)',
    width: 225,
    states: [
      { label: 'Rest', node: profileSelectCardNode({}) },
      { label: 'Hover', node: profileSelectCardNode({ hover: true }) },
      { label: 'Open', tall: true, node: profileSelectCardNode({ open: true }) },
      { label: 'Disabled', node: profileSelectCardNode({ disabled: true }) },
      { label: 'Static', node: profileSelectCardNode({ staticCard: true }) },
    ],
  },
];
