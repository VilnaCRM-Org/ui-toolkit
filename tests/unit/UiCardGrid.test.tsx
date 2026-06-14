import { render, screen } from '@testing-library/react';
import React from 'react';

import CardGrid from '../../src/components/UiCardList/CardGrid';
import gridStyles from '../../src/components/UiCardList/styles';

import { cardList, largeCardList, smallCardList } from './constants';

// Capture the `sx` passed to the layout Grid so we can assert the small/large
// branch selection directly (jsdom does not evaluate MUI media-query sx, so
// computed styles can't distinguish the branches). CardGrid renders a `Grid`.
const mockGrid: jest.Mock = jest.fn();

jest.mock('@mui/material', () => {
  const actual: typeof import('@mui/material') = jest.requireActual('@mui/material');
  const mockReact: typeof import('react') = jest.requireActual('react');

  return {
    __esModule: true,
    ...actual,
    Grid: (props: {
      sx?: unknown;
      children?: import('react').ReactNode;
    }): import('react').ReactElement => {
      mockGrid(props);
      return mockReact.createElement('div', { 'data-testid': 'card-grid' }, props.children);
    },
  };
});

// CardGrid renders the local parity card (`./UiCardItem`), not the canonical
// `src/components/UiCardItem`, so the mock must target the local module.
jest.mock('../../src/components/UiCardList/UiCardItem', () => {
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
    render(React.createElement(CardGrid, { cardList }));

    expect(screen.getAllByTestId('mock-ui-card-item')).toHaveLength(cardList.length);
  });

  it('selects the smallGrid style when the first item is a small card', () => {
    render(React.createElement(CardGrid, { cardList: smallCardList }));

    expect(mockGrid).toHaveBeenCalledWith(expect.objectContaining({ sx: gridStyles.smallGrid }));
  });

  it('selects the largeGrid style when the first item is a large card', () => {
    render(React.createElement(CardGrid, { cardList: largeCardList }));

    expect(mockGrid).toHaveBeenCalledWith(expect.objectContaining({ sx: gridStyles.largeGrid }));
  });

  it('falls back to the largeGrid style when the list is empty', () => {
    render(React.createElement(CardGrid, { cardList: [] }));

    expect(mockGrid).toHaveBeenCalledWith(expect.objectContaining({ sx: gridStyles.largeGrid }));
  });

  it('uses distinct style objects for the small and large branches', () => {
    expect(gridStyles.smallGrid).not.toBe(gridStyles.largeGrid);
  });
});
