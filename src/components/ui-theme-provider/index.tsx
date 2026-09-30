import { ThemeProvider } from '@mui/material';
import type { Theme } from '@mui/material';
import React from 'react';

import { createUiTheme, defaultUiTheme, withUiFallback } from '@/utils/ui-theme';

import type { UiThemeProviderProps } from './types';

export { createUiTheme } from '@/utils/ui-theme';
export type { UiThemeOptions, UiThemeVariant } from '@/utils/ui-theme';

export const uiTheme: Theme = /* @__PURE__ */ defaultUiTheme();

function UiThemeProvider({
  variant,
  theme,
  scope = 'theme',
  children,
}: Readonly<UiThemeProviderProps>): React.ReactElement {
  const resolved: Theme = React.useMemo(
    () => createUiTheme({ ...theme, variant: variant ?? theme?.variant }),
    [theme, variant]
  );
  const provided: Theme | ((outer: Theme) => Theme) = React.useMemo(
    () => (scope === 'tokens' ? withUiFallback(resolved) : resolved),
    [scope, resolved]
  );
  return <ThemeProvider theme={provided}>{children}</ThemeProvider>;
}

export default UiThemeProvider;
