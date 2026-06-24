import { Box, SxProps, Theme } from '@mui/material';
import React from 'react';

import styles from './styles';
import type { UiImageProps } from './types';

function UiImage({ sx, alt, src }: UiImageProps): React.ReactElement {
  const imageUrl: string = typeof src === 'string' ? src : src.src;
  const mergedSx: SxProps<Theme> = Array.isArray(sx)
    ? [styles.wrapper, ...sx]
    : sx
      ? [styles.wrapper, sx]
      : [styles.wrapper];

  return (
    <Box sx={mergedSx}>
      <img alt={alt} src={imageUrl} loading="lazy" />
    </Box>
  );
}

export default UiImage;
