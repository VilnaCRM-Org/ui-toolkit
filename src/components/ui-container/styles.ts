import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { uiBreakpointValues } from '@/utils/ui-breakpoint-queries';

const containerPadding: Record<string, string> = {
  xs: '0.9375rem',
  md: '1.625rem',
  lg: '2rem',
  xl: '7.75rem',
};

export default {
  container: (theme: Theme): SystemStyleObject<Theme> => ({
    width: '100%',
    paddingLeft: containerPadding.xs,
    paddingRight: containerPadding.xs,
    margin: '0 auto',
    [`@media (min-width:${uiBreakpointValues(theme).md}px)`]: {
      paddingLeft: containerPadding.md,
      paddingRight: containerPadding.md,
    },
    [`@media (min-width:${uiBreakpointValues(theme).lg}px)`]: {
      paddingLeft: containerPadding.lg,
      paddingRight: containerPadding.lg,
    },
    [`@media (min-width:${uiBreakpointValues(theme).xl}px)`]: {
      paddingLeft: containerPadding.xl,
      paddingRight: containerPadding.xl,
    },
  }),
};
