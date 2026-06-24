import type { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import React from 'react';

import styles from './styles';
import type { UiSkeletonInputProps } from './types';

export default function UiSkeletonInput({
  disableAnimation = false,
  id,
}: UiSkeletonInputProps): React.ReactElement {
  const staticSx: SxProps<Theme> | undefined = disableAnimation ? styles.staticSkeleton : undefined;

  return (
    <Box id={id} sx={[styles.inputContainer, ...(staticSx ? [staticSx] : [])]}>
      <Box
        className="ui-skeleton-input__placeholder"
        sx={[styles.inputPlaceholder, ...(staticSx ? [staticSx] : [])]}
      />
    </Box>
  );
}
