import type { Meta, StoryObj } from '@storybook/react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import UiSearchInput from './index';

const suggestions: string[] = ['Топ продажники', 'Топ продажі за місяць', 'Топ продажі за рік'];

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
    placeholder: 'Щось шукаєте?',
    'aria-label': 'Пошук',
    options: suggestions,
  },
};

// The trailing spinner mirrors the leading magnifier at the same 10px gap. The
// slot is in the flow, so it also shortens the input box — a long typed value
// can never run underneath the arc.
export const Loading: Story = {
  args: {
    placeholder: 'Щось шукаєте?',
    'aria-label': 'Пошук',
    options: suggestions,
    loading: true,
  },
};
