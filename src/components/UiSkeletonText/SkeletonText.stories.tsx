import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonText from './index';

const meta: Meta<typeof UiSkeletonText> = {
  title: 'UiComponents/UiSkeletonText',
  component: UiSkeletonText,
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'Text line height preset',
      options: ['s', 'm', 'l'],
      control: { type: 'radio' },
    },
    width: { description: 'Width of the text line', control: { type: 'text' } },
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonText>;

export const Small: Story = {
  args: { size: 's', width: '100%' },
};

export const Medium: Story = {
  args: { size: 'm', width: '100%' },
};

export const Large: Story = {
  args: { size: 'l', width: '60%' },
};
