import type { Meta, StoryObj } from '@storybook/react';

import AuthSkeleton from './index';

const meta: Meta<typeof AuthSkeleton> = {
  title: 'UiComponents/AuthSkeleton',
  component: AuthSkeleton,
  tags: ['autodocs'],
  argTypes: {
    disableAnimation: {
      type: 'boolean',
      description: 'Freeze the shimmer/pulse (also honoured via prefers-reduced-motion)',
      control: { type: 'boolean' },
    },
    ariaLabel: {
      type: 'string',
      description: 'Accessible name for the loading <section> landmark',
    },
  },
};

export default meta;

type Story = StoryObj<typeof AuthSkeleton>;

export const Animated: Story = {
  args: { disableAnimation: false, ariaLabel: 'Loading form' },
};

export const Static: Story = {
  args: { disableAnimation: true, ariaLabel: 'Loading form' },
};

export const CustomAriaLabel: Story = {
  args: { disableAnimation: false, ariaLabel: 'Loading sign-up form' },
};
