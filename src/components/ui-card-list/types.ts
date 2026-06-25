import type { ReactNode } from 'react';

import type { StaticImageSrc } from '@/types/assets';

import type { CardItem, CardType, HeadingLevel } from '../ui-card-item/types';

export type { CardItem, CardType, HeadingLevel };

export type NonEmptyCardList = [CardItem, ...CardItem[]];

export type UiCardItemData = {
  type: 'smallCard' | 'largeCard';
  id: string;
  imageSrc: StaticImageSrc;
  title: string | ReactNode;
  text: string | ReactNode;
  alt: string;
  tooltipTitle?: ReactNode;
  tooltipLabel?: ReactNode;
};

export interface UiCardListProps {
  cardList: UiCardItemData[];
  /**
   * Overrides the rendered heading element of every card title so consumers can
   * keep a valid document outline. Visual size is unchanged. Defaults to `h3`.
   */
  headingComponent?: HeadingLevel;
}

/**
 * Prop contract for the canonical (main-lineage) card-list components and
 * stories that build fixtures from `NonEmptyCardList`. `UiCardListProps` is the
 * Stack-4 parity surface; both accept the shared {@link headingComponent}.
 */
export interface CardList {
  cardList: NonEmptyCardList;
  headingComponent?: HeadingLevel;
}

export interface UiCardItemProps {
  item: UiCardItemData;
  /** See {@link UiCardListProps.headingComponent}. */
  headingComponent?: HeadingLevel;
}
