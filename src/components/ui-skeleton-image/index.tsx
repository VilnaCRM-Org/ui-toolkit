import Box from '@mui/material/Box';
import React from 'react';

import getImageSkeletonStyles from './styles';
import type { UiSkeletonImageProps } from './types';

export default function UiSkeletonImage({
  id,
  variant = 'round',
  width,
  height,
  sx = [],
}: UiSkeletonImageProps): React.ReactElement {
  return (
    <Box
      id={id}
      sx={[getImageSkeletonStyles(variant, width, height), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
