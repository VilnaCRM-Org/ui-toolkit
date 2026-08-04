import type { Meta, StoryObj } from '@storybook/react';

import {
  numberControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import UiSkeletonTable from './index';

const meta: Meta<typeof UiSkeletonTable> = {
  title: 'UiComponents/UiSkeletonTable',
  component: UiSkeletonTable,
  tags: ['autodocs'],
  argTypes: {
    rows: numberControlArgType('Number of body rows'),
    columns: numberControlArgType('Number of columns; measured widths cycle past the design set'),
    loadingText: textControlArgType('Screen-reader-only status text'),
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
