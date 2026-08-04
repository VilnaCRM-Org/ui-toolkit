import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonControlText from './index';

const meta: Meta<typeof UiSkeletonControlText> = {
  title: 'UiComponents/UiSkeletonControlText',
  component: UiSkeletonControlText,
  tags: ['autodocs'],
  argTypes: {
    control: {
      description: 'Control placeholder shape',
      options: ['checkbox', 'radio'],
      control: { type: 'radio' },
    },
    loadingText: {
      description: 'Visually hidden status text inside the aria-busy container',
      control: { type: 'text' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonControlText>;

export const Checkbox: Story = {
  args: { control: 'checkbox' },
};

export const Radio: Story = {
  args: { control: 'radio' },
};
