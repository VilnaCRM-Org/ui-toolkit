import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

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
  // UiSelectWithSearch is controlled, so a stateful wrapper persists the pick — without
  // it the value never updates, so Tab/arrow accept and option clicks appear to do
  // nothing and the transient input text clears on blur. Props are threaded explicitly
  // (the repo forbids prop-spreading); `aria-label` is kept so the label-less combobox
  // retains its accessible name.
  render: function Render(args): React.ReactElement {
    const [value, setValue] = React.useState<UiSelectWithSearchOption | null>(null);
    // The component is fluid (fills its container); Figma "select с пошуком" sizes it in
    // a 262px frame (node 448:25545), so the demo constrains it to that width — matching
    // the figma-parity showcase board. maxWidth keeps it responsive on a narrow canvas.
    return (
      <div style={{ width: 262, maxWidth: '100%' }}>
        <UiSelectWithSearch
          options={args.options}
          label={args.label}
          aria-label={args['aria-label']}
          placeholder={args.placeholder}
          disabled={args.disabled}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};
