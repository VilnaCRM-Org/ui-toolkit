import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import UiBackToMain from './index';

const backLabel: string = 'Back to main';
const backDestination: string = '/dashboard';

const meta: Meta<typeof UiBackToMain> = {
  title: 'UiComponents/UiBackToMain',
  component: UiBackToMain,
  tags: ['autodocs'],
  argTypes: {
    to: { type: 'string', description: 'Destination href for the back link' },
    label: { type: 'string', description: 'Visible text and accessible name of the link' },
  },
};

export default meta;

type Story = StoryObj<typeof UiBackToMain>;

export const Default: Story = {
  args: { to: '/', label: 'Back to main' },
};

export const CustomDestination: Story = {
  args: { to: '/dashboard', label: 'Back to main' },
};

export const CustomLabel: Story = {
  args: { to: '/', label: 'Return home' },
};

// Interaction story (`interaction` tag): proves the back affordance is a keyboard
// reachable link pointing at `to`. See tests/storybook/README.md.
export const KeyboardFocusReachesBackLink: Story = {
  tags: ['interaction', '!autodocs'],
  args: { to: backDestination, label: backLabel },
  play: async ({ canvasElement }): Promise<void> => {
    const link: HTMLElement = within(canvasElement).getByRole('link', { name: backLabel });

    await userEvent.tab();

    await expect(link).toHaveFocus();
    await expect(link).toHaveAttribute('href', backDestination);
  },
};
