import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonInput from './index';

const meta: Meta<typeof UiSkeletonInput> = {
  title: 'UiComponents/UiSkeletonInput',
  component: UiSkeletonInput,
  tags: ['autodocs'],
  argTypes: {
    disableAnimation: {
      type: 'boolean',
      description: 'Freeze the shimmer (also honoured via prefers-reduced-motion)',
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonInput>;

export const Animated: Story = {
  args: { disableAnimation: false },
};

export const Static: Story = {
  args: { disableAnimation: true },
};
