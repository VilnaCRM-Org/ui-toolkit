import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import UiCalendarMultiSelect from './index';

const calendarLabel: string = t('Available dates');
const pinnedMonth: string = '2025-09-15';
// Accessible name of the day cell, built by `formatDayLabel` (`D Month YYYY`).
const toggledDayName: string = '10 September 2025';

// The calendar is fully controlled, so the interaction story owns the selection and
// starts from an empty one.
function CalendarInteractionStory(): React.ReactElement {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <UiCalendarMultiSelect
      label={calendarLabel}
      defaultMonth={pinnedMonth}
      value={value}
      onChange={setValue}
    />
  );
}

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
    label: calendarLabel,
    defaultMonth: pinnedMonth,
    value: ['2025-09-05', '2025-09-12', '2025-09-20'],
    error: false,
    disabled: false,
  },
};

// Interaction story (`interaction` tag): proves a day cell toggles on and back off,
// reporting the state through `aria-selected`. See tests/storybook/README.md.
export const DayToggleUpdatesSelection: Story = {
  tags: ['interaction', '!autodocs'],
  render: CalendarInteractionStory,
  play: async ({ canvasElement }): Promise<void> => {
    const day: HTMLElement = within(canvasElement).getByRole('gridcell', {
      name: toggledDayName,
    });

    await userEvent.click(day);
    await expect(day).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(day);

    await expect(day).toHaveAttribute('aria-selected', 'false');
  },
};
