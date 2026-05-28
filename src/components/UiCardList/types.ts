export type CardType = 'smallCard' | 'largeCard';

export type CardItem = {
  type: CardType;
  id: string;
  imageSrc: string;
  title: string;
  text: string;
  alt: string;
};

export type NonEmptyCardList = [CardItem, ...CardItem[]];

export interface CardList {
  cardList: NonEmptyCardList;
}
