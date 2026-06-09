import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiCardList } from '../../src/components';

jest.mock('../../src/components/UiCardList/CardSwiper', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="card-swiper" />),
}));

const cardList = [
  {
    id: 'card-1',
    title: 'Card title',
    text: 'Card text',
    type: 'smallCard' as const,
    alt: 'Card image',
    imageSrc: 'https://example.com/card.png',
  },
];

describe('UiCardList', () => {
  it('renders the swiper container', () => {
    render(<UiCardList cardList={cardList} />);
    expect(screen.getByTestId('card-swiper')).toBeInTheDocument();
  });
});
