import type { ThemeOptions } from '@mui/material';
import type { ReactNode } from 'react';

import type { UiThemeVariant } from '@/utils/ui-theme';

export interface UiThemeProviderProps {
  variant?: UiThemeVariant | undefined;
  theme?: ThemeOptions | undefined;
  children: ReactNode;
}
