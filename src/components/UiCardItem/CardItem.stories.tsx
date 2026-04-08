import type { Meta, StoryObj } from '@storybook/react';

import UiCardList from '../UiCardList';
import type { CardList } from '../UiCardList/types';

import { LARGE_CARD_ITEM, SMALL_CARD_ITEM } from './constants';

const meta: Meta<typeof UiCardList> = {
  title: 'UiComponents/UiCardItem',
  component: UiCardList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta> & {
  args: CardList;
};

export const CardItemLarge: Story = {
  args: {
    cardList: [LARGE_CARD_ITEM],
  },
};
export const CardItemSmall: Story = {
  args: {
    cardList: [SMALL_CARD_ITEM],
  },
};
