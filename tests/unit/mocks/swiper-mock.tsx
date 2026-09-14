import React from 'react';

// swiper ships ESM-only bundles that jest does not transform. These lightweight
// stand-ins let components that import swiper be exercised under jsdom while the
// real swiper is used by the storybook/webpack build.
export const Pagination: Record<string, never> = {};

// The stand-ins carry the APG carousel semantics (a named region holding
// named slide groups) so a test reaches them by role, the way it reaches every
// other composed child, instead of through a test id.
export function Swiper({ children }: Readonly<{ children?: React.ReactNode }>): React.ReactElement {
  return (
    <div role="region" aria-roledescription="carousel" aria-label="carousel">
      {children}
    </div>
  );
}

export function SwiperSlide({
  children,
}: Readonly<{ children?: React.ReactNode }>): React.ReactElement {
  return (
    <div role="group" aria-roledescription="slide" aria-label="slide">
      {children}
    </div>
  );
}
