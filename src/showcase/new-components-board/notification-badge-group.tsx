import { notificationBadgeNode } from './micro-badge-nodes';
import type { GroupSpec } from './types';

// The button circle is 48px, but the ACTIVE master's painted bounds are 54x50 —
// the counter chip overhangs the circle by 4px and gains another 2px of ring when
// active — so the tile is 54 wide and must never clip. The chip's ring is cut out
// of the page surface rather than painted white, which is why the board's own
// #FBFBFB background is what makes the Active tile read as Figma draws it.
// "Count 9+" is the `max` cap rendering, a real prop and never forced; the Static
// tile drops `onActivate`, leaving pure decoration with no name of its own.
export const NOTIFICATION_BADGE_GROUPS: GroupSpec[] = [
  {
    title: 'Бейдж сповіщень',
    width: 54,
    states: [
      { label: 'Rest', node: notificationBadgeNode({}) },
      { label: 'Hover', node: notificationBadgeNode({ hover: true }) },
      { label: 'Active', node: notificationBadgeNode({ active: true }) },
      { label: 'Disabled', node: notificationBadgeNode({ disabled: true }) },
      { label: 'Count 9+', node: notificationBadgeNode({ count: 12 }) },
      { label: 'Static', node: notificationBadgeNode({ staticBadge: true }) },
    ],
  },
];
