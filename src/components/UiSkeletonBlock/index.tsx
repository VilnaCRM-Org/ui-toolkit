import { SxProps, Theme } from '@mui/material';
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
  const mergedSx: SxProps<Theme> = Array.isArray(sx)
    ? [getBlockSkeletonStyles(width, height, borderRadius), ...sx]
    : [getBlockSkeletonStyles(width, height, borderRadius), sx];

  return <Box id={id} sx={mergedSx} />;
}
