import { CardItem, CardType, HeadingLevel } from '../UiCardItem/types';

export type { CardItem, CardType, HeadingLevel };

export type NonEmptyCardList = [CardItem, ...CardItem[]];

export interface CardList {
  cardList: NonEmptyCardList;
  /**
   * Overrides the rendered heading element of every card title so consumers can
   * keep a valid document outline. Visual size is unchanged. Defaults to `h6`
   * for small cards and `h5` for large cards.
   */
  headingComponent?: HeadingLevel;
}
