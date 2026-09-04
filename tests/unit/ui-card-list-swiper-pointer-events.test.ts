import { renderHook, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { useTooltipPointerEventsSync } from '../../src/components/ui-card-list/card-swiper';

// Everything the tooltip sync does is an inline style write on whatever element
// the ref holds, so these cases drive the exported hook with a bare div instead
// of a rendered CardSwiper. That keeps them independent of the Grid/Swiper tree
// (covered in ui-card-swiper.test.tsx) and lets the ref itself be the variable.

type SwiperRefProps = Readonly<{ swiperRef: React.RefObject<HTMLDivElement | null> }>;

// The exact node the source watches for: MUI's popper root carrying
// role="tooltip". Written out rather than imported from the component so a
// change to its selector fails here instead of moving the fixture along with it.
function makeTooltip(): HTMLDivElement {
  const tooltip: HTMLDivElement = document.createElement('div');
  tooltip.setAttribute('role', 'tooltip');
  tooltip.className = 'base-Popper-root';
  return tooltip;
}

function makeSwiperRef(element: HTMLDivElement): React.RefObject<HTMLDivElement | null> {
  return { current: element };
}

// RTL's cleanup unmounts the hook — which deregisters it from the module-level
// subscriber registry — but knows nothing about the tooltips these tests push
// into <body>, and a leaked one would leave the next test starting "open".
afterEach(() => {
  screen
    .queryAllByRole('tooltip')
    .filter(node => node.classList.contains('base-Popper-root'))
    .forEach(node => node.remove());
});

describe('useTooltipPointerEventsSync inline style writes', () => {
  it('restores pointer events by writing auto, not by clearing the property', async () => {
    const swiper: HTMLDivElement = document.createElement('div');
    const swiperRef: React.RefObject<HTMLDivElement | null> = makeSwiperRef(swiper);

    renderHook(() => useTooltipPointerEventsSync(swiperRef));

    const tooltip: HTMLDivElement = makeTooltip();
    document.body.appendChild(tooltip);
    await waitFor(() => expect(swiper.style.getPropertyValue('pointer-events')).toBe('none'));

    tooltip.remove();

    // Read the INLINE declaration, never the computed style: jsdom resolves an
    // unset `pointer-events` to `auto`, so `toHaveStyle({ pointerEvents: 'auto' })`
    // cannot tell "wrote auto" from "wrote nothing at all". A close that cleared
    // the property instead of restoring it would read as fixed while really
    // leaving the wrapper on whatever the cascade happens to supply.
    await waitFor(() => expect(swiper.style.getPropertyValue('pointer-events')).toBe('auto'));
    expect(swiper.getAttribute('style') ?? '').toContain('pointer-events: auto');
  });
});

describe('useTooltipPointerEventsSync ref re-subscription', () => {
  it('moves the subscription to the ref object it is re-rendered with', async () => {
    const first: HTMLDivElement = document.createElement('div');
    const second: HTMLDivElement = document.createElement('div');

    const { rerender } = renderHook(
      (props: SwiperRefProps): void => useTooltipPointerEventsSync(props.swiperRef),
      { initialProps: { swiperRef: makeSwiperRef(first) } }
    );

    rerender({ swiperRef: makeSwiperRef(second) });
    document.body.appendChild(makeTooltip());

    // The effect's dependency list is the whole mechanism. Drop `swiperRef` from
    // it and the effect never re-runs: the FIRST element stays subscribed and the
    // second is never registered, which inverts both assertions below. The hook
    // is exported precisely so a swapped ref can be exercised without a swiper.
    await waitFor(() => expect(second.style.getPropertyValue('pointer-events')).toBe('none'));
    expect(first.getAttribute('style') ?? '').not.toContain('pointer-events');
  });
});
