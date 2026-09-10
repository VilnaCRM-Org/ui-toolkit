import Box from '@mui/material/Box';
import React from 'react';

import UiSkeletonText from '../ui-skeleton-text';

import {
  HEADER_DOT_KEYS,
  TITLE_BAR_WIDTH,
  headerDotStyles,
  headerDotsStyles,
  headerStyles,
  titleBarStyles,
} from './styles';

/**
 * The 48px band every Board D widget card shares: a 147x18 title bar and the
 * `dots-horizontal` affordance. Purely decorative — the shell already hides
 * this subtree from assistive technology.
 */
export default function WidgetHeader(): React.ReactElement {
  return (
    <Box sx={headerStyles}>
      <UiSkeletonText size="l" width={TITLE_BAR_WIDTH} sx={titleBarStyles} />
      <Box sx={headerDotsStyles}>
        {HEADER_DOT_KEYS.map(key => (
          <Box key={key} sx={headerDotStyles} />
        ))}
      </Box>
    </Box>
  );
}
