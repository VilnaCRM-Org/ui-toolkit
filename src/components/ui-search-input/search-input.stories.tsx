import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';
import React from 'react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';
import { expectTypeaheadNarrowsAndSelects } from '../../../.storybook/field-typeahead-interactions';

import UiSearchInput from './index';

const suggestions: string[] = ['Top performers', 'Top sales this month', 'Top sales this year'];
const searchLabel: string = t('Search');
const typedQuery: string = 'Top sales';
const chosenSuggestion: string = 'Top sales this year';
const filteredOutSuggestion: string = 'Top performers';

// The field is fully controlled, so the interaction story owns the search text.
function SearchInputInteractionStory(): React.ReactElement {
  const [value, setValue] = React.useState<string>('');

  return (
    <UiSearchInput
      aria-label={searchLabel}
      placeholder={searchLabel}
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
    error: booleanControlArgType('Whether the search field is in error state'),
  },
};

export default meta;

type Story = StoryObj<typeof UiSearchInput>;

export const SearchInput: Story = {
  args: {
    placeholder: t('Search'),
    'aria-label': t('Search'),
    options: suggestions,
    error: false,
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
