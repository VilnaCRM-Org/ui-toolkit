import { Toolbar } from '@mui/material';
import React from 'react';

import ScopedThemeProvider from '../theme-scope';

import theme from './theme';

function UiToolbar({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <ScopedThemeProvider theme={theme}>
      <Toolbar>{children}</Toolbar>
    </ScopedThemeProvider>
  );
}

export default UiToolbar;
