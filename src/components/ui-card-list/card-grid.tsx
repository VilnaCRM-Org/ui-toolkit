import { Grid, SxProps, Theme } from '@mui/material';
import React from 'react';

import styles from './styles';
import type { UiCardListProps } from './types';
import UiCardItem from './ui-card-item';

export default function CardGrid({
  cardList,
  headingComponent,
}: UiCardListProps): React.ReactElement {
  // Layout is chosen once for the whole grid from the first item: a card list
  // is expected to be homogeneous (all small or all large cards).
  const grid: SxProps<Theme> =
    cardList[0]?.type === 'smallCard' ? styles.smallGrid : styles.largeGrid;

  return (
    <Grid sx={grid}>
      {cardList.map(item => (
        <UiCardItem key={item.id} item={item} headingComponent={headingComponent} />
      ))}
    </Grid>
  );
}
