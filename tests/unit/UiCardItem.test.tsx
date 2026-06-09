import { render, screen } from '@testing-library/react';
import React from 'react';

import UiCardItem from '../../src/components/UiCardList/UiCardItem';

const cardItem = {
  id: 'card-1',
  title: 'Card title',
  text: 'Card text',
  type: 'smallCard' as const,
  alt: 'Card image',
  imageSrc: 'https://example.com/card.png',
};

describe('UiCardItem', () => {
  it('renders card content and image', () => {
    render(<UiCardItem item={cardItem} />);

    expect(screen.getByRole('heading', { name: 'Card title' })).toBeInTheDocument();
    expect(screen.getByText('Card text')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Card image');
  });
});
