import Box from '@mui/material/Box';
import React from 'react';

import getTextSkeletonStyles from './styles';
import type { UiSkeletonTextProps } from './types';

export default function UiSkeletonText({
  id,
  size = 'm',
  width = '100%',
  sx = [],
}: UiSkeletonTextProps): React.ReactElement {
  return (
    <Box id={id} sx={[getTextSkeletonStyles(size, width), ...(Array.isArray(sx) ? sx : [sx])]} />
  );
}
