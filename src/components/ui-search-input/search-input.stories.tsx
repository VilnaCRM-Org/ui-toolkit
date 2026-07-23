import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';

import UiSearchInput from './index';

const suggestions: string[] = ['Top performers', 'Top sales this month', 'Top sales this year'];

const meta: Meta<typeof UiSearchInput> = {
  title: 'UiComponents/UiSearchInput',
  component: UiSearchInput,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      type: 'string',
      description: 'Placeholder text for the search field',
      control: { type: 'text' },
    },
    value: {
      type: 'string',
      description: 'Controlled search text',
      control: { type: 'text' },
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the search field is disabled',
      control: { type: 'boolean' },
    },
    error: {
      type: 'boolean',
      description: 'Whether the search field is in error state',
      control: { type: 'boolean' },
    },
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
