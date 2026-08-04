import type { Meta, StoryObj } from '@storybook/react';

import { textControlArgType } from '../../../.storybook/field-story-arg-types';

import UiSkeletonMenu from './index';

const meta: Meta<typeof UiSkeletonMenu> = {
  title: 'UiComponents/UiSkeletonMenu',
  component: UiSkeletonMenu,
  tags: ['autodocs'],
  argTypes: {
    loadingText: textControlArgType('Visually hidden status text inside the aria-busy container'),
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonMenu>;

export const Default: Story = {
  args: {},
};
