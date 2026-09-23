import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import type { UiTypographyProps } from './types';

type TypographySx = SxProps<Theme> | undefined;
type TypographyVariant = NonNullable<UiTypographyProps['variant']> | 'body1';

const inheritedTracking: SystemStyleObject<Theme> = { letterSpacing: 'inherit' };

function variantStyle(theme: Theme, variant: TypographyVariant): SystemStyleObject<Theme> {
  return theme.typography[variant] as SystemStyleObject<Theme>;
}

function consumerSx(sx: TypographySx): ReadonlyArray<SxProps<Theme>> {
  if (sx === undefined) {
    return [];
  }
  return Array.isArray(sx) ? sx : [sx];
}

export default function typographySx(
  theme: Theme,
  variant: UiTypographyProps['variant'],
  sx: TypographySx
): SxProps<Theme> {
  return [
    inheritedTracking,
    variantStyle(theme, variant ?? 'body1'),
    ...consumerSx(sx),
  ] as SxProps<Theme>;
}
