import React from 'react';

// swiper ships ESM-only bundles that jest does not transform. These lightweight
// stand-ins let components that import swiper be exercised under jsdom while the
// real swiper is used by the storybook/webpack build.
export const Pagination: Record<string, never> = {};

export function Swiper({ children }: { children?: React.ReactNode }): React.ReactElement {
  return <div data-testid="swiper">{children}</div>;
}

export function SwiperSlide({ children }: { children?: React.ReactNode }): React.ReactElement {
  return <div data-testid="swiper-slide">{children}</div>;
}
