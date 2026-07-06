import type { Meta, StoryObj } from '@storybook/react';
import { t } from 'i18next';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import UiSearchInput from './index';

const suggestions: string[] = ['Top performers', 'Top sales this month', 'Top sales this year'];

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
