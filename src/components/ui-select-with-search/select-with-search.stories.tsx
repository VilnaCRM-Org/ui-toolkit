import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

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
    label: textControlArgType('Visible label / accessible name for the combobox'),
    placeholder: textControlArgType('Placeholder text shown when nothing is selected'),
    disabled: booleanControlArgType('Whether the control is disabled'),
    error: booleanControlArgType('Whether the control is in error state'),
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
