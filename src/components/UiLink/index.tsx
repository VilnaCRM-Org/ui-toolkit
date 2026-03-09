import { Link, ThemeProvider } from '@mui/material';
import React from 'react';

import { theme } from './theme';
import { UiLinkProps } from './types';

function UiLink({ children, href, target, sx }: UiLinkProps): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <Link href={href} target={target} sx={sx}>
        {children}
      </Link>
    </ThemeProvider>
  );
}

export default UiLink;
