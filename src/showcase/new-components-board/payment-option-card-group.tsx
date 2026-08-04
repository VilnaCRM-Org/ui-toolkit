import { PAYMENT_OPTIONS } from './fixtures';
import { paymentOptionCardNode } from './micro-nodes';
import type { GroupSpec } from './types';

const [LIQPAY, WAYFORPAY] = PAYMENT_OPTIONS;

// The Figma master is 279x90 (board row y=1004), so the tile width comes straight
// from it. Brand is NOT state: only the selected master carries WAYFORPAY, a
// content swap the designer made to show a second provider — the Selected tile
// keeps it so both wordmarks are on screen. "Selected + Hover" forces the SAME
// hover recipe the Hover tile does; it stays unpainted there, because the recipe
// keeps the component's own `:not([aria-checked="true"])` gate — selected
// dominates hover, drawn on the board rather than asserted in prose. Disabled
// paints the flat-grey LiqPay mark, an ASSET swap and never a CSS filter.
export const PAYMENT_OPTION_CARD_GROUPS: GroupSpec[] = [
  {
    title: 'Картка способу оплати',
    width: 279,
    states: [
      { label: 'Rest', node: paymentOptionCardNode({ option: LIQPAY }) },
      { label: 'Hover', node: paymentOptionCardNode({ option: LIQPAY, hover: true }) },
      {
        label: 'Selected',
        node: paymentOptionCardNode({ option: WAYFORPAY, selected: true }),
      },
      {
        label: 'Selected + Hover',
        node: paymentOptionCardNode({ option: WAYFORPAY, selected: true, hover: true }),
      },
      { label: 'Disabled', node: paymentOptionCardNode({ option: LIQPAY, disabled: true }) },
      { label: 'Static', node: paymentOptionCardNode({ option: LIQPAY, staticCard: true }) },
    ],
  },
];
