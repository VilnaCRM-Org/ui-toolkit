import type { Meta, StoryObj } from '@storybook/react';

import UiBackToMain from './index';

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
