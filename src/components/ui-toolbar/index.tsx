import { Toolbar, ThemeProvider } from '@mui/material';
import React from 'react';

import theme from './theme';

export interface UiToolbarProps {
  children: React.ReactNode;
}

function UiToolbar({ children }: UiToolbarProps): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <Toolbar>{children}</Toolbar>
    </ThemeProvider>
  );
}

export default UiToolbar;
