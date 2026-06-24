import { Box } from '@mui/material';
import React from 'react';

import styles from './styles';

type UiContainerProps = {
  children: React.ReactNode;
};

export default function UiContainer({ children }: UiContainerProps): React.ReactElement {
  return (
    <Box sx={styles.container} aria-label="container">
      {children}
    </Box>
  );
}
