import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiMultiSelectOption } from './types';

import UiMultiSelect from './index';

const options: UiMultiSelectOption[] = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv' },
  { label: 'Odesa', value: 'odesa' },
  { label: 'Kharkiv', value: 'kharkiv' },
];

const meta: Meta<typeof UiMultiSelect> = {
  title: 'UiComponents/UiMultiSelect',
  component: UiMultiSelect,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Visible label / accessible name for the combobox'),
    placeholder: textControlArgType('Placeholder text shown when nothing is selected'),
    disabled: booleanControlArgType('Whether the control is disabled'),
    error: booleanControlArgType('Whether the control is in error state'),
  },
};

export default meta;

type Story = StoryObj<typeof UiMultiSelect>;

export const MultiSelect: Story = {
  args: {
    options,
    // Two preselected chips give the visual baseline something to render.
    value: [options[0], options[2]],
    label: t('Cities'),
    placeholder: t('Select cities'),
    error: false,
  },
};
