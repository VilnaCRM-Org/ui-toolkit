import { Box } from '@mui/material';
import React from 'react';

import CardGrid from './CardGrid';
import CardSwiper from './CardSwiper';
import styles from './styles';
import { UiCardListProps } from './types';

export default function UiCardList({ cardList }: UiCardListProps): JSX.Element {
  return (
    <>
      <Box sx={styles.gridContainerLargeScreen}>
        <CardGrid cardList={cardList} />
      </Box>
      <Box sx={styles.swiperContainerSmallScreen}>
        <CardSwiper cardList={cardList} />
      </Box>
    </>
  );
}
