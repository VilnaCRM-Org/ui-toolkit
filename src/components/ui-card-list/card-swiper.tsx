import { Grid, SxProps, Theme } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import styles from './styles';
import type { UiCardListProps } from './types';
import UiCardItem from './ui-card-item';

import 'swiper/css';
import 'swiper/css/pagination';

const TOOLTIP_SELECTOR: string = '[role="tooltip"].base-Popper-root';

type SwiperRef = React.RefObject<HTMLDivElement | null>;

// One document-level observer for the whole page, shared by every mounted
// swiper. Per-instance observers meant K swipers each woke up on EVERY
// body-level childList mutation — portals, modals, toasts included — to run the
// same document query K times. The registry keeps that down to one observer and
// one wake-up, fanned out to the subscribers that actually need syncing.
const subscribers: Set<SwiperRef> = new Set();
let bodyObserver: MutationObserver | null = null;

function isToolTip(node: Node): boolean {
  return node instanceof Element && node.matches(TOOLTIP_SELECTOR);
}

function mutationTouchesToolTip(mutation: MutationRecord): boolean {
  if (mutation.type !== 'childList') {
    return false;
  }
  return (
    Array.from(mutation.addedNodes).some(isToolTip) ||
    Array.from(mutation.removedNodes).some(isToolTip)
  );
}

// Recompute from the live DOM rather than toggling per add/remove, so overlapping
// tooltip mutations can't leave pointer-events in the wrong state. The tooltip
// portals to <body> (outside the swiper subtree), so detection is necessarily a
// document-level query rather than scoped to this instance.
function syncPointerEvents(swiper: HTMLElement | null): void {
  if (!swiper) {
    return;
  }
  const hasToolTip: boolean = document.querySelector(TOOLTIP_SELECTOR) !== null;
  swiper.style.setProperty('pointer-events', hasToolTip ? 'none' : 'auto');
}

function handleMutations(mutationsList: MutationRecord[]): void {
  if (mutationsList.some(mutationTouchesToolTip)) {
    subscribers.forEach(swiperRef => syncPointerEvents(swiperRef.current));
  }
}

function observeBody(): MutationObserver {
  const target: HTMLElement | null = document.querySelector('body');
  const observer: MutationObserver = new MutationObserver(handleMutations);

  if (target) {
    observer.observe(target, { childList: true });
  }

  return observer;
}

// Refcounted: the first swiper on the page starts the observation, the last one
// to leave stops it, and everything in between reuses the same observer.
function subscribe(swiperRef: SwiperRef): () => void {
  const observer: MutationObserver = bodyObserver ?? observeBody();
  bodyObserver = observer;
  subscribers.add(swiperRef);

  return (): void => {
    subscribers.delete(swiperRef);
    if (subscribers.size === 0) {
      observer.disconnect();
      bodyObserver = null;
    }
  };
}

/**
 * Subscribes a swiper wrapper to the shared tooltip watch for as long as it is
 * mounted. Exported so the registry contract — including a subscriber whose
 * element is not (or no longer) attached — can be exercised on its own.
 */
export function useTooltipPointerEventsSync(swiperRef: SwiperRef): void {
  // swiperRef is a stable useRef object, so this subscribes once on mount —
  // equivalent to []. Keep it here to satisfy exhaustive-deps without a disable.
  useEffect(() => subscribe(swiperRef), [swiperRef]);
}

function CardSwiper({ cardList, headingComponent }: UiCardListProps): React.ReactElement {
  const swiperRef: SwiperRef = useRef<HTMLDivElement>(null);

  useTooltipPointerEventsSync(swiperRef);

  // Layout is chosen once from the first item: the card list is expected to be
  // homogeneous (all small or all large cards). Both arms are module-scope
  // objects, so the selection is already referentially stable across renders.
  const gridMobile: SxProps<Theme> =
    cardList[0]?.type === 'smallCard' ? styles.gridSmallMobile : styles.gridLargeMobile;

  return (
    <Grid sx={gridMobile} ref={swiperRef as React.RefObject<HTMLDivElement>}>
      <Swiper
        pagination={{ clickable: true }}
        modules={[Pagination]}
        spaceBetween={12}
        slidesPerView={1.04}
        // Looping is meaningless with 0-1 slides and makes Swiper log a warning
        // on every mount; only enable it once there is more than one card to wrap.
        loop={cardList.length > 1}
      >
        {cardList.map(item => (
          <SwiperSlide key={item.id}>
            <UiCardItem item={item} headingComponent={headingComponent} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Grid>
  );
}

// See CardGrid: the swiper variant carries the same referentially-stable props,
// so an unrelated parent re-render must not walk the slides again.
export default React.memo(CardSwiper);
