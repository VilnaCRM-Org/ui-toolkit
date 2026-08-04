import type { Meta, StoryObj } from '@storybook/react';

import {
  numberControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import UiSkeletonTabBar from './index';

const meta: Meta<typeof UiSkeletonTabBar> = {
  title: 'UiComponents/UiSkeletonTabBar',
  component: UiSkeletonTabBar,
  tags: ['autodocs'],
  argTypes: {
    tabs: numberControlArgType('Number of tab placeholders'),
    loadingText: textControlArgType('Visually hidden status text inside the aria-busy container'),
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
