import { render } from '@testing-library/react';
import React from 'react';

import CardGrid from '../../src/components/UiCardList/CardGrid';

import { cardList, largeCardList, smallCardList } from './constants';

jest.mock('../../src/components/UiCardItem', () => {
  const mockReact: typeof import('react') = jest.requireActual('react');

  return {
    __esModule: true,
    default: jest.fn(() =>
      mockReact.createElement('div', {
        'data-testid': 'mock-ui-card-item',
      })
    ),
  };
});

describe('CardGrid component', () => {
  it('renders with correct props', () => {
    const { getByTestId } = render(React.createElement(CardGrid, { cardList }));

    const cardGrid: HTMLElement = getByTestId('mock-ui-card-item');
    expect(cardGrid).toBeInTheDocument();
  });

  it('renders with smallGrid style when cardList[0].type is smallCard', () => {
    const { container } = render(React.createElement(CardGrid, { cardList: smallCardList }));

    const gridElement: ChildNode | null = container.firstChild;
    const computedStyles: CSSStyleDeclaration = window.getComputedStyle(gridElement as Element);

    expect(computedStyles).toHaveProperty('gridTemplateColumns');
  });

  it('renders with largeGrid style when cardList[0].type is largeGrid', () => {
    const { container } = render(React.createElement(CardGrid, { cardList: largeCardList }));

    const gridElement: ChildNode | null = container.firstChild;
    const computedStyles: CSSStyleDeclaration = window.getComputedStyle(gridElement as Element);

    expect(computedStyles).toHaveProperty('gridTemplateColumns');
  });
});
