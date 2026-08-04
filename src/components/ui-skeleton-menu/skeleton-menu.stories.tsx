import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonMenu from './index';

const meta: Meta<typeof UiSkeletonMenu> = {
  title: 'UiComponents/UiSkeletonMenu',
  component: UiSkeletonMenu,
  tags: ['autodocs'],
  argTypes: {
    loadingText: {
      description: 'Visually hidden status text inside the aria-busy container',
      control: { type: 'text' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonMenu>;

export const Default: Story = {
  args: {},
};
