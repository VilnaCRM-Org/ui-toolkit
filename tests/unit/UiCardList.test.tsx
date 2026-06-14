import { useMediaQuery } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiCardList from '../../src/components/UiCardList';
import CardSwiper from '../../src/components/UiCardList/CardSwiper';

import { cardList } from './constants';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

jest.mock('../../src/components/UiCardList/CardSwiper', () => {
  const mockReact: typeof import('react') = jest.requireActual('react');

  return jest.fn(() =>
    mockReact.createElement('div', {
      'data-testid': 'card-swiper',
    })
  );
});

jest.mock('../../src/components/UiCardList/CardGrid', () => {
  const mockReact: typeof import('react') = jest.requireActual('react');

  return jest.fn(() =>
    mockReact.createElement('div', {
      'data-testid': 'card-grid',
    })
  );
});

describe('UiCardList component', () => {
  const mockedUseMediaQuery: jest.Mock = useMediaQuery as jest.Mock;
  const mockedCardSwiper: jest.Mock = CardSwiper as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders CardGrid and not CardSwiper on large screens', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(React.createElement(UiCardList, { cardList }));

    expect(screen.getByTestId('card-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('card-swiper')).not.toBeInTheDocument();
    expect(mockedCardSwiper).not.toHaveBeenCalled();
  });

  it('renders CardSwiper and not CardGrid on small screens', () => {
    mockedUseMediaQuery.mockReturnValue(true);

    render(React.createElement(UiCardList, { cardList }));

    expect(screen.getByTestId('card-swiper')).toBeInTheDocument();
    expect(screen.queryByTestId('card-grid')).not.toBeInTheDocument();
  });
});

describe('UiCardList media query argument', () => {
  const mockedUseMediaQuery: jest.Mock = useMediaQuery as jest.Mock;

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('queries useMediaQuery with the exact sm - 0.02 max-width string', (): void => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(React.createElement(UiCardList, { cardList }));

    expect(mockedUseMediaQuery).toHaveBeenCalledWith('(max-width: 639.98px)');
  });

  it('does not query useMediaQuery with the sm + 0.02 max-width string', (): void => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(React.createElement(UiCardList, { cardList }));

    expect(mockedUseMediaQuery).not.toHaveBeenCalledWith('(max-width: 640.02px)');
  });

  it('does not query useMediaQuery with an empty string', (): void => {
    mockedUseMediaQuery.mockReturnValue(true);

    render(React.createElement(UiCardList, { cardList }));

    expect(mockedUseMediaQuery).not.toHaveBeenCalledWith('');
  });
});
