import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonImage from './index';

const meta: Meta<typeof UiSkeletonImage> = {
  title: 'UiComponents/UiSkeletonImage',
  component: UiSkeletonImage,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Image placeholder shape',
      options: ['round', 'block'],
      control: { type: 'radio' },
    },
    width: { description: 'Width of the placeholder', control: { type: 'text' } },
    height: { description: 'Height of the placeholder', control: { type: 'text' } },
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonImage>;

export const Round: Story = {
  args: { variant: 'round' },
};

export const Block: Story = {
  args: { variant: 'block' },
};

export const CustomSize: Story = {
  args: { variant: 'block', width: '160px', height: '120px' },
};
