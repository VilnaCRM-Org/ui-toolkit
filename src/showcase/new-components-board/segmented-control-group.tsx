import { segmentedControlNode } from './followup-nodes-c';
import type { GroupSpec } from './types';

// The Figma track is 339px wide (Board B, node 439:19374; rest 439:19868 /
// hover 439:19877 — the only two states painted, D-15). The hover frame
// shows the selected first segment AND a translucent hover pill on the
// second — both painted at once, never a "which wins" conflict.
export const SEGMENTED_CONTROL_GROUPS: GroupSpec[] = [
  {
    title: 'Перемикач періоду',
    width: 339,
    states: [
      { label: 'Rest', node: segmentedControlNode({}) },
      { label: 'Hover', node: segmentedControlNode({ hover: true }) },
    ],
  },
];
