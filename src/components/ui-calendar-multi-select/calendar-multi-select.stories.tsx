import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';

import UiCalendarMultiSelect from './index';

const meta: Meta<typeof UiCalendarMultiSelect> = {
  title: 'UiComponents/UiCalendarMultiSelect',
  component: UiCalendarMultiSelect,
  tags: ['autodocs'],
  argTypes: {
    label: {
      type: 'string',
      description: 'Visible label / accessible name for the calendar grid',
      control: { type: 'text' },
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the whole calendar is disabled',
      control: { type: 'boolean' },
    },
    error: {
      type: 'boolean',
      description: 'Whether the control is in the error state',
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiCalendarMultiSelect>;

// `defaultMonth` is pinned to a month that never contains the real "today", so
// the visual-regression baseline stays deterministic across runs (the today
// marker would otherwise move day to day).
export const CalendarMultiSelect: Story = {
  args: {
    label: t('Available dates'),
    defaultMonth: '2025-09-15',
    value: ['2025-09-05', '2025-09-12', '2025-09-20'],
    error: false,
    disabled: false,
  },
};
