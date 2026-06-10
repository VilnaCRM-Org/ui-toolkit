import { Box, SxProps, Theme } from '@mui/material';
import React from 'react';

import UiCardItem from '../UiCardItem';

import styles from './styles';
import { CardList } from './types';

function CardGrid({ cardList, headingComponent }: Readonly<CardList>): React.ReactElement {
  // Layout is chosen once for the whole grid from the first item: a card list
  // is expected to be homogeneous (all small or all large cards).
  const grid: SxProps<Theme> =
    cardList[0].type === 'smallCard' ? styles.smallGrid : styles.largeGrid;

  return (
    <Box sx={grid}>
      {cardList.map(item => (
        <UiCardItem key={item.id} item={item} headingComponent={headingComponent} />
      ))}
    </Box>
  );
}
export default CardGrid;
