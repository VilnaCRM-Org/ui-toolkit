import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import UiTypography from '../UiTypography';

import UiContainer from './index';

const meta: Meta<typeof UiContainer> = {
  title: 'UiComponents/UiContainer',
  component: UiContainer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof UiContainer>;

export const Default: Story = {
  render: (): React.ReactElement => (
    <UiContainer>
      <UiTypography component="p">Content constrained by the container max-width.</UiTypography>
    </UiContainer>
  ),
};
