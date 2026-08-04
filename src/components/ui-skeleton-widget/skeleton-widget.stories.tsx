import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonWidget from './index';

const meta: Meta<typeof UiSkeletonWidget> = {
  title: 'UiComponents/UiSkeletonWidget',
  component: UiSkeletonWidget,
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'Card footprint: 375x410 (small) or 774x410 / 1167x540 (medium)',
      options: ['small', 'medium'],
      control: { type: 'radio' },
    },
    variant: {
      description: 'Content anatomy under the shared 48px header',
      options: ['task-list', 'block', 'chart'],
      control: { type: 'radio' },
    },
    rows: { description: 'Task rows per column', control: { type: 'number' } },
    columns: {
      description: 'Task-list columns; 2 selects the wide medium board',
      options: [1, 2],
      control: { type: 'inline-radio' },
    },
    loadingText: {
      description: 'Visually hidden status text inside the aria-busy container',
      control: { type: 'text' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonWidget>;

export const SmallTaskList: Story = {
  args: { size: 'small', variant: 'task-list', rows: 4 },
};

export const SmallBlock: Story = {
  args: { size: 'small', variant: 'block' },
};

export const SmallChart: Story = {
  args: { size: 'small', variant: 'chart' },
};

export const MediumTaskList: Story = {
  args: { size: 'medium', variant: 'task-list', rows: 4, columns: 1 },
};

export const MediumTwoColumn: Story = {
  args: { size: 'medium', variant: 'task-list', rows: 4, columns: 2 },
};
