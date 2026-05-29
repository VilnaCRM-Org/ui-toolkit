import { Box, useMediaQuery } from '@mui/material';
import React from 'react';

import breakpointsTheme from '../UiBreakpoints';

import CardGrid from './CardGrid';
import CardSwiper from './CardSwiper';
import styles from './styles';
import { CardList } from './types';

function UiCardList({ cardList }: CardList): React.ReactElement {
  const isSmallScreen: boolean = useMediaQuery(
    `(max-width: ${breakpointsTheme.breakpoints.values.sm - 0.02}px)`
  );

  return (
    <>
      <Box sx={styles.gridContainerLargeScreen}>
        <CardGrid cardList={cardList} />
      </Box>
      <Box sx={styles.swiperContainerSmallScreen}>
        {isSmallScreen ? <CardSwiper cardList={cardList} /> : null}
      </Box>
    </>
  );
}

export default UiCardList;
