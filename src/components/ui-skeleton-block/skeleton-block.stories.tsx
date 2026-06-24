import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonBlock from './index';

const meta: Meta<typeof UiSkeletonBlock> = {
  title: 'UiComponents/UiSkeletonBlock',
  component: UiSkeletonBlock,
  tags: ['autodocs'],
  argTypes: {
    width: { description: 'Width of the block', control: { type: 'text' } },
    height: { description: 'Height of the block', control: { type: 'text' } },
    borderRadius: { description: 'Corner radius of the block', control: { type: 'text' } },
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonBlock>;

export const Default: Story = {
  args: { width: '100%', height: '3rem', borderRadius: '8px' },
};

export const Circle: Story = {
  args: { width: '3rem', height: '3rem', borderRadius: '50%' },
};

export const Wide: Story = {
  args: { width: '20rem', height: '1rem', borderRadius: '4px' },
};
