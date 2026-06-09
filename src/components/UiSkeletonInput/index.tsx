import Box from '@mui/material/Box';
import React from 'react';

import styles from './styles';
import { UiSkeletonInputProps } from './types';

export default function UiSkeletonInput({
  disableAnimation = false,
  id,
}: UiSkeletonInputProps): React.ReactElement {
  const staticSx = disableAnimation ? styles.staticSkeleton : undefined;

  return (
    <Box
      data-testid="ui-skeleton-input"
      id={id}
      sx={[styles.inputContainer, ...(staticSx ? [staticSx] : [])]}
    >
      <Box
        className="ui-skeleton-input__placeholder"
        sx={[styles.inputPlaceholder, ...(staticSx ? [staticSx] : [])]}
      />
    </Box>
  );
}
