import type { Theme } from '@mui/material';

import { resolveUiTheme } from './ui-theme';

export function smUpQuery(theme: Theme): string {
  return `@media (min-width:${resolveUiTheme(theme).breakpoints.values.sm}px)`;
}
