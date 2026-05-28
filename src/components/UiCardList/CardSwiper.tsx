import { Grid } from '@mui/material';
import React, { CSSProperties, useEffect, useRef } from 'react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import UiCardItem from '../UiCardItem';

import styles from './styles';
import 'swiper/css';
import 'swiper/css/pagination';
import { CardList } from './types';

function isToolTip(node: Element): boolean {
  return node.role === 'tooltip' && node.classList.contains('base-Popper-root');
}

function applyPointerEvents(
  nodes: NodeList,
  swiper: HTMLElement | null,
  value: 'none' | 'auto'
): void {
  if (!swiper) {
    return;
  }
  nodes.forEach((node: Node): void => {
    if (node instanceof Element && isToolTip(node)) {
      swiper.style.setProperty('pointer-events', value);
    }
  });
}

function handleMutations(
  mutationsList: MutationRecord[],
  swiper: HTMLElement | null
): void {
  mutationsList.forEach((mutation: MutationRecord): void => {
    if (mutation.type !== 'childList') {
      return;
    }
    applyPointerEvents(mutation.addedNodes, swiper, 'none');
    applyPointerEvents(mutation.removedNodes, swiper, 'auto');
  });
}

function CardSwiper({ cardList }: CardList): React.ReactElement {
  const swiperRef: React.RefObject<HTMLElement> = useRef(null);

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

  const gridMobile: CSSProperties =
    cardList[0].type === 'smallCard' ? styles.gridSmallMobile : styles.gridLargeMobile;

  return (
    <Grid sx={gridMobile} ref={swiperRef as React.RefObject<HTMLDivElement>}>
      <Swiper
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        spaceBetween={12}
        slidesPerView={1.04}
        loop
        className="swiper-wrapper"
      >
        {cardList.map(item => (
          <SwiperSlide key={item.id}>
            <UiCardItem item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Grid>
  );
}

export default CardSwiper;
