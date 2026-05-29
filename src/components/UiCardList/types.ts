import { CardItem, CardType } from '../UiCardItem/types';

export type { CardItem, CardType };

export type NonEmptyCardList = [CardItem, ...CardItem[]];

export interface CardList {
  cardList: NonEmptyCardList;
}
