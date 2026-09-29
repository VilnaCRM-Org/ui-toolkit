import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fontFamilies } from '@/utils/font-tokens';
import { colorTokens as colorTheme } from '@/utils/palette-tokens';
import { uiBreakpointValues } from '@/utils/ui-breakpoint-queries';

export default {
  wrapper: {
    marginBottom: '0.75rem',
    borderTop: `1px solid  ${colorTheme.palette.brandGray.main}`,
    background: colorTheme.palette.white.main,
    boxShadow:
      ' 0px -5px 46px 0px rgba(198, 209, 220, 0.25), 0px -5px 46px 0px rgba(198, 209, 220, 0.25)',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '1.125rem',
    paddingBottom: '0.75rem',
    '@media (max-width: 350px)': {
      gap: '0.5rem',
    },
  },

  copyright: {
    fontFamily: fontFamilies.golos,
    paddingBottom: '1.25rem',
    color: colorTheme.palette.grey200.main,
    textAlign: 'center',
    width: '100%',
    mt: '1rem',
  },

  listWrapper: (theme: Theme): SystemStyleObject<Theme> => ({
    gap: '0.5rem',
    justifyContent: 'center',
    [`@media (max-width: ${uiBreakpointValues(theme).md}px)`]: {
      gap: '0.25rem',
    },
    '@media (max-width: 350px)': {
      gap: '0',
    },
  }),
};
