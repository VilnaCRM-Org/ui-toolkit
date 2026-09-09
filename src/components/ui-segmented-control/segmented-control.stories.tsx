import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { SegmentedOption, UiSegmentedControlProps } from './types';

import UiSegmentedControl from './index';

// Board B's own three period options, verbatim (the component bakes in no
// natural-language literal of its own).
const options: SegmentedOption[] = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
];

// The control is always controlled, so a stateful wrapper seeds the selection
// (preselecting the first segment, matching the Figma rest master) and keeps
// the story interactive. Props are threaded explicitly (the repo forbids
// prop-spreading).
function SegmentedControlStory({
  args,
}: Readonly<{ args: UiSegmentedControlProps }>): React.ReactElement {
  const [value, setValue] = React.useState<string>('week');
  return (
    <UiSegmentedControl
      options={args.options}
      label={args.label}
      disabled={args.disabled}
      value={value}
      onChange={setValue}
    />
  );
}

const meta: Meta<typeof UiSegmentedControl> = {
  title: 'UiComponents/UiSegmentedControl',
  component: UiSegmentedControl,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Accessible name for the radiogroup'),
    disabled: booleanControlArgType('Disables every segment (aria-disabled boundary)'),
  },
};

export default meta;

type Story = StoryObj<typeof UiSegmentedControl>;

export const SegmentedControl: Story = {
  args: { options, label: 'Період' },
  render: (args: UiSegmentedControlProps): React.ReactElement => (
    <SegmentedControlStory args={args} />
  ),
};
