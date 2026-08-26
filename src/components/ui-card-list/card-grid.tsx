import { Grid, SxProps, Theme } from '@mui/material';
import React from 'react';

import styles from './styles';
import type { UiCardListProps } from './types';
import UiCardItem from './ui-card-item';

function CardGrid({ cardList, headingComponent }: UiCardListProps): React.ReactElement {
  // Layout is chosen once for the whole grid from the first item: a card list
  // is expected to be homogeneous (all small or all large cards). Both arms are
  // module-scope objects, so the selection is already referentially stable
  // across renders — wrapping it in `useMemo` would add a hook without removing
  // any work. The re-render itself is what memoizing this component avoids.
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

// `cardList` is handed down unchanged by UiCardList, so a parent re-render that
// leaves the data alone stops here instead of walking every card.
export default React.memo(CardGrid);
