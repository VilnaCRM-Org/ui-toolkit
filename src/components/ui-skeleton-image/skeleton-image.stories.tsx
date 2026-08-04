import type { Meta, StoryObj } from '@storybook/react';

import { radioControlArgType, textControlArgType } from '../../../.storybook/field-story-arg-types';

import UiSkeletonImage from './index';

const meta: Meta<typeof UiSkeletonImage> = {
  title: 'UiComponents/UiSkeletonImage',
  component: UiSkeletonImage,
  tags: ['autodocs'],
  argTypes: {
    variant: radioControlArgType('Image placeholder shape', ['round', 'block']),
    width: textControlArgType('Width of the placeholder'),
    height: textControlArgType('Height of the placeholder'),
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonImage>;

export const Round: Story = {
  args: { variant: 'round' },
};

export const Block: Story = {
  args: { variant: 'block' },
};

export const CustomSize: Story = {
  args: { variant: 'block', width: '160px', height: '120px' },
};
