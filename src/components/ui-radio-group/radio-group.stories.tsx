import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiRadioGroupProps, UiRadioOption } from './types';

import UiRadioGroup from './index';

const options: UiRadioOption[] = [
  { label: 'Електронна пошта', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Сповіщення', value: 'push' },
];

// The group is always controlled, so a stateful wrapper seeds the selection from
// local state (preselecting Email). This keeps the story interactive and gives the
// visual baseline both the selected ring (Email) and the unselected radios in one
// shot. Props are threaded explicitly (the repo forbids prop-spreading).
function RadioGroupStory({ args }: { args: UiRadioGroupProps }): React.ReactElement {
  const [value, setValue] = React.useState<string>('email');
  return (
    <UiRadioGroup
      options={args.options}
      label={args.label}
      error={args.error}
      disabled={args.disabled}
      required={args.required}
      value={value}
      onChange={setValue}
    />
  );
}

const meta: Meta<typeof UiRadioGroup> = {
  title: 'UiComponents/UiRadioGroup',
  component: UiRadioGroup,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Visible group label / accessible name for the radio group'),
    disabled: booleanControlArgType('Whether the whole group is disabled'),
    required: booleanControlArgType('Marks the group required for assistive technology'),
  },
};

export default meta;

type Story = StoryObj<typeof UiRadioGroup>;

export const RadioGroup: Story = {
  args: {
    options,
    label: "Бажаний спосіб зв'язку",
  },
  render: (args: UiRadioGroupProps): React.ReactElement => <RadioGroupStory args={args} />,
};
