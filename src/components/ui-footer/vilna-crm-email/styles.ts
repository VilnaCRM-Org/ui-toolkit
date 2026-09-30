import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fontFamilies } from '@/utils/font-tokens';
import { colorTokens as colorTheme } from '@/utils/palette-tokens';
import { uiBreakpointValues } from '@/utils/ui-breakpoint-queries';

export default {
  emailText: (theme: Theme): SystemStyleObject<Theme> => ({
    color: colorTheme.palette.darkSecondary.main,
    textAlign: 'center',
    width: '100%',
    textDecoration: 'none',
    [`@media (max-width: ${uiBreakpointValues(theme).md}px)`]: {
      fontSize: '1.125rem',
      fontStyle: 'normal',
      fontWeight: '600',
      lineHeight: 'normal',
    },
  }),

  emailLink: {
    color: 'inherit',
    textDecoration: 'none',
    fontFamily: fontFamilies.golos,
  },

  emailWrapper: (theme: Theme): SystemStyleObject<Theme> => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    background: colorTheme.palette.white.main,
    border: `1px solid ${colorTheme.palette.grey400.main}`,
    [`@media (max-width: ${uiBreakpointValues(theme).md}px)`]: {
      padding: '0.875rem 0 0.9375rem',
    },
  }),
};
