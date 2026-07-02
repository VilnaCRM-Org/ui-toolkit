import { Box, SxProps, Theme } from '@mui/material';
import React from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import styles from './styles';
import type { UiImageProps } from './types';

const MISSING_SRC_WARNING: string =
  'UiImage received a nullish `src`; rendering an empty wrapper. Pass a valid URL or import.';

function UiImage({ sx, alt, src }: UiImageProps): React.ReactElement {
  // `src?.src` also absorbs a `null` object (typeof null === 'object', so the
  // else-branch would otherwise read `.src` off null and throw) — the guard is
  // for runtime data the strict prop type forbids, not the happy path.
  const imageUrl: string | undefined = typeof src === 'string' ? src : src?.src;
  useDevWarning(imageUrl ? null : MISSING_SRC_WARNING);

  const mergedSx: SxProps<Theme> = Array.isArray(sx)
    ? [styles.wrapper, ...sx]
    : sx
      ? [styles.wrapper, sx]
      : [styles.wrapper];

  return (
    <Box sx={mergedSx}>{imageUrl ? <img alt={alt} src={imageUrl} loading="lazy" /> : null}</Box>
  );
}

export default UiImage;
