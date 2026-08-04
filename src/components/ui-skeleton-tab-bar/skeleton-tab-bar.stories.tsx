import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonTabBar from './index';

const meta: Meta<typeof UiSkeletonTabBar> = {
  title: 'UiComponents/UiSkeletonTabBar',
  component: UiSkeletonTabBar,
  tags: ['autodocs'],
  argTypes: {
    tabs: { description: 'Number of tab placeholders', control: { type: 'number' } },
    loadingText: {
      description: 'Visually hidden status text inside the aria-busy container',
      control: { type: 'text' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonTabBar>;

export const Default: Story = {
  args: { tabs: 6 },
};

export const FourTabs: Story = {
  args: { tabs: 4 },
};
