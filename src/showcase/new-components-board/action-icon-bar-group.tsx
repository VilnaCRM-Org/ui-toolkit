import { actionIconBarNode } from './micro-badge-nodes';
import type { GroupSpec } from './types';

// The six icons are loose, hand-placed instances with no auto-layout container, so
// the width is the MEASURED Figma row span (x 56 → 249 = 193) and the 12px gap is
// the modal measured slot gap. Every tile renders all six actions in Figma order
// so the parity reviewer sees the whole row. Hover and Active are pointer-gated
// per ink lane; "Eye pressed" is the toggle's own `aria-pressed` state, which is a
// real prop and therefore never forced. The Static tile drops every callback,
// leaving a plain `<div>` of `<span>`s with no group role and no ARIA.
export const ACTION_ICON_BAR_GROUPS: GroupSpec[] = [
  {
    title: 'Панель піктограм дій',
    width: 193,
    states: [
      { label: 'Rest', node: actionIconBarNode({}) },
      { label: 'Hover', node: actionIconBarNode({ hover: true }) },
      { label: 'Active', node: actionIconBarNode({ active: true }) },
      { label: 'Disabled', node: actionIconBarNode({ disabled: true }) },
      { label: 'Eye pressed', node: actionIconBarNode({ pressed: true }) },
      { label: 'Static', node: actionIconBarNode({ staticBar: true }) },
    ],
  },
];
