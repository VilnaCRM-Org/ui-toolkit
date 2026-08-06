import { Box, Link, ThemeProvider } from '@mui/material';
import React from 'react';

import theme from './theme';
import type { UiLinkProps } from './types';

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

// For target="_blank" always enforce noopener/noreferrer (anti tab-nabbing),
// merging—not replacing—any rel tokens the consumer passed.
function mergeRel(opensInNewTab: boolean, rel: string | undefined): string | undefined {
  if (!opensInNewTab) {
    return rel;
  }
  const passed: string[] = rel?.split(/\s+/).filter(Boolean) ?? [];
  return Array.from(new Set([...passed, 'noopener', 'noreferrer'])).join(' ');
}

// A disabled link keeps its href (dropping it would strip the `link` role and
// the accessible name), so activation has to be cancelled explicitly.
function suppressNavigation(event: React.MouseEvent<HTMLAnchorElement>): void {
  event.preventDefault();
}

function UiLink({
  children,
  href,
  target,
  rel,
  sx,
  disabled,
  newTabLabel = '(opens in new tab)',
}: UiLinkProps): React.ReactElement {
  const opensInNewTab: boolean = target === '_blank';

  return (
    <ThemeProvider theme={theme}>
      <Link
        href={href}
        target={target}
        rel={mergeRel(opensInNewTab, rel)}
        sx={sx}
        aria-disabled={disabled ? true : undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? suppressNavigation : undefined}
      >
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
