import { Box, useMediaQuery } from '@mui/material';
import React from 'react';

import breakpointsTheme from '../UiBreakpoints';

import CardGrid from './CardGrid';
import CardSwiper from './CardSwiper';
import styles from './styles';
import { CardList } from './types';

function UiCardList({ cardList, headingComponent }: Readonly<CardList>): React.ReactElement {
  const isSmallScreen: boolean = useMediaQuery(
    `(max-width: ${breakpointsTheme.breakpoints.values.sm - 0.02}px)`
  );

  // Render exactly one variant. Gating CardGrid on `!isSmallScreen` (rather than
  // mounting it always and hiding it with CSS) avoids rendering the whole card
  // tree twice on mobile, matching how CardSwiper is gated.
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

export default UiCardList;
