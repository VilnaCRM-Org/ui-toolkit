import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import { expect, screen, userEvent, within } from 'storybook/test';

import UiTooltip from '.';

const disclosureTrigger: string = t('Plan details');
const disclosureBody: string = t('Includes five seats');

const meta: Meta<typeof UiTooltip> = {
  title: 'UiComponents/UITooltip',
  component: UiTooltip,
  tags: ['autodocs'],
  argTypes: {
    children: {
      type: 'string',
      name: 'children',
      description: 'Trigger content for the tooltip',
    },
    placement: {
      type: 'string',
      description: 'Placement of the tooltip',
      options: ['top', 'bottom', 'left', 'right'],
      control: { type: 'radio' },
    },
    arrow: {
      type: 'boolean',
      description: 'Whether the tooltip has an arrow',
      control: { type: 'boolean' },
    },
    title: {
      type: 'string',
      description: 'Content of the tooltip',
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiTooltip>;

export const Tooltip: Story = {
  args: {
    children: t('Hello World!'),
    placement: 'bottom',
    arrow: true,
    title: 'UiTooltip',
  },
};

// Interaction story (`interaction` tag): proves the disclosure opens on click and
// reports its state through `aria-expanded`. The bubble is portalled outside the
// story canvas, so it is queried from `screen`. See tests/storybook/README.md.
export const ClickOpensTooltip: Story = {
  tags: ['interaction', '!autodocs'],
  args: {
    children: disclosureTrigger,
    placement: 'bottom',
    arrow: true,
    title: disclosureBody,
  },
  play: async ({ canvasElement }): Promise<void> => {
    const trigger: HTMLElement = within(canvasElement).getByRole('button', {
      name: disclosureTrigger,
    });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(screen.queryByText(disclosureBody)).toBeNull();

    await userEvent.click(trigger);

    await expect(await screen.findByText(disclosureBody)).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};
