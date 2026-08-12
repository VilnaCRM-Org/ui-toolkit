import { Grid, SxProps, Theme } from '@mui/material';
import { RenderResult, render, renderHook, screen, waitFor } from '@testing-library/react';
import React from 'react';

import CardSwiper, {
  useTooltipPointerEventsSync,
} from '../../src/components/ui-card-list/card-swiper';
import gridStyles from '../../src/components/ui-card-list/styles';
import type { UiCardItemData } from '../../src/components/ui-card-list/types';

import { largeCardList, smallCard, smallCardList } from './constants';
import mockConsoleWarn from './utils/mock-console-warn';

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
function toWrapper(swiper: HTMLElement): HTMLElement {
  return swiper.parentElement as HTMLElement;
}

function getSwiperWrapper(): HTMLElement {
  return toWrapper(screen.getByTestId('swiper'));
}

// CardSwiper renders the local parity card (`./ui-card-item`), not the canonical
// `src/components/ui-card-item`, so the mock must target the local module.
jest.mock('../../src/components/ui-card-list/ui-card-item', () => {
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
    // Restore unconditionally so a test that throws before its own restore()
    // cannot leak the patched constructor into later tests.
    global.MutationObserver = RealMutationObserver;
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

  it('stops syncing a swiper once it has unmounted', () => {
    const { getCallback, restore } = captureObserverCallback();

    const { unmount } = render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const wrapper: HTMLElement = getSwiperWrapper();
    const callback: ObserverCallback | undefined = getCallback();

    expect(callback).toBeDefined();
    // Unmounting deregisters the swiper from the shared registry, so a later
    // tooltip mutation must neither throw nor write to the detached wrapper.
    unmount();
    document.body.appendChild(makeTooltipNode());

    expect(() =>
      callback?.([makeRecord('childList', [makeTooltipNode()])], {} as MutationObserver)
    ).not.toThrow();
    expect(wrapper.getAttribute('style') ?? '').not.toContain('pointer-events');

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

// --- Mutant-killing additions -------------------------------------------------
// The default swiper stand-in (wired via jest moduleNameMapper) drops the
// `pagination` and `modules` props, leaving JSX-prop mutations on them alive.
// Replace the module with a richer stand-in that serialises those props onto the
// rendered DOM while preserving the test ids and children every other test uses.
jest.mock('swiper/react', () => {
  const reactForSwiper: typeof import('react') = jest.requireActual('react');

  function SwiperStub(
    props: Readonly<{
      children?: React.ReactNode;
      pagination?: { clickable?: boolean };
      modules?: unknown[];
      loop?: boolean;
    }>
  ): React.ReactElement {
    const pagination: { clickable?: boolean } | undefined = props.pagination;
    const hasClickableKey: boolean =
      pagination !== undefined && Object.prototype.hasOwnProperty.call(pagination, 'clickable');
    return reactForSwiper.createElement(
      'div',
      {
        'data-testid': 'swiper',
        'data-pagination-has-clickable-key': String(hasClickableKey),
        'data-pagination-clickable': String(pagination?.clickable === true),
        'data-modules-count': String(Array.isArray(props.modules) ? props.modules.length : -1),
        'data-loop': String(props.loop === true),
      },
      props.children
    );
  }

  function SwiperSlideStub(props: Readonly<{ children?: React.ReactNode }>): React.ReactElement {
    return reactForSwiper.createElement('div', { 'data-testid': 'swiper-slide' }, props.children);
  }

  return { __esModule: true, Swiper: SwiperStub, SwiperSlide: SwiperSlideStub };
});

describe('CardSwiper swiper configuration', () => {
  it('passes a clickable pagination object to the swiper', () => {
    render(React.createElement(CardSwiper, { cardList: smallCardList }));

    const swiper: HTMLElement = screen.getByTestId('swiper');
    // Kills ObjectLiteral `pagination={{}}` (the `clickable` key must exist) and
    // BooleanLiteral `clickable: false` (the value must be true).
    expect(swiper).toHaveAttribute('data-pagination-has-clickable-key', 'true');
    expect(swiper).toHaveAttribute('data-pagination-clickable', 'true');
  });

  it('registers exactly the pagination module with the swiper', () => {
    render(React.createElement(CardSwiper, { cardList: smallCardList }));

    // Kills ArrayDeclaration `modules={[]}`: the modules array must hold one item.
    expect(screen.getByTestId('swiper')).toHaveAttribute('data-modules-count', '1');
  });
});

describe('CardSwiper mobile grid branch selection', () => {
  // Render a bare MUI Grid with each style object to learn the deterministic
  // emotion class each `sx` resolves to, then assert CardSwiper picks the right
  // one per first-card type. Pinning the exact class (not merely "they differ")
  // kills the `=== 'smallCard'` -> `!==` flip, the literal-true / literal-false
  // ConditionalExpression collapses, and the `'smallCard'` -> `''` string flip.
  function emotionClassFor(sx: SxProps<Theme>): string {
    const { container, unmount } = render(React.createElement(Grid, { sx }));
    // The bare Grid has no semantic role; its single child div carries the
    // emotion class, reachable only by structural access on the render root.
    // eslint-disable-next-line testing-library/no-node-access
    const gridEl: Element | null = container.firstElementChild;
    unmount();
    return gridEl?.getAttribute('class') ?? '';
  }

  it('selects the small mobile grid when the first card is small', () => {
    const expected: string = emotionClassFor(gridStyles.gridSmallMobile);

    render(React.createElement(CardSwiper, { cardList: smallCardList }));

    expect(getSwiperWrapper()).toHaveAttribute('class', expected);
  });

  it('selects the large mobile grid when the first card is large', () => {
    const expected: string = emotionClassFor(gridStyles.gridLargeMobile);

    render(React.createElement(CardSwiper, { cardList: largeCardList }));

    expect(getSwiperWrapper()).toHaveAttribute('class', expected);
  });
});

describe('CardSwiper tooltip mutation detection', () => {
  function makePlainDiv(): HTMLDivElement {
    return document.createElement('div');
  }

  it('ignores a childList mutation whose only added node is not a tooltip', () => {
    const { getCallback, restore } = captureObserverCallback();

    render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const wrapper: HTMLElement = getSwiperWrapper();
    const callback: ObserverCallback | undefined = getCallback();

    // No tooltip lives in the DOM and the added node is a plain div, so the real
    // `isToolTip` (Element && matches) is false and the handler writes nothing.
    // Kills `isToolTip` -> `return true`, the `&&` -> `||` flip (a plain Element
    // satisfies `||` but not `&&`), and the line-24 `|| -> true` collapse, each of
    // which would force a sync that writes pointer-events: auto.
    callback?.([makeRecord('childList', [makePlainDiv()])], {} as MutationObserver);

    expect(wrapper.getAttribute('style') ?? '').not.toContain('pointer-events');

    restore();
  });

  it('detects a tooltip among added nodes mixed with non-tooltip nodes', () => {
    const { getCallback, restore } = captureObserverCallback();

    render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const wrapper: HTMLElement = getSwiperWrapper();
    const callback: ObserverCallback | undefined = getCallback();

    // A tooltip is live in the DOM; addedNodes mixes a tooltip with a plain div.
    // `some` is true but `every` is false, killing the line-24 `some` -> `every`
    // mutation: only `some` triggers the sync that disables pointer events.
    document.body.appendChild(makeTooltipNode());
    callback?.(
      [makeRecord('childList', [makeTooltipNode(), makePlainDiv()])],
      {} as MutationObserver
    );

    expect(wrapper).toHaveStyle({ pointerEvents: 'none' });

    restore();
  });

  it('detects a tooltip among removed nodes mixed with non-tooltip nodes', () => {
    const { getCallback, restore } = captureObserverCallback();

    render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const wrapper: HTMLElement = getSwiperWrapper();
    const callback: ObserverCallback | undefined = getCallback();

    // Same shape but for removedNodes, killing the line-25 `some` -> `every`.
    document.body.appendChild(makeTooltipNode());
    callback?.(
      [makeRecord('childList', [], [makeTooltipNode(), makePlainDiv()])],
      {} as MutationObserver
    );

    expect(wrapper).toHaveStyle({ pointerEvents: 'none' });

    restore();
  });

  it('syncs when only one of several mutations touches a tooltip', () => {
    const { getCallback, restore } = captureObserverCallback();

    render(React.createElement(CardSwiper, { cardList: smallCardList }));
    const wrapper: HTMLElement = getSwiperWrapper();
    const callback: ObserverCallback | undefined = getCallback();

    // Two records: one tooltip-touching childList, one that touches no tooltip.
    // `mutationsList.some` is true while `every` is false, killing the line-42
    // `some` -> `every` mutation.
    document.body.appendChild(makeTooltipNode());
    callback?.(
      [makeRecord('childList', [makeTooltipNode()]), makeRecord('childList', [makePlainDiv()])],
      {} as MutationObserver
    );

    expect(wrapper).toHaveStyle({ pointerEvents: 'none' });

    restore();
  });

  it('does not observe when no body element exists to watch', () => {
    const { getCallback, restore } = captureObserverCallback();
    const observeSpy: jest.SpyInstance = jest.spyOn(MutationObserver.prototype, 'observe');
    const querySpy: jest.SpyInstance = jest.spyOn(document, 'querySelector').mockReturnValue(null);

    // With `document.querySelector('body')` returning null, the real `if (target)`
    // guard skips observation. The `if (true)` mutant would call
    // `observer.observe(null, ...)`, so asserting observe was never called (and
    // that render does not throw) kills the ConditionalExpression mutant.
    render(React.createElement(CardSwiper, { cardList: smallCardList }));

    // A freshly constructed observer proves the shared registry really was
    // empty on entry, so the assertion below is about this render's init path
    // and not about an observer some earlier test left connected.
    expect(getCallback()).toBeDefined();
    expect(observeSpy).not.toHaveBeenCalled();

    querySpy.mockRestore();
    observeSpy.mockRestore();
    restore();
  });
});

describe('CardSwiper shared tooltip observer', () => {
  function renderTwoSwipers(): { first: RenderResult; second: RenderResult } {
    return {
      first: render(React.createElement(CardSwiper, { cardList: smallCardList })),
      second: render(React.createElement(CardSwiper, { cardList: largeCardList })),
    };
  }

  it('attaches exactly one body observer however many swipers are mounted', () => {
    const observeSpy: jest.SpyInstance = jest.spyOn(MutationObserver.prototype, 'observe');

    renderTwoSwipers();

    // The whole point of the registry: two mounted swipers, one document watch.
    expect(observeSpy).toHaveBeenCalledTimes(1);

    observeSpy.mockRestore();
  });

  it('syncs every mounted swiper from that single observer', () => {
    const { getCallback, restore } = captureObserverCallback();

    renderTwoSwipers();
    const wrappers: HTMLElement[] = screen.getAllByTestId('swiper').map(toWrapper);
    addTooltipNode();

    getCallback()?.([makeRecord('childList', [makeTooltipNode()])], {} as MutationObserver);

    expect(wrappers).toHaveLength(2);
    wrappers.forEach(wrapper => expect(wrapper).toHaveStyle({ pointerEvents: 'none' }));

    restore();
  });

  it('keeps observing until the last swiper unmounts', () => {
    const disconnectSpy: jest.SpyInstance = jest.spyOn(MutationObserver.prototype, 'disconnect');

    const { first, second } = renderTwoSwipers();
    first.unmount();

    // Kills the `subscribers.size === 0` -> `true` collapse: tearing the
    // observer down here would leave the still-mounted swiper unsynced.
    expect(disconnectSpy).not.toHaveBeenCalled();

    second.unmount();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);

    disconnectSpy.mockRestore();
  });

  it('starts a fresh observation for a swiper mounted after the registry emptied', () => {
    const observeSpy: jest.SpyInstance = jest.spyOn(MutationObserver.prototype, 'observe');

    render(React.createElement(CardSwiper, { cardList: smallCardList })).unmount();
    render(React.createElement(CardSwiper, { cardList: smallCardList }));

    // Kills the `bodyObserver ?? observeBody()` -> left-hand-only mutant: the
    // disconnected observer must not be reused for the second mount.
    expect(observeSpy).toHaveBeenCalledTimes(2);

    observeSpy.mockRestore();
  });
});

describe('useTooltipPointerEventsSync subscriber contract', () => {
  it('skips an element-less subscriber without starving the live ones', () => {
    const { getCallback, restore } = captureObserverCallback();
    const detachedRef: React.RefObject<HTMLDivElement | null> = { current: null };

    renderHook(() => useTooltipPointerEventsSync(detachedRef));
    render(React.createElement(CardSwiper, { cardList: smallCardList }));
    addTooltipNode();

    // Exercises the `if (!swiper) return` guard in the sync: a registered
    // subscriber can be element-less between React detaching the ref and the
    // effect cleanup running. That must skip only that subscriber — the guard
    // returns from one sync call, it does not abort the fan-out.
    expect(() =>
      getCallback()?.([makeRecord('childList', [makeTooltipNode()])], {} as MutationObserver)
    ).not.toThrow();
    expect(getSwiperWrapper()).toHaveStyle({ pointerEvents: 'none' });

    restore();
  });
});

describe('CardSwiper loop configuration', () => {
  const warn = mockConsoleWarn();

  // Two cards with distinct ids so the multi-item case has real wrap-around and
  // no duplicate React keys. smallCardList/largeCardList are single-item.
  const multiCardList: UiCardItemData[] = [smallCard, { ...smallCard, id: 'second-card-id' }];

  it('disables loop for an empty list', () => {
    render(React.createElement(CardSwiper, { cardList: [] }));

    // Kills the `> 1` -> `>= 1` boundary mutant (0 >= 1 is false, so this alone
    // does not; the single-item case below does) and the `-> true` collapse.
    expect(screen.getByTestId('swiper')).toHaveAttribute('data-loop', 'false');
  });

  it('disables loop for a single-item list', () => {
    render(React.createElement(CardSwiper, { cardList: smallCardList }));

    // Kills `> 1` -> `>= 1` (1 >= 1 would be true) and the literal-`true` collapse.
    expect(screen.getByTestId('swiper')).toHaveAttribute('data-loop', 'false');
  });

  it('enables loop when there is more than one card', () => {
    render(React.createElement(CardSwiper, { cardList: multiCardList }));

    // Kills `> 1` -> `< 1` and the literal-`false` collapse.
    expect(screen.getByTestId('swiper')).toHaveAttribute('data-loop', 'true');
  });

  it('emits no Swiper loop warning for a single-item list', () => {
    // With loop disabled, real Swiper would not log its loop warning. The stub
    // cannot emit it, so the `data-loop='false'` assertions above are the real
    // guarantee; this guards against the component itself warning about loop.
    render(React.createElement(CardSwiper, { cardList: smallCardList }));

    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('loop'));
  });
});
