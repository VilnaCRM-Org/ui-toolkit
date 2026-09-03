import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiOptionCardProps } from './types';

import UiOptionCard from './index';

// The card never renders its own group: `role="radiogroup"` and its accessible
// name belong to the consumer, so the wired story models that composition — which
// is also what keeps the unwired-selected dev-warning silent for the group case.
const GROUP_LABEL: string = 'Оберіть налаштування';

/**
 * The selected axis is always controlled — the component never self-flips it —
 * so a stateful wrapper owns the flag and `onSelect` feeds it back, keeping the
 * story interactive. Controls drive the initial state; props are threaded
 * explicitly, since the repo forbids prop-spreading.
 */
function OptionCardStory({ args }: Readonly<{ args: UiOptionCardProps }>): React.ReactElement {
  const [selected, setSelected] = React.useState<boolean>(args.selected ?? false);
  React.useEffect((): void => {
    setSelected(args.selected ?? false);
  }, [args.selected]);
  const handleSelect = React.useCallback((): void => setSelected(true), []);
  return (
    <Box role="radiogroup" aria-label={GROUP_LABEL}>
      <UiOptionCard
        label={args.label}
        valueLabel={args.valueLabel}
        selected={selected}
        onSelect={handleSelect}
        disabled={args.disabled}
      />
    </Box>
  );
}

const meta: Meta<typeof UiOptionCard> = {
  title: 'UiComponents/UiOptionCard',
  component: UiOptionCard,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Caption above the box — the accessible name lead-in'),
    valueLabel: textControlArgType('Text painted inside the value box'),
    selected: booleanControlArgType('Checked state (always controlled; a radio never unchecks)'),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, activation no-ops'),
  },
};

export default meta;

type Story = StoryObj<typeof UiOptionCard>;

// Wired render: `onSelect` makes the whole card one `role="radio"` button inside
// the consumer's group, so hover, activation and the focus ring are all live.
function renderWired(args: UiOptionCardProps): React.ReactElement {
  return <OptionCardStory args={args} />;
}

// Static render: no `onSelect`, so the card is plain content — no role, no
// tabindex, no ARIA of any kind — over an identical content tree.
function renderStatic(args: UiOptionCardProps): React.ReactElement {
  return <UiOptionCard label={args.label} valueLabel={args.valueLabel} />;
}

// The primary story: the wired rest state, pixel-for-pixel with the Figma master.
export const OptionCard: Story = {
  args: { label: 'Analytics API', valueLabel: 'Reporting' },
  render: renderWired,
};

export const Static: Story = {
  args: { label: 'Analytics API', valueLabel: 'Reporting' },
  render: renderStatic,
};
