import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonList from './index';

const meta: Meta<typeof UiSkeletonList> = {
  title: 'UiComponents/UiSkeletonList',
  component: UiSkeletonList,
  tags: ['autodocs'],
  argTypes: {
    rows: { description: 'Number of stacked row placeholders', control: { type: 'number' } },
    loadingText: {
      description: 'Visually hidden status text inside the aria-busy container',
      control: { type: 'text' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonList>;

export const Default: Story = {
  args: { rows: 3 },
};

export const FiveRows: Story = {
  args: { rows: 5 },
};
