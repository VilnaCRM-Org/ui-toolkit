import { Box, Link, ThemeProvider } from '@mui/material';
import React from 'react';

import theme from './theme';
import { UiLinkProps } from './types';

const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

function UiLink({
  children,
  href,
  target,
  rel,
  sx,
  newTabLabel = '(opens in new tab)',
}: UiLinkProps): React.ReactElement {
  const opensInNewTab: boolean = target === '_blank';
  // For target="_blank" always enforce noopener/noreferrer (anti tab-nabbing),
  // merging—not replacing—any rel tokens the consumer passed.
  const computedRel: string | undefined = opensInNewTab
    ? Array.from(
        new Set([...(rel?.split(/\s+/).filter(Boolean) ?? []), 'noopener', 'noreferrer'])
      ).join(' ')
    : rel;

  return (
    <ThemeProvider theme={theme}>
      <Link href={href} target={target} rel={computedRel} sx={sx}>
        {children}
        {opensInNewTab && newTabLabel ? (
          <Box component="span" sx={visuallyHidden}>
            {` ${newTabLabel}`}
          </Box>
        ) : null}
      </Link>
    </ThemeProvider>
  );
}

export default UiLink;
