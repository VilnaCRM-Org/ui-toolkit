import type { Meta, StoryObj } from '@storybook/react';

import {
  numberControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import UiSkeletonList from './index';

const meta: Meta<typeof UiSkeletonList> = {
  title: 'UiComponents/UiSkeletonList',
  component: UiSkeletonList,
  tags: ['autodocs'],
  argTypes: {
    rows: numberControlArgType('Number of stacked row placeholders'),
    loadingText: textControlArgType('Visually hidden status text inside the aria-busy container'),
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
