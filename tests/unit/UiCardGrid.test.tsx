import { render } from '@testing-library/react';
import React from 'react';

import CardGrid from '../../src/components/UiCardList/CardGrid';
import gridStyles from '../../src/components/UiCardList/styles';

import { cardList, largeCardList, smallCardList } from './constants';

// Capture the `sx` passed to the layout Box so we can assert the small/large
// branch selection directly (jsdom does not evaluate MUI media-query sx, so
// computed styles can't distinguish the branches).
const mockBox: jest.Mock = jest.fn();

jest.mock('@mui/material', () => {
  const actual: typeof import('@mui/material') = jest.requireActual('@mui/material');
  const mockReact: typeof import('react') = jest.requireActual('react');

  return {
    __esModule: true,
    ...actual,
    Box: (props: {
      sx?: unknown;
      children?: import('react').ReactNode;
    }): import('react').ReactElement => {
      mockBox(props);
      return mockReact.createElement('div', { 'data-testid': 'card-grid' }, props.children);
    },
  };
});

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
  it('renders a card item for every entry in the list', () => {
    const { getAllByTestId } = render(React.createElement(CardGrid, { cardList }));

    expect(getAllByTestId('mock-ui-card-item')).toHaveLength(cardList.length);
  });

  it('selects the smallGrid style when the first item is a small card', () => {
    render(React.createElement(CardGrid, { cardList: smallCardList }));

    expect(mockBox).toHaveBeenCalledWith(expect.objectContaining({ sx: gridStyles.smallGrid }));
  });

  it('selects the largeGrid style when the first item is a large card', () => {
    render(React.createElement(CardGrid, { cardList: largeCardList }));

    expect(mockBox).toHaveBeenCalledWith(expect.objectContaining({ sx: gridStyles.largeGrid }));
  });

  it('uses distinct style objects for the small and large branches', () => {
    expect(gridStyles.smallGrid).not.toBe(gridStyles.largeGrid);
  });
});
