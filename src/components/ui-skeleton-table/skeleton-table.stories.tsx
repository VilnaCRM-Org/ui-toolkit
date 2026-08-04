import type { Meta, StoryObj } from '@storybook/react';

import UiSkeletonTable from './index';

const meta: Meta<typeof UiSkeletonTable> = {
  title: 'UiComponents/UiSkeletonTable',
  component: UiSkeletonTable,
  tags: ['autodocs'],
  argTypes: {
    rows: { description: 'Number of body rows', control: { type: 'number' } },
    columns: {
      description: 'Number of columns; measured widths cycle past the design set',
      control: { type: 'number' },
    },
    loadingText: {
      description: 'Screen-reader-only status text',
      control: { type: 'text' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiSkeletonTable>;

export const Default: Story = {
  args: { rows: 10, columns: 5 },
};

export const CompactRows: Story = {
  args: { rows: 4, columns: 5 },
};

export const ExtraColumns: Story = {
  args: { rows: 4, columns: 7 },
};
