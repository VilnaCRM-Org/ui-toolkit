import Box from '@mui/material/Box';
import React from 'react';

import getBlockSkeletonStyles from './styles';
import { UiSkeletonBlockProps } from './types';

export default function UiSkeletonBlock({
  id,
  width = '100%',
  height = '3rem',
  borderRadius = '8px',
  sx = [],
}: UiSkeletonBlockProps): React.ReactElement {
  const additionalSx = Array.isArray(sx) ? sx : [sx];

  return (
    <Box
      data-testid="ui-skeleton-block"
      id={id}
      sx={[getBlockSkeletonStyles(width, height, borderRadius), ...additionalSx]}
    />
  );
}
