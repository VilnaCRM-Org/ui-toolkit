import { SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';

import styles from './styles';
import { UiSkeletonButtonProps } from './types';

export default function UiSkeletonButton({
  id,
  sx = [],
}: UiSkeletonButtonProps): React.ReactElement {
  const additionalSx: Extract<SxProps<Theme>, readonly unknown[]>[number][] = Array.isArray(sx)
    ? sx
    : [sx];

  return (
    <Box data-testid="ui-skeleton-button" id={id} sx={[styles.buttonSkeleton, ...additionalSx]} />
  );
}
