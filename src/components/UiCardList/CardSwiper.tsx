import { Grid } from '@mui/material';
import React, { CSSProperties, useEffect, useRef } from 'react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import styles from './styles';
import { UiCardListProps } from './types';
import UiCardItem from './UiCardItem';

import 'swiper/css';
import 'swiper/css/pagination';

export default function CardSwiper({ cardList }: UiCardListProps): JSX.Element {
  const swiperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.querySelector('body');

    function isToolTip(node: Element): boolean {
      return node.role === 'tooltip' && node.classList.contains('base-Popper-root');
    }

    const observer = new MutationObserver(mutationsList => {
      mutationsList.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node instanceof Element && isToolTip(node) && swiperRef.current) {
              swiperRef.current.style.pointerEvents = 'none';
            }
          });
          mutation.removedNodes.forEach(node => {
            if (node instanceof Element && isToolTip(node) && swiperRef.current) {
              swiperRef.current.style.pointerEvents = 'auto';
            }
          });
        }
      });
    });

    if (target) {
      observer.observe(target, { childList: true });
    }

    return () => observer.disconnect();
  }, []);

  const gridMobile: CSSProperties =
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
            <UiCardItem item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Grid>
  );
}
