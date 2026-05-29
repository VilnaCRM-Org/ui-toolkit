export type CardType = 'smallCard' | 'largeCard';

export type CardItem = {
  type: CardType;
  id: string;
  imageSrc: string;
  title: string;
  text: string;
  alt: string;
};

export interface UiCardItemProps {
  item: CardItem;
}

export interface CardContentProps {
  item: CardItem;
  isSmallCard: boolean;
}

export interface ImageList {
  image: string;
  alt: string;
}
