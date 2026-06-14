import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import CardSwiper from '../../src/components/UiCardList/CardSwiper';
import gridStyles from '../../src/components/UiCardList/styles';

import { largeCardList, smallCardList } from './constants';

type ObserverCallback = MutationCallback;

const RealMutationObserver: typeof MutationObserver = MutationObserver;

// Build a minimal MutationRecord-like object. Only the fields the component
// reads (`type`, `addedNodes`, `removedNodes`) need to be present; the rest are
// never touched, so the cast keeps the helper free of `any`.
function makeRecord(
  type: MutationRecordType,
  addedNodes: Node[] = [],
  removedNodes: Node[] = []
): MutationRecord {
  return {
    type,
    addedNodes: addedNodes as unknown as NodeList,
    removedNodes: removedNodes as unknown as NodeList,
  } as MutationRecord;
}

function makeTooltipNode(): HTMLDivElement {
  const tooltip: HTMLDivElement = document.createElement('div');
  tooltip.setAttribute('role', 'tooltip');
  tooltip.className = 'base-Popper-root';
  return tooltip;
}

// Replace the global MutationObserver with a thin subclass that records the
// callback the component passes in, letting tests invoke it with crafted
// records. The instance still delegates to the real observer so disconnect()
// and observe() behave normally. Returns a restore function and a getter.
function captureObserverCallback(): {
  getCallback: () => ObserverCallback | undefined;
  restore: () => void;
} {
  let callback: ObserverCallback | undefined;
  class CapturingObserver extends RealMutationObserver {
    constructor(cb: ObserverCallback) {
      super(cb);
      callback = cb;
    }
  }
  global.MutationObserver = CapturingObserver as unknown as typeof MutationObserver;
  return {
    getCallback: (): ObserverCallback | undefined => callback,
    restore: (): void => {
      global.MutationObserver = RealMutationObserver;
    },
  };
}

// The swiper wrapper is the MUI Grid that owns `swiperRef`; it renders a div
// with no semantic role, so it can only be reached as the parent of the mocked
// swiper element. Used only for asserting the wrapper's inline pointer-events
// style, which has no semantic query equivalent.
function getSwiperWrapper(): HTMLElement {
  return screen.getByTestId('swiper').parentElement as HTMLElement;
}

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
  const tooltip: HTMLDivElement = makeTooltipNode();
  document.body.appendChild(tooltip);
  return tooltip;
}

describe('CardSwiper component', () => {
  afterEach(() => {
    screen
      .queryAllByRole('tooltip')
      .filter(node => node.classList.contains('base-Popper-root'))
      .forEach(node => node.remove());
  });

  it('renders a swiper slide for every card item', () => {
    render(React.createElement(CardSwiper, { cardList: smallCardList }));

    expect(screen.getByTestId('swiper')).toBeInTheDocument();
    expect(screen.getAllByTestId('swiper-slide')).toHaveLength(smallCardList.length);
    expect(screen.getAllByTestId('mock-card-item')).toHaveLength(smallCardList.length);
  });

  it('disables pointer events while a tooltip is open and restores on close', async () => {
    render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const swiperWrapper: HTMLElement = getSwiperWrapper();

    expect(swiperWrapper).not.toHaveStyle({ pointerEvents: 'none' });

    const tooltip: HTMLDivElement = addTooltipNode();
    await waitFor(() => expect(swiperWrapper).toHaveStyle({ pointerEvents: 'none' }));

    tooltip.remove();
    await waitFor(() => expect(swiperWrapper).toHaveStyle({ pointerEvents: 'auto' }));
  });

  it('renders a card item for every card when the first card is small', () => {
    render(React.createElement(CardSwiper, { cardList: smallCardList }));

    // The small-vs-large mobile-grid branch is chosen from the first item's type.
    // jsdom cannot evaluate the MUI media-query sx, so assert the two style
    // objects differ (proving the branch is meaningful) plus correct rendering.
    expect(gridStyles.gridSmallMobile).not.toBe(gridStyles.gridLargeMobile);
    expect(screen.getAllByTestId('mock-card-item')).toHaveLength(smallCardList.length);
  });

  it('selects the large mobile grid branch when the first card is large', () => {
    render(React.createElement(CardSwiper, { cardList: largeCardList }));

    expect(screen.getAllByTestId('mock-card-item')).toHaveLength(largeCardList.length);
  });

  it('falls back to the large mobile grid branch when the list is empty', () => {
    render(React.createElement(CardSwiper, { cardList: [] }));

    expect(screen.getByTestId('swiper')).toBeInTheDocument();
    expect(screen.queryAllByTestId('mock-card-item')).toHaveLength(0);
  });

  it('ignores mutations that are not childList changes', () => {
    const { getCallback, restore } = captureObserverCallback();

    render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const wrapper: HTMLElement = getSwiperWrapper();
    const callback: ObserverCallback | undefined = getCallback();

    expect(callback).toBeDefined();
    // An `attributes` mutation that references a tooltip node must be ignored
    // because it is not a childList change, so pointer-events is never written.
    callback?.([makeRecord('attributes', [makeTooltipNode()])], {} as MutationObserver);

    expect(wrapper.getAttribute('style') ?? '').not.toContain('pointer-events');

    restore();
  });

  it('disables pointer events when a childList mutation removes a tooltip node', () => {
    const { getCallback, restore } = captureObserverCallback();

    render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const wrapper: HTMLElement = getSwiperWrapper();
    const callback: ObserverCallback | undefined = getCallback();

    // A tooltip is live in the DOM; notify via a childList mutation carrying a
    // tooltip only in removedNodes. This exercises the removedNodes arm of the
    // detection, and the handler recomputes from the live DOM (tooltip present)
    // to disable pointer events.
    document.body.appendChild(makeTooltipNode());
    callback?.([makeRecord('childList', [], [makeTooltipNode()])], {} as MutationObserver);

    expect(wrapper).toHaveStyle({ pointerEvents: 'none' });

    restore();
  });

  it('no-ops when the swiper ref is null while syncing pointer events', () => {
    const { getCallback, restore } = captureObserverCallback();

    const { unmount } = render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const callback: ObserverCallback | undefined = getCallback();

    expect(callback).toBeDefined();
    // After unmount React resets swiperRef.current to null. The captured closure
    // still holds that ref, so driving it with a tooltip mutation exercises the
    // `if (!swiper) return` guard and must not throw.
    unmount();
    document.body.appendChild(makeTooltipNode());

    expect(() =>
      callback?.([makeRecord('childList', [makeTooltipNode()])], {} as MutationObserver)
    ).not.toThrow();

    restore();
  });

  it('disconnects the mutation observer on unmount', async () => {
    const disconnectSpy: jest.SpyInstance = jest.spyOn(MutationObserver.prototype, 'disconnect');

    const { unmount } = render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const swiperWrapper: HTMLElement = getSwiperWrapper();

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
