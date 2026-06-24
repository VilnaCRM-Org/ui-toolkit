import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonButton from './index';

const meta: Meta<typeof UiSkeletonButton> = {
  title: 'UiComponents/UiSkeletonButton',
  component: UiSkeletonButton,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof UiSkeletonButton>;

export const Default: Story = {};
