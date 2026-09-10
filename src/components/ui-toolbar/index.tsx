import { Toolbar } from '@mui/material';
import React from 'react';

import ScopedThemeProvider from '../theme-scope';

import theme from './theme';

export interface UiToolbarProps {
  children: React.ReactNode;
}

function UiToolbar({ children }: UiToolbarProps): React.ReactElement {
  return (
    <ScopedThemeProvider theme={theme}>
      <Toolbar>{children}</Toolbar>
    </ScopedThemeProvider>
  );
}

export default UiToolbar;
