import { Link, SxProps, Theme } from '@mui/material';
import React from 'react';

import linkStyles from './theme';
import { UiLinkProps } from './types';

function UiLink({ children, href, target, rel, sx }: UiLinkProps): React.ReactElement {
  const computedRel: string | undefined =
    rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);
  const mergedSx: SxProps<Theme> = Array.isArray(sx)
    ? [linkStyles, ...sx]
    : sx
      ? [linkStyles, sx]
      : [linkStyles];

  return (
    <Link href={href} target={target} rel={computedRel} sx={mergedSx}>
      {children}
    </Link>
  );
}

export default UiLink;
