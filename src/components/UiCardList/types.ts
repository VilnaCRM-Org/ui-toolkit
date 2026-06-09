import type { ReactNode } from 'react';

export type UiCardItemData = {
  type: 'smallCard' | 'largeCard';
  id: string;
  imageSrc: string;
  title: string | ReactNode;
  text: string | ReactNode;
  alt: string;
  tooltipTitle?: ReactNode;
  tooltipLabel?: ReactNode;
};

export interface UiCardListProps {
  cardList: UiCardItemData[];
}

export interface UiCardItemProps {
  item: UiCardItemData;
}
