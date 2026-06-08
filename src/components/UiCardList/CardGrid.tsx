import { Grid } from '@mui/material';
import { CSSProperties } from 'react';

import styles from './styles';
import { UiCardListProps } from './types';
import UiCardItem from './UiCardItem';

export default function CardGrid({ cardList }: UiCardListProps): JSX.Element {
  const grid: CSSProperties =
    cardList[0]?.type === 'smallCard' ? styles.smallGrid : styles.largeGrid;

  return (
    <Grid sx={grid}>
      {cardList.map((item) => (
        <UiCardItem key={item.id} item={item} />
      ))}
    </Grid>
  );
}
