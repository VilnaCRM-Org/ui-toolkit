import { Typography } from '@mui/material';
import type { Theme } from '@mui/material';
import React from 'react';

import { useUiTheme } from '@/utils/ui-theme';

import typographySx from './styles';
import type { UiTypographyProps } from './types';

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
  const theme: Theme = useUiTheme();
  return (
    <Typography
      sx={typographySx(theme, variant, sx)}
      {...componentProp}
      variant={variant}
      id={id}
      role={role}
      {...htmlForProp}
      {...rest}
    >
      {children}
    </Typography>
  );
}

export default UiTypography;
