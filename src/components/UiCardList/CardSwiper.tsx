import { Grid, SxProps, Theme } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import styles from './styles';
import { UiCardListProps } from './types';
import UiCardItem from './UiCardItem';

import 'swiper/css';
import 'swiper/css/pagination';

const TOOLTIP_SELECTOR: string = '[role="tooltip"].base-Popper-root';

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

function handleMutations(mutationsList: MutationRecord[], swiper: HTMLElement | null): void {
  if (mutationsList.some(mutationTouchesToolTip)) {
    syncPointerEvents(swiper);
  }
}

export default function CardSwiper({
  cardList,
  headingComponent,
}: UiCardListProps): React.ReactElement {
  const swiperRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target: HTMLElement | null = document.querySelector('body');

    const observer: MutationObserver = new MutationObserver((mutationsList: MutationRecord[]) =>
      handleMutations(mutationsList, swiperRef.current)
    );

    if (target) {
      observer.observe(target, { childList: true });
    }

    return (): void => observer.disconnect();
  }, []);

  // Layout is chosen once from the first item: the card list is expected to be
  // homogeneous (all small or all large cards).
  const gridMobile: SxProps<Theme> =
    cardList[0]?.type === 'smallCard' ? styles.gridSmallMobile : styles.gridLargeMobile;

  return (
    <Grid sx={gridMobile} ref={swiperRef as React.RefObject<HTMLDivElement>}>
      <Swiper
        pagination={{ clickable: true }}
        modules={[Pagination]}
        spaceBetween={12}
        slidesPerView={1.04}
        loop
        className="swiper-wrapper"
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
