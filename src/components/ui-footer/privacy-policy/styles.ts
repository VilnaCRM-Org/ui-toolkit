import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { colorTokens as colorTheme } from '@/utils/palette-tokens';
import { uiBreakpointValues } from '@/utils/ui-breakpoint-queries';

export default {
  wrapper: (theme: Theme): SystemStyleObject<Theme> => ({
    gap: '0.5rem',
    flexDirection: 'row',
    [`@media (max-width: ${uiBreakpointValues(theme).md}px)`]: {
      flexDirection: 'column',
      gap: '0.25rem',
      pt: '0.25rem',
    },
  }),

  textColor: {
    color: colorTheme.palette.grey300.main,
  },

  link: (theme: Theme): SystemStyleObject<Theme> => ({
    color: 'inherit',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    background: colorTheme.palette.backgroundGrey200.main,
    [`@media (max-width: ${uiBreakpointValues(theme).md}px)`]: {
      textAlign: 'center',
      width: '100%',
      padding: '1.063rem 0 1.125rem',
    },
    '&:hover': {
      background: colorTheme.palette.grey500.main,
    },
  }),
};
