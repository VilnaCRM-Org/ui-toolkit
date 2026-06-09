import Box from '@mui/material/Box';
import React from 'react';

import getTextSkeletonStyles from './styles';
import { UiSkeletonTextProps } from './types';

export default function UiSkeletonText({
  id,
  size = 'm',
  width = '100%',
  sx = [],
}: UiSkeletonTextProps): React.ReactElement {
  return (
    <Box
      data-testid="ui-skeleton-text"
      id={id}
      sx={[getTextSkeletonStyles(size, width), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
