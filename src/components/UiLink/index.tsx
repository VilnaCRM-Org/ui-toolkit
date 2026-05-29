import { Link, ThemeProvider } from '@mui/material';
import React from 'react';

import theme from './theme';
import { UiLinkProps } from './types';

function UiLink({ children, href, target, rel, sx }: UiLinkProps): React.ReactElement {
  const computedRel: string | undefined =
    rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);
  return (
    <ThemeProvider theme={theme}>
      <Link href={href} target={target} rel={computedRel} sx={sx}>
        {children}
      </Link>
    </ThemeProvider>
  );
}

export default UiLink;
