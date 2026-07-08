import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiRadioOption } from './types';

import UiRadioGroup from './index';

const options: UiRadioOption[] = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Push notification', value: 'push' },
];

const meta: Meta<typeof UiRadioGroup> = {
  title: 'UiComponents/UiRadioGroup',
  component: UiRadioGroup,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Visible group label / accessible name for the radio group'),
    disabled: booleanControlArgType('Whether the whole group is disabled'),
    error: booleanControlArgType('Whether the group is in error state'),
    required: booleanControlArgType('Marks the group required for assistive technology'),
  },
};

export default meta;

type Story = StoryObj<typeof UiRadioGroup>;

// Uncontrolled by default so the story is interactive (and the memory-leak
// scenario can move the selection); the selected-ring visual is captured by the
// `radio checked` state in tests/visual/states.spec.ts via a `value` arg.
export const RadioGroup: Story = {
  args: {
    options,
    label: t('Preferred contact method'),
    error: false,
  },
};
