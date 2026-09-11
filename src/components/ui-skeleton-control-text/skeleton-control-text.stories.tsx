import type { Meta, StoryObj } from '@storybook/react';

import { radioControlArgType, textControlArgType } from '../../../.storybook/field-story-arg-types';

import UiSkeletonControlText from './index';

const meta: Meta<typeof UiSkeletonControlText> = {
  title: 'UiComponents/UiSkeletonControlText',
  component: UiSkeletonControlText,
  tags: ['autodocs'],
  argTypes: {
    control: radioControlArgType('Control placeholder shape', ['checkbox', 'radio']),
    loadingText: textControlArgType('Visually hidden status text inside the aria-busy container'),
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonControlText>;

export const Checkbox: Story = {
  args: { control: 'checkbox' },
};

export const Radio: Story = {
  args: { control: 'radio' },
};
