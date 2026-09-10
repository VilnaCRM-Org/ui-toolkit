import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { PAYMENT_OPTIONS } from '@/showcase/new-components-board/fixtures';

import {
  booleanControlArgType,
  objectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiPaymentOptionCardProps } from './types';

import UiPaymentOptionCard from './index';

// The two providers the Figma masters draw, with their marks' intrinsic sizes —
// the same consumer data the showcase board paints. Brand is NOT state: only the
// selected master carries WayForPay, a content swap the designer made to show a
// second provider, so the Selected story keeps it and both wordmarks stay on
// screen. Only LiqPay ships a flat-grey master, hence the single `logoDisabled`.
const [LIQPAY, WAYFORPAY] = PAYMENT_OPTIONS;

// The card is fluid (`width: 100%`) so a consumer can size it; the Figma master
// is 279px wide, which is what every story renders at.
const CARD_SX: SxProps<Theme> = { width: '279px' };

// The card never renders its own group: `role="radiogroup"` and its accessible
// name belong to the consumer, so the wired stories model that composition —
// which is also what keeps the radiogroup-context dev warning silent. The name
// sits on the group, never on the card, whose whole accessible name is the
// wordmark's `alt` and which carries no `aria-label` anywhere in its tree.
const GROUP_LABEL: string = 'Оберіть спосіб оплати';

/**
 * The selected axis is always controlled — the component never self-flips it —
 * so a stateful wrapper owns the flag and `onSelect` feeds it back, keeping the
 * story interactive. Selection is one-directional on purpose: a radio cannot
 * unselect itself, so with a single card in the group the state only ever moves
 * false→true; deselection needs a sibling to take the check. Storybook Controls
 * drive the initial state (and every other prop); props are threaded explicitly,
 * since the repo forbids prop spreading.
 */
function PaymentOptionCardStory({
  args,
}: Readonly<{ args: UiPaymentOptionCardProps }>): React.ReactElement {
  const [selected, setSelected] = React.useState<boolean>(args.selected ?? false);
  // Adopt `selected` changes from Controls while keeping clicks/keys interactive.
  React.useEffect((): void => {
    setSelected(args.selected ?? false);
  }, [args.selected]);
  const handleSelect = React.useCallback((): void => setSelected(true), []);
  return (
    <Box role="radiogroup" aria-label={GROUP_LABEL}>
      <UiPaymentOptionCard
        name={args.name}
        logo={args.logo}
        logoDisabled={args.logoDisabled}
        selected={selected}
        onSelect={handleSelect}
        disabled={args.disabled}
        sx={CARD_SX}
      />
    </Box>
  );
}

const meta: Meta<typeof UiPaymentOptionCard> = {
  title: 'UiComponents/UiPaymentOptionCard',
  component: UiPaymentOptionCard,
  tags: ['autodocs'],
  argTypes: {
    name: textControlArgType('Provider name — the wordmark alt, and the whole accessible name'),
    logo: objectControlArgType('Full-colour mark: { src, width, height } — dimensions required'),
    logoDisabled: objectControlArgType('Flat-grey mark for the disabled state; falls back to logo'),
    selected: booleanControlArgType('Checked state (always controlled; a radio never unchecks)'),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, activation no-ops'),
  },
};

export default meta;

type Story = StoryObj<typeof UiPaymentOptionCard>;

// Wired render: `onSelect` makes the whole card one `role="radio"` button inside
// the consumer's group, so hover, activation and the focus ring are all live.
function renderWired(args: UiPaymentOptionCardProps): React.ReactElement {
  return <PaymentOptionCardStory args={args} />;
}

// Static render: no `onSelect`, so the card is plain content — no role, no
// tabindex, no ARIA of any kind — over an identical content tree, and no group
// wrapper, because there is no radio to group. `selected` is withheld on purpose:
// on an unwired card it is a misconfiguration the component dev-warns about and
// deliberately does not paint.
function renderStatic(args: UiPaymentOptionCardProps): React.ReactElement {
  return <UiPaymentOptionCard name={args.name} logo={args.logo} sx={CARD_SX} />;
}

// The primary story: the wired rest state, pixel-for-pixel with the Figma master.
export const PaymentOptionCard: Story = {
  args: { name: LIQPAY.name, logo: LIQPAY.logo, logoDisabled: LIQPAY.logoDisabled },
  render: renderWired,
};

// The checked card: white fill, the primary border plus its `inset 0 0 0 1px`
// second pixel and the 5px checked circle, with `aria-checked="true"` behind all
// three. Hovering it changes nothing — selected dominates hover, so the hover
// recipe keeps a `:not([aria-checked="true"])` gate.
export const Selected: Story = {
  args: { name: WAYFORPAY.name, logo: WAYFORPAY.logo, selected: true },
  render: renderWired,
};

// Disabled wired card: the aria-disabled boundary — a real, focusable radio whose
// hover recipe is suppressed and whose activation no-ops. Figma DOES ship a
// disabled master here, so it is painted: the flat-grey wordmark (an ASSET swap,
// never a CSS filter) plus a solid brandGray circle.
export const Disabled: Story = {
  args: {
    name: LIQPAY.name,
    logo: LIQPAY.logo,
    logoDisabled: LIQPAY.logoDisabled,
    disabled: true,
  },
  render: renderWired,
};

export const Static: Story = {
  args: { name: WAYFORPAY.name, logo: WAYFORPAY.logo },
  render: renderStatic,
};
