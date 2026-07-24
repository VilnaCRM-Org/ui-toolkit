import type { Meta, StoryObj } from '@storybook/react';

import { Board } from './new-components-board/board';

const meta: Meta<typeof Board> = {
  title: 'Showcase/New Components (Figma parity)',
  component: Board,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Board>;

export const FigmaParity: Story = {};
