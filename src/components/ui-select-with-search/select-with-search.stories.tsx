import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import React from 'react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';
import { expectTypeaheadNarrowsAndSelects } from '../../../.storybook/field-typeahead-interactions';

import type { UiSelectWithSearchOption } from './types';

import UiSelectWithSearch from './index';

const options: UiSelectWithSearchOption[] = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv' },
  { label: 'Odesa', value: 'odesa' },
  { label: 'Kharkiv', value: 'kharkiv' },
];
const cityLabel: string = t('City');
const cityPlaceholder: string = t('Search city');
const typedQuery: string = 'Lv';
const chosenCity: string = 'Lviv';
const filteredOutCity: string = 'Odesa';

// The combobox is fully controlled, so the interaction story owns the selection.
function SelectWithSearchInteractionStory(): React.ReactElement {
  const [value, setValue] = React.useState<UiSelectWithSearchOption | null>(null);

  return (
    <UiSelectWithSearch
      options={options}
      label={cityLabel}
      placeholder={cityPlaceholder}
      value={value}
      onChange={setValue}
    />
  );
}

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
    label: cityLabel,
    placeholder: cityPlaceholder,
    error: false,
  },
};

// Interaction story (`interaction` tag): proves the search text narrows the
// listbox and the picked option becomes the field's value.
export const SearchNarrowsAndSelectsOption: Story = {
  tags: ['interaction', '!autodocs'],
  render: SelectWithSearchInteractionStory,
  play: async ({ canvasElement }): Promise<void> => {
    await expectTypeaheadNarrowsAndSelects({
      canvasElement,
      fieldName: cityLabel,
      query: typedQuery,
      chosenOption: chosenCity,
      filteredOutOption: filteredOutCity,
    });
  },
};
