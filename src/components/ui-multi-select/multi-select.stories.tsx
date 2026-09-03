import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  objectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiMultiSelectOption } from './types';

import UiMultiSelect from './index';

const options: UiMultiSelectOption[] = [
  { label: 'UX designer', value: 'ux' },
  { label: 'Розробник', value: 'dev' },
  { label: 'Дизайнер', value: 'design' },
  { label: 'Менеджер', value: 'manager' },
];

const meta: Meta<typeof UiMultiSelect> = {
  title: 'UiComponents/UiMultiSelect',
  component: UiMultiSelect,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Visible label / accessible name for the combobox'),
    placeholder: textControlArgType('Placeholder text shown when nothing is selected'),
    disabled: booleanControlArgType('Whether the control is disabled'),
    loading: booleanControlArgType('Whether the options are being fetched'),
    options: objectControlArgType(
      'The selectable options ({ label, value }) — edit to supply your own'
    ),
    // Selection is driven by the story's own state (so picking/removing chips
    // works); the initial chips come from `args.value`, so its panel control is off.
    value: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof UiMultiSelect>;

export const MultiSelect: Story = {
  args: {
    options,
    // Two preselected chips give the visual baseline something to render.
    value: [options[0], options[2]],
    label: 'Роль',
    placeholder: 'Почніть вводити',
  },
  // A stateful wrapper so the combobox is actually interactive in Storybook —
  // UiMultiSelect is controlled, so without local state nothing would change when
  // you pick an option or hit the chip delete / clear-all. `options` still comes
  // from args, so editing it in the Controls panel supplies your own items.
  render: function Render(args): React.ReactElement {
    const [value, setValue] = React.useState<UiMultiSelectOption[]>(args.value ?? []);
    return (
      <UiMultiSelect
        options={args.options}
        label={args.label}
        placeholder={args.placeholder}
        disabled={args.disabled}
        loading={args.loading}
        value={value}
        onChange={setValue}
      />
    );
  },
};

// This control keeps its clear-all × while loading — the × is Figma-mandated
// always-visible (node 622:44553) — so the arc is drawn as a 32px ring
// concentric with it rather than in its place.
export const Loading: Story = {
  args: {
    options,
    value: [options[0], options[2]],
    label: 'Роль',
    placeholder: 'Почніть вводити',
    loading: true,
  },
  render: MultiSelect.render,
};
