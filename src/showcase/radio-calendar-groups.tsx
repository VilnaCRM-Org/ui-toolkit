import { Box } from '@mui/material';
import React from 'react';

import { UiCalendarMultiSelect, UiRadioGroup } from '@/components';

import type { GroupSpec } from './types';

const CONTACT = [
  { label: 'Електронна пошта', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Сповіщення', value: 'push' },
];
// Calendar showcase states, all on August 2022 — it starts on a Monday and has 31
// days, so its last row reads 29 30 31 1 2 3 4 (matching the Figma frame). Rest: a
// single selected day. Active: a clean in-month range (1–5) so both endpoints show.
// Active (other month): a range that starts in-month and runs past its end, so the
// next month's leading days fall in range.
const CAL_MONTH = '2022-08-01';
const CAL_REST = ['2022-08-01'];
const CAL_ACTIVE = ['2022-08-01', '2022-08-05'];
const CAL_ACTIVE_OTHER = ['2022-08-01', '2022-09-10'];

// Forced day-hover: the theme scopes the light-blue disc to `:hover` (Figma draws
// hover as its own frame), so a static tile re-applies it to one day — the 5th,
// found by its accessible-name prefix.
const CAL_HOVER_SX = {
  '& [aria-label^="5 "] .ui-day-circle': { backgroundColor: 'rgba(30, 174, 255, 0.1)' },
} as const;
const CALENDAR_HOVER_TILE: React.ReactElement = (
  <Box sx={CAL_HOVER_SX}>
    <UiCalendarMultiSelect
      label="Доступні дати"
      defaultMonth={CAL_MONTH}
      locale="uk-UA"
      value={CAL_REST}
    />
  </Box>
);

export const RADIO_GROUP: GroupSpec = {
  title: 'Radio button',
  width: 262,
  states: [
    {
      label: 'Selected',
      node: <UiRadioGroup options={CONTACT} value="email" label="Бажаний спосіб зв'язку" />,
    },
  ],
};

export const CALENDAR_GROUP: GroupSpec = {
  title: 'Календар (діапазон дат)',
  width: 320,
  states: [
    {
      label: 'Rest',
      node: (
        <UiCalendarMultiSelect
          label="Доступні дати"
          defaultMonth={CAL_MONTH}
          locale="uk-UA"
          value={CAL_REST}
        />
      ),
    },
    { label: 'Hover', node: CALENDAR_HOVER_TILE },
    {
      label: 'Active',
      node: (
        <UiCalendarMultiSelect
          label="Доступні дати"
          defaultMonth={CAL_MONTH}
          locale="uk-UA"
          value={CAL_ACTIVE}
        />
      ),
    },
    {
      label: 'Active (other month)',
      node: (
        <UiCalendarMultiSelect
          label="Доступні дати"
          defaultMonth={CAL_MONTH}
          locale="uk-UA"
          value={CAL_ACTIVE_OTHER}
        />
      ),
    },
  ],
};
