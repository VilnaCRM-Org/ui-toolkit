import type { Meta, StoryObj } from '@storybook/react';

import {
  numberControlArgType,
  radioControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import UiSkeletonWidget from './index';

const meta: Meta<typeof UiSkeletonWidget> = {
  title: 'UiComponents/UiSkeletonWidget',
  component: UiSkeletonWidget,
  tags: ['autodocs'],
  argTypes: {
    size: radioControlArgType('Card footprint: 375x410 (small) or 774x410 / 1167x540 (medium)', [
      'small',
      'medium',
    ]),
    variant: radioControlArgType('Content anatomy under the shared 48px header', [
      'task-list',
      'block',
      'chart',
    ]),
    rows: numberControlArgType('Task rows per column'),
    columns: {
      description: 'Task-list columns; 2 selects the wide medium board',
      options: [1, 2],
      control: { type: 'inline-radio' },
    },
    loadingText: textControlArgType('Visually hidden status text inside the aria-busy container'),
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
