import { INTEGRATION_CARDS } from './fixtures';
import { integrationCardNode } from './nodes';
import type { GroupSpec } from './types';

const [HUBSPOT, AMOCRM] = INTEGRATION_CARDS;

// The Figma master is 312px wide (Cards frame, node 439:19893), so the tile width
// comes straight from it. Figma draws no disabled master for this card, so the
// board draws none either (a11y contract Escalation 1: disabled is semantics-only).
// "Selected + Hover" forces the SAME hover recipe the Hover tile does — it stays
// unpainted there, because the recipe keeps the component's own
// `:not([aria-checked="true"])` gate, which is exactly the §7.4 precedence rule
// (selected dominates hover) drawn on the board. The static tile uses the second
// master so both brand marks are on screen.
export const INTEGRATION_CARD_GROUPS: GroupSpec[] = [
  {
    title: 'Картка інтеграції',
    width: 312,
    states: [
      { label: 'Rest', node: integrationCardNode({ brand: HUBSPOT }) },
      { label: 'Hover', node: integrationCardNode({ brand: HUBSPOT, hover: true }) },
      { label: 'Selected', node: integrationCardNode({ brand: HUBSPOT, selected: true }) },
      {
        label: 'Selected + Hover',
        node: integrationCardNode({ brand: HUBSPOT, selected: true, hover: true }),
      },
      { label: 'Static', node: integrationCardNode({ brand: AMOCRM, staticCard: true }) },
    ],
  },
];
