import { render, waitFor } from '@testing-library/react';
import React from 'react';

import CardSwiper from '../../src/components/UiCardList/CardSwiper';

import { smallCardList } from './constants';

// CardSwiper renders the local parity card (`./UiCardItem`), not the canonical
// `src/components/UiCardItem`, so the mock must target the local module.
jest.mock('../../src/components/UiCardList/UiCardItem', () => {
  const mockReact: typeof import('react') = jest.requireActual('react');

  return {
    __esModule: true,
    default: jest.fn(() => mockReact.createElement('div', { 'data-testid': 'mock-card-item' })),
  };
});

function addTooltipNode(): HTMLDivElement {
  const tooltip: HTMLDivElement = document.createElement('div');
  tooltip.setAttribute('role', 'tooltip');
  tooltip.className = 'base-Popper-root';
  document.body.appendChild(tooltip);
  return tooltip;
}

describe('CardSwiper component', () => {
  afterEach(() => {
    document.querySelectorAll('[role="tooltip"].base-Popper-root').forEach(node => node.remove());
  });

  it('renders a swiper slide for every card item', () => {
    const { getByTestId, getAllByTestId } = render(
      React.createElement(CardSwiper, { cardList: smallCardList })
    );

    expect(getByTestId('swiper')).toBeInTheDocument();
    expect(getAllByTestId('swiper-slide')).toHaveLength(smallCardList.length);
    expect(getAllByTestId('mock-card-item')).toHaveLength(smallCardList.length);
  });

  it('disables pointer events while a tooltip is open and restores on close', async () => {
    const { container } = render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const swiperWrapper: HTMLElement = container.firstChild as HTMLElement;

    expect(swiperWrapper).not.toHaveStyle({ pointerEvents: 'none' });

    const tooltip: HTMLDivElement = addTooltipNode();
    await waitFor(() => expect(swiperWrapper).toHaveStyle({ pointerEvents: 'none' }));

    tooltip.remove();
    await waitFor(() => expect(swiperWrapper).toHaveStyle({ pointerEvents: 'auto' }));
  });

  it('disconnects the mutation observer on unmount', async () => {
    const disconnectSpy: jest.SpyInstance = jest.spyOn(MutationObserver.prototype, 'disconnect');

    const { container, unmount } = render(
      React.createElement(CardSwiper, { cardList: smallCardList })
    );
    const swiperWrapper: HTMLElement = container.firstChild as HTMLElement;

    unmount();
    expect(disconnectSpy).toHaveBeenCalled();

    // After disconnect + unmount the observer must no longer mutate the element,
    // so no inline pointer-events should have been written to it.
    addTooltipNode();
    await Promise.resolve();
    expect(swiperWrapper.getAttribute('style') ?? '').not.toContain('pointer-events');

    disconnectSpy.mockRestore();
  });
});
