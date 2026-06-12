import { StaticImageSrc } from '@/types/assets';

export type CardType = 'smallCard' | 'largeCard';

// Semantic heading element for the card title. Decoupled from the visual size
// so consumers can keep a valid document outline regardless of card variant.
export type HeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type CardItem = {
  type: CardType;
  id: string;
  imageSrc: StaticImageSrc;
  title: string;
  text: string;
  alt: string;
};

export interface UiCardItemProps {
  item: CardItem;
  /**
   * Overrides the rendered heading element for the card title to preserve the
   * consumer's document outline. Visual size is controlled by `variant`, not
   * this prop. Defaults to `h6` for small cards and `h5` for large cards.
   */
  headingComponent?: HeadingLevel;
}

export interface CardContentProps {
  item: CardItem;
  isSmallCard: boolean;
  /** See {@link UiCardItemProps.headingComponent}. */
  headingComponent?: HeadingLevel;
}

export interface ImageList {
  image: StaticImageSrc;
  alt: string;
}
