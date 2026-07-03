import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';

import type { UiSelectWithSearchOption } from './types';

import UiSelectWithSearch from './index';

const options: UiSelectWithSearchOption[] = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv' },
  { label: 'Odesa', value: 'odesa' },
  { label: 'Kharkiv', value: 'kharkiv' },
];

const meta: Meta<typeof UiSelectWithSearch> = {
  title: 'UiComponents/UiSelectWithSearch',
  component: UiSelectWithSearch,
  tags: ['autodocs'],
  argTypes: {
    label: {
      type: 'string',
      description: 'Visible label / accessible name for the combobox',
      control: { type: 'text' },
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text shown when nothing is selected',
      control: { type: 'text' },
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the control is disabled',
      control: { type: 'boolean' },
    },
    error: {
      type: 'boolean',
      description: 'Whether the control is in error state',
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UiSelectWithSearch>;

export const SelectWithSearch: Story = {
  args: {
    options,
    label: t('City'),
    placeholder: t('Search city'),
    error: false,
  },
};
