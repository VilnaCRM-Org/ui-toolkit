import type { Meta, StoryObj } from '@storybook/react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiSelectWithSearchOption } from './types';

import UiSelectWithSearch from './index';

const options: UiSelectWithSearchOption[] = [
  { label: 'Київ', value: 'kyiv' },
  { label: 'Львів', value: 'lviv' },
  { label: 'Одеса', value: 'odesa' },
  { label: 'Харків', value: 'kharkiv' },
];

const meta: Meta<typeof UiSelectWithSearch> = {
  title: 'UiComponents/UiSelectWithSearch',
  component: UiSelectWithSearch,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Visible label / accessible name for the combobox'),
    placeholder: textControlArgType('Placeholder text shown when nothing is selected'),
    disabled: booleanControlArgType('Whether the control is disabled'),
  },
};

export default meta;

type Story = StoryObj<typeof UiSelectWithSearch>;

export const SelectWithSearch: Story = {
  args: {
    options,
    // Figma "select с поиском" has no visible top label — the field is named for
    // assistive tech via `aria-label`, and the placeholder carries the prompt.
    'aria-label': 'Місто',
    placeholder: 'Оберіть місто',
  },
};
