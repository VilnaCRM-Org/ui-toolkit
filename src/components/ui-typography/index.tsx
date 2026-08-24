import { Typography } from '@mui/material';
import React from 'react';

import ScopedThemeProvider from '../theme-scope';

import theme from './theme';
import type { UiTypographyProps } from './types';

// Re-exported through this public entry so sibling components can hoist a single
// typography scope over a subtree that renders several UiTypography instances,
// instead of each one mounting its own provider (components-public-api rule).
export { default as typographyTheme } from './theme';

function UiTypography({
  sx,
  children,
  component,
  variant,
  id,
  role,
  htmlFor,
  ...rest
}: UiTypographyProps): React.ReactElement {
  const componentProp: { component: React.ElementType } = { component: component || 'p' };
  const htmlForProp: { htmlFor?: string } = component === 'label' && htmlFor ? { htmlFor } : {};
  return (
    <ScopedThemeProvider theme={theme}>
      <Typography
        sx={sx}
        {...componentProp}
        variant={variant}
        id={id}
        role={role}
        {...htmlForProp}
        {...rest}
      >
        {children}
      </Typography>
    </ScopedThemeProvider>
  );
}

export default UiTypography;
