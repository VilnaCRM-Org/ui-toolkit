import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import type { UiCalendarMultiSelectProps } from './types';

import UiCalendarMultiSelect from './index';

const interactionLabel: string = 'Available dates';
const interactionMonth: string = '2025-09-15';
// Accessible names of the two day cells, built by `formatDayLabel` (`D Month YYYY`)
// under the default `en-US` locale the interaction story renders with.
const rangeStartDayName: string = '10 September 2025';
const rangeEndDayName: string = '12 September 2025';

// The range is always controlled, so the interactive story seeds it from local
// state (clicking days is a no-op without it). The initial value matches the args
// below, so the first render — and thus the visual baseline — is unchanged.
function CalendarStory({ args }: { args: UiCalendarMultiSelectProps }): React.ReactElement {
  const [value, setValue] = React.useState<string[]>(args.value ?? []);

  return (
    <UiCalendarMultiSelect
      label={args.label}
      defaultMonth={args.defaultMonth}
      locale={args.locale}
      value={value}
      onChange={setValue}
      disabled={args.disabled}
    />
  );
}

// The interaction story owns its own selection and starts from an empty range, so
// the play function drives both endpoints itself.
function CalendarInteractionStory(): React.ReactElement {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <UiCalendarMultiSelect
      label={interactionLabel}
      defaultMonth={interactionMonth}
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
  },
};

export default meta;

type Story = StoryObj<typeof UiCalendarMultiSelect>;

// `defaultMonth` is pinned to a month that never contains the real "today", so
// the visual-regression baseline stays deterministic across runs (the today
// marker would otherwise move day to day).
export const CalendarMultiSelect: Story = {
  args: {
    label: 'Доступні дати',
    defaultMonth: '2025-09-15',
    locale: 'uk-UA',
    // A completed range: the two endpoints render as filled blue circles and the
    // days between them get the faint-blue band.
    value: ['2025-09-05', '2025-09-20'],
    disabled: false,
  },
  render: (args: UiCalendarMultiSelectProps): React.ReactElement => <CalendarStory args={args} />,
};

// Interaction story (`interaction` tag): proves clicking two days lays down the
// range endpoints, reporting each through `aria-selected` and the day's accessible
// name. See tests/storybook/README.md.
export const RangeClicksSetEndpoints: Story = {
  tags: ['interaction', '!autodocs'],
  render: CalendarInteractionStory,
  play: async ({ canvasElement }): Promise<void> => {
    const canvas: ReturnType<typeof within> = within(canvasElement);
    const startDay: HTMLElement = canvas.getByRole('gridcell', { name: rangeStartDayName });
    const endDay: HTMLElement = canvas.getByRole('gridcell', { name: rangeEndDayName });

    await userEvent.click(startDay);
    await expect(startDay).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(endDay);

    await expect(endDay).toHaveAttribute('aria-selected', 'true');
    await expect(startDay).toHaveAccessibleName(`${rangeStartDayName}, range start`);
    await expect(endDay).toHaveAccessibleName(`${rangeEndDayName}, range end`);
  },
};
