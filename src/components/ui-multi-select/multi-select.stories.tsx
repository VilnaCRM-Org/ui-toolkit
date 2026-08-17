import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import React from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

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
const citiesLabel: string = t('Cities');
const citiesPlaceholder: string = t('Select cities');
const firstPick: string = 'Lviv';
const secondPick: string = 'Odesa';

// The combobox is fully controlled, so the interaction story owns the chip set and
// starts from an empty selection.
function MultiSelectInteractionStory(): React.ReactElement {
  const [value, setValue] = React.useState<UiMultiSelectOption[]>([]);

  return (
    <UiMultiSelect
      options={options}
      value={value}
      label={citiesLabel}
      placeholder={citiesPlaceholder}
      onChange={setValue}
    />
  );
}

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
    label: citiesLabel,
    placeholder: citiesPlaceholder,
    error: false,
  },
};

// Interaction story (`interaction` tag): proves picking two options turns them into
// chips inside the field. The listbox is portalled outside the story canvas, so it
// is queried from `screen`. See tests/storybook/README.md.
export const PickingOptionsAddsChips: Story = {
  tags: ['interaction', '!autodocs'],
  render: MultiSelectInteractionStory,
  play: async ({ canvasElement }): Promise<void> => {
    const canvas: ReturnType<typeof within> = within(canvasElement);

    await userEvent.click(canvas.getByRole('combobox', { name: citiesLabel }));
    await userEvent.click(await screen.findByRole('option', { name: firstPick }));
    await userEvent.click(await screen.findByRole('option', { name: secondPick }));

    await expect(canvas.getByText(firstPick)).toBeVisible();
    await expect(canvas.getByText(secondPick)).toBeVisible();
  },
};
