import { CardItem, CardType, NonEmptyCardList } from '@/components/ui-card-list/types';
import { SocialMedia } from '@/components/ui-footer/types';

export const testId: string = '00000000-0000-4000-8000-000000000000';
export const testTitle: string = 'sample title';
export const testText: string = 'sample text';
export const testImg: string = 'https://example.com/avatar.png';
export const testInitials: string = 'John Doe';
export const testEmail: string = 'test@example.com';
export const testPlaceholder: string = 'sample placeholder';
export const testUrl: string = 'https://example.com';
export const mockEmail: string = 'info@vilnacrm.com';

export const typeOfCard: CardType = 'smallCard';

export const cardItem: CardItem = {
  id: testId,
  title: testTitle,
  text: testText,
  type: typeOfCard,
  alt: testText,
  imageSrc: testImg,
};
export const smallCard: CardItem = {
  id: testId,
  title: testTitle,
  text: testText,
  type: 'smallCard',
  alt: testText,
  imageSrc: testImg,
};
export const largeCard: CardItem = {
  id: testId,
  title: testTitle,
  text: testText,
  type: 'largeCard',
  alt: testText,
  imageSrc: testImg,
};

export const cardList: NonEmptyCardList = [
  {
    id: testId,
    title: testTitle,
    text: testText,
    type: typeOfCard,
    alt: testText,
    imageSrc: testImg,
  },
];
export const smallCardList: NonEmptyCardList = [
  {
    id: testId,
    title: testTitle,
    text: testText,
    type: 'smallCard',
    alt: testText,
    imageSrc: testImg,
  },
];
export const largeCardList: NonEmptyCardList = [
  {
    id: testId,
    title: testTitle,
    text: testText,
    type: 'largeCard',
    alt: testText,
    imageSrc: testImg,
  },
];

export const mockedSocialLinks: SocialMedia[] = [
  {
    id: testId,
    icon: testImg,
    alt: testText,
    linkHref: 'https://www.instagram.com/',
    ariaLabel: testTitle,
  },
];
