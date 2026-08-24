import { Box, useMediaQuery } from '@mui/material';
import React from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import breakpointsTheme from '../ui-breakpoints';

import CardGrid from './card-grid';
import CardSwiper from './card-swiper';
import styles from './styles';
import type { UiCardItemData, UiCardListProps } from './types';

// Shared card styling owned by the card-list module; UiCardItem consumes it
// through this public entry rather than reaching into ./shared-card-styles
// (components-public-api boundary rule).
export * from './shared-card-styles';

const MISSING_CARD_LIST_WARNING: string =
  'UiCardList received a nullish `cardList`; rendering an empty list. Pass an array of card items.';

// Module scope, not a fresh `[]` per render: the fallback is handed to the
// memoized grid/swiper, and a new array each render would defeat their shallow
// prop comparison on every parent re-render. Frozen because a single instance is
// now shared by every mount that degrades.
const EMPTY_CARD_LIST: UiCardItemData[] = Object.freeze<UiCardItemData[]>([]) as UiCardItemData[];

export default function UiCardList({
  cardList,
  headingComponent,
}: UiCardListProps): React.ReactElement {
  useDevWarning(cardList ? null : MISSING_CARD_LIST_WARNING);
  // Normalize once at the public entry so both children keep their simple
  // `UiCardItemData[]` contract; a nullish runtime value degrades to an empty
  // grid/swiper instead of crashing the whole subtree on `.map`.
  const safeCardList: UiCardItemData[] = cardList ?? EMPTY_CARD_LIST;

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
          <CardGrid cardList={safeCardList} headingComponent={headingComponent} />
        )}
      </Box>
      <Box sx={styles.swiperContainerSmallScreen}>
        {isSmallScreen ? (
          <CardSwiper cardList={safeCardList} headingComponent={headingComponent} />
        ) : null}
      </Box>
    </>
  );
}
