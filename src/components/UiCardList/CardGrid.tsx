import { Grid, SxProps, Theme } from '@mui/material';
import React from 'react';

import UiCardItem from '../UiCardItem';

import styles from './styles';
import { CardList } from './types';

function CardGrid({ cardList }: Readonly<CardList>): React.ReactElement {
  const grid: SxProps<Theme> =
    cardList[0].type === 'smallCard' ? styles.smallGrid : styles.largeGrid;

  return (
    <Grid sx={grid}>
      {cardList.map(item => (
        <UiCardItem key={item.id} item={item} />
      ))}
    </Grid>
  );
}
export default CardGrid;
