import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { INTEGRATION_CARDS } from '@/showcase/new-components-board/fixtures';

import {
  booleanControlArgType,
  objectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiIntegrationCardProps } from './types';

import UiIntegrationCard from './index';

// The two brands the Figma masters draw, with their marks' intrinsic sizes — the
// same consumer data the showcase board paints (the component bakes in no
// natural-language literals of its own, a11y contract §2.2).
const [HUBSPOT, AMOCRM] = INTEGRATION_CARDS;

// The card is fluid (`width: 100%`, §10.1) so a consumer can size it; the Figma
// master is 312px wide, which is what every story renders at.
const CARD_SX: SxProps<Theme> = { width: '312px' };

// The card never renders its own group (§1.2): `role="radiogroup"` and its
// accessible name belong to the consumer, so the wired stories model that
// composition — which is also what keeps the §12.2 dev-warning silent. The name
// sits on the group, never on the card (§5.1 forbids `aria-label` in the card's
// own tree, whose accessible name is the visible brand name).
const GROUP_LABEL: string = 'Оберіть інтеграцію';

/**
 * The selected axis is always controlled (§3.1) — the component never self-flips
 * it — so a stateful wrapper owns the flag and `onSelect` feeds it back, keeping
 * the story interactive. Selection is one-directional here on purpose (§1.4): a
 * radio cannot unselect itself, so with a single card in the group the state only
 * ever moves false→true; deselection needs a sibling to take the check. Storybook
 * Controls drive the initial state (and every other prop); props are threaded
 * explicitly, since the repo forbids prop-spreading.
 */
function IntegrationCardStory({
  args,
}: Readonly<{ args: UiIntegrationCardProps }>): React.ReactElement {
  const [selected, setSelected] = React.useState<boolean>(args.selected ?? false);
  // Adopt `selected` changes from Controls while keeping clicks/keys interactive.
  React.useEffect((): void => {
    setSelected(args.selected ?? false);
  }, [args.selected]);
  const handleSelect = React.useCallback((): void => setSelected(true), []);
  return (
    <Box role="radiogroup" aria-label={GROUP_LABEL}>
      <UiIntegrationCard
        name={args.name}
        logo={args.logo}
        selected={selected}
        onSelect={handleSelect}
        disabled={args.disabled}
        sx={CARD_SX}
      />
    </Box>
  );
}

const meta: Meta<typeof UiIntegrationCard> = {
  title: 'UiComponents/UiIntegrationCard',
  component: UiIntegrationCard,
  tags: ['autodocs'],
  argTypes: {
    name: textControlArgType('Brand name — the whole accessible name, never clamped'),
    logo: objectControlArgType('Brand mark: { src, width, height } — dimensions are required'),
    selected: booleanControlArgType('Checked state (always controlled; a radio never unchecks)'),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, activation no-ops'),
  },
};

export default meta;

type Story = StoryObj<typeof UiIntegrationCard>;

// Wired render: `onSelect` makes the whole card one `role="radio"` button inside
// the consumer's group, so hover, activation and the focus ring are all live.
function renderWired(args: UiIntegrationCardProps): React.ReactElement {
  return <IntegrationCardStory args={args} />;
}

// Static render: no `onSelect`, so the card is plain content — no role, no
// tabindex, no ARIA of any kind — over an identical content tree, and no group
// wrapper, because there is no radio to group. `selected` is withheld on purpose:
// on an unwired card it is a misconfiguration the component dev-warns about and
// deliberately does not paint (§3.4).
function renderStatic(args: UiIntegrationCardProps): React.ReactElement {
  return <UiIntegrationCard name={args.name} logo={args.logo} sx={CARD_SX} />;
}

// The primary story: the wired rest state, pixel-for-pixel with the Figma master.
export const IntegrationCard: Story = {
  args: { name: HUBSPOT.name, logo: HUBSPOT.logo },
  render: renderWired,
};

// The checked card: primary border, the 5px checked glyph ring and the Landing
// shadow, with `aria-checked="true"` behind all three. Hovering it changes
// nothing — selected dominates hover (§7.4), the one ruling with no Figma master.
export const Selected: Story = {
  args: { name: AMOCRM.name, logo: AMOCRM.logo, selected: true },
  render: renderWired,
};

// Disabled wired card: the aria-disabled boundary — a real, focusable radio whose
// hover recipe is suppressed and whose activation no-ops. Figma draws no disabled
// master, so it ships as semantics only; nothing is dimmed (§6.3).
export const Disabled: Story = {
  args: { name: HUBSPOT.name, logo: HUBSPOT.logo, disabled: true },
  render: renderWired,
};

export const Static: Story = {
  args: { name: AMOCRM.name, logo: AMOCRM.logo },
  render: renderStatic,
};
