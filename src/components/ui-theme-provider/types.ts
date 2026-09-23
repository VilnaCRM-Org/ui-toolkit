import type { ReactNode } from 'react';

import type { UiThemeOptions, UiThemeVariant } from '@/utils/ui-theme';

export interface UiThemeProviderProps {
  variant?: UiThemeVariant | undefined;
  theme?: UiThemeOptions | undefined;
  children: ReactNode;
}
