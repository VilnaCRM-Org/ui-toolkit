import { useMediaQuery } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiCardList from '../../src/components/ui-card-list';
import CardGrid from '../../src/components/ui-card-list/card-grid';
import CardSwiper from '../../src/components/ui-card-list/card-swiper';
import type { UiCardItemData } from '../../src/components/ui-card-list/types';

import { cardList, largeCard, smallCard } from './constants';
import mockConsoleWarn from './utils/mock-console-warn';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

jest.mock('../../src/components/ui-card-list/card-swiper', () => {
  const mockReact: typeof import('react') = jest.requireActual('react');

  return jest.fn(() => mockReact.createElement('section', { 'aria-label': 'card swiper' }));
});

jest.mock('../../src/components/ui-card-list/card-grid', () => {
  const mockReact: typeof import('react') = jest.requireActual('react');

  return jest.fn(() => mockReact.createElement('section', { 'aria-label': 'card grid' }));
});

const HIDDEN: { hidden: true } = { hidden: true };

describe('UiCardList component', () => {
  const mockedUseMediaQuery: jest.Mock = useMediaQuery as jest.Mock;
  const mockedCardSwiper: jest.Mock = CardSwiper as unknown as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders CardGrid and not CardSwiper on large screens', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(React.createElement(UiCardList, { cardList }));

    expect(screen.getByRole('region', { ...HIDDEN, name: 'card grid' })).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { ...HIDDEN, name: 'card swiper' })
    ).not.toBeInTheDocument();
    expect(mockedCardSwiper).not.toHaveBeenCalled();
  });

  it('renders CardSwiper and not CardGrid on small screens', () => {
    mockedUseMediaQuery.mockReturnValue(true);

    render(React.createElement(UiCardList, { cardList }));

    expect(screen.getByRole('region', { ...HIDDEN, name: 'card swiper' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { ...HIDDEN, name: 'card grid' })).not.toBeInTheDocument();
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

describe('UiCardList nullish cardList degradation', () => {
  const warn = mockConsoleWarn();
  const mockedUseMediaQuery: jest.Mock = useMediaQuery as jest.Mock;
  const mockedCardGrid: jest.Mock = CardGrid as unknown as jest.Mock;
  const mockedCardSwiper: jest.Mock = CardSwiper as unknown as jest.Mock;

  // The strict `cardList` type forbids nullish values, but runtime data can
  // supply one; the entry must normalize it to [] so neither child crashes.
  const nullishCardList: UiCardItemData[] = undefined as unknown as UiCardItemData[];

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('normalizes a nullish cardList to an empty array for the grid branch', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(React.createElement(UiCardList, { cardList: nullishCardList }));

    expect(mockedCardGrid.mock.calls[0][0]).toEqual(expect.objectContaining({ cardList: [] }));
  });

  it('normalizes a nullish cardList to an empty array for the swiper branch', () => {
    mockedUseMediaQuery.mockReturnValue(true);

    render(React.createElement(UiCardList, { cardList: nullishCardList }));

    expect(mockedCardSwiper.mock.calls[0][0]).toEqual(expect.objectContaining({ cardList: [] }));
  });

  it('forwards the real cardList unchanged to the grid when one is provided', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(React.createElement(UiCardList, { cardList }));

    expect(mockedCardGrid.mock.calls[0][0]).toEqual(expect.objectContaining({ cardList }));
  });

  it('reuses one empty-list fallback across re-renders', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { rerender } = render(React.createElement(UiCardList, { cardList: nullishCardList }));
    rerender(React.createElement(UiCardList, { cardList: nullishCardList }));

    // The children are memoized on shallow prop equality, so a fresh `[]` per
    // render would hand them a new `cardList` every pass and undo it. Identity,
    // not deep equality, is what the memo compares.
    const [first, second]: UiCardItemData[][] = mockedCardGrid.mock.calls.map(
      call => call[0].cardList
    );
    expect(second).toBe(first);
  });

  it('warns in development when cardList is nullish', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(React.createElement(UiCardList, { cardList: nullishCardList }));

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('nullish'));
  });

  it('stays silent when a valid cardList is provided', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(React.createElement(UiCardList, { cardList }));

    expect(warn.spy).not.toHaveBeenCalled();
  });
});

describe('UiCardList mixed card types', () => {
  const warn = mockConsoleWarn();
  const mockedUseMediaQuery: jest.Mock = useMediaQuery as jest.Mock;
  const mixedCardList: UiCardItemData[] = [smallCard, { ...largeCard, id: 'large-1' }];

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('warns exactly once per mount when the list mixes smallCard and largeCard', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { rerender } = render(React.createElement(UiCardList, { cardList: mixedCardList }));
    rerender(React.createElement(UiCardList, { cardList: [...mixedCardList] }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('mixing `smallCard` and `largeCard`')
    );
  });

  it('spells out the per-list type rule in the mixed-types warning', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(React.createElement(UiCardList, { cardList: mixedCardList }));

    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('the first item, so the others render in the wrong grid.')
    );
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('Use one `type` per list.'));
  });

  it('warns whichever type comes first', () => {
    mockedUseMediaQuery.mockReturnValue(true);

    render(React.createElement(UiCardList, { cardList: [...mixedCardList].reverse() }));

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('mixing'));
  });

  it('stays quiet for a homogeneous list and for an empty one', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(React.createElement(UiCardList, { cardList: [smallCard, { ...smallCard, id: 'b' }] }));
    render(React.createElement(UiCardList, { cardList: [] }));

    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('emits nothing in production for a mixed list', () => {
    mockedUseMediaQuery.mockReturnValue(false);
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(React.createElement(UiCardList, { cardList: mixedCardList }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
