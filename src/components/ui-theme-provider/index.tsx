import { ThemeProvider } from '@mui/material';
import type { Theme } from '@mui/material';
import React from 'react';

import { createUiTheme } from '@/utils/ui-theme';

import type { UiThemeProviderProps } from './types';

export { createUiTheme, uiTheme } from '@/utils/ui-theme';
export type { UiThemeOptions, UiThemeVariant } from '@/utils/ui-theme';

function UiThemeProvider({
  variant,
  theme,
  children,
}: Readonly<UiThemeProviderProps>): React.ReactElement {
  const resolved: Theme = React.useMemo(
    () => createUiTheme({ ...theme, variant }),
    [theme, variant]
  );
  return <ThemeProvider theme={resolved}>{children}</ThemeProvider>;
}

export default UiThemeProvider;
