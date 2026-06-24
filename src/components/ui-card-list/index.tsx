import { Box, useMediaQuery } from '@mui/material';
import React from 'react';

import breakpointsTheme from '../ui-breakpoints';

import CardGrid from './card-grid';
import CardSwiper from './card-swiper';
import styles from './styles';
import type { UiCardListProps } from './types';

// Shared card styling owned by the card-list module; UiCardItem consumes it
// through this public entry rather than reaching into ./shared-card-styles
// (components-public-api boundary rule).
export * from './shared-card-styles';

export default function UiCardList({
  cardList,
  headingComponent,
}: UiCardListProps): React.ReactElement {
  // Render exactly one variant. Gating CardGrid on `!isSmallScreen` (rather than
  // mounting it always and hiding it with CSS) avoids rendering the whole card
  // tree twice on mobile, matching how CardSwiper is gated.
  const isSmallScreen: boolean = useMediaQuery(
    `(max-width: ${breakpointsTheme.breakpoints.values.sm - 0.02}px)`
  );

  return (
    <>
      <Box sx={styles.gridContainerLargeScreen}>
        {isSmallScreen ? null : (
          <CardGrid cardList={cardList} headingComponent={headingComponent} />
        )}
      </Box>
      <Box sx={styles.swiperContainerSmallScreen}>
        {isSmallScreen ? (
          <CardSwiper cardList={cardList} headingComponent={headingComponent} />
        ) : null}
      </Box>
    </>
  );
}
