import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';
import { expectTypeaheadNarrowsAndSelects } from '../../../.storybook/field-typeahead-interactions';

import UiSearchInput from './index';

const suggestions: string[] = ['Топ продажники', 'Топ продажі за місяць', 'Топ продажі за рік'];
const searchLabel: string = 'Пошук';
const searchPlaceholder: string = 'Щось шукаєте?';
const typedQuery: string = 'Топ продажі';
const chosenSuggestion: string = 'Топ продажі за рік';
const filteredOutSuggestion: string = 'Топ продажники';

// The field is fully controlled, so the interaction story owns the search text.
function SearchInputInteractionStory(): React.ReactElement {
  const [value, setValue] = React.useState<string>('');

  return (
    <UiSearchInput
      aria-label={searchLabel}
      placeholder={searchPlaceholder}
      options={suggestions}
      value={value}
      onChange={setValue}
    />
  );
}

const meta: Meta<typeof UiSearchInput> = {
  title: 'UiComponents/UiSearchInput',
  component: UiSearchInput,
  tags: ['autodocs'],
  argTypes: {
    placeholder: textControlArgType('Placeholder text for the search field'),
    value: textControlArgType('Controlled search text'),
    disabled: booleanControlArgType('Whether the search field is disabled'),
    loading: booleanControlArgType('Whether the suggestions are being fetched'),
  },
};

export default meta;

type Story = StoryObj<typeof UiSearchInput>;

export const SearchInput: Story = {
  args: {
    placeholder: searchPlaceholder,
    'aria-label': searchLabel,
    options: suggestions,
  },
};

// The trailing spinner mirrors the leading magnifier at the same 10px gap. The
// slot is in the flow, so it also shortens the input box — a long typed value
// can never run underneath the arc.
export const Loading: Story = {
  args: {
    placeholder: searchPlaceholder,
    'aria-label': searchLabel,
    options: suggestions,
    loading: true,
  },
};

// Interaction story (`interaction` tag): proves typing filters the suggestions and
// picking one writes it back into the field.
export const SuggestionPickFillsField: Story = {
  tags: ['interaction', '!autodocs'],
  render: SearchInputInteractionStory,
  play: async ({ canvasElement }): Promise<void> => {
    await expectTypeaheadNarrowsAndSelects({
      canvasElement,
      fieldName: searchLabel,
      query: typedQuery,
      chosenOption: chosenSuggestion,
      filteredOutOption: filteredOutSuggestion,
    });
  },
};
