import { ThemeProvider, Typography } from '@mui/material';
import React from 'react';

import theme from './theme';
import { UiTypographyProps } from './types';

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
  const htmlForProp = component === 'label' && htmlFor ? { htmlFor } : {};
  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
}

export default UiTypography;
