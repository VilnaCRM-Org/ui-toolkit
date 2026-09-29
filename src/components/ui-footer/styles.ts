import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { colorTokens as colorTheme } from '@/utils/palette-tokens';
import { uiBreakpointValues } from '@/utils/ui-breakpoint-queries';

export default {
  default: (theme: Theme): SystemStyleObject<Theme> => ({
    display: 'block',
    [`@media (max-width: ${uiBreakpointValues(theme).md}px)`]: {
      display: 'none',
    },
  }),
  adaptive: (theme: Theme): SystemStyleObject<Theme> => ({
    display: 'none',
    [`@media (max-width: ${uiBreakpointValues(theme).md}px)`]: {
      display: 'block',
    },
  }),
  footerWrapper: {
    borderTop: `1px solid ${colorTheme.palette.brandGray.main}`,
    background: colorTheme.palette.white.main,
    boxShadow: '0px -5px 46px 0px rgba(198, 209, 220, 0.25)',
  },
  topWrapper: {
    width: '100%',
    maxWidth: '1222px',
    margin: '0 auto',
  },
  topContent: (theme: Theme): SystemStyleObject<Theme> => ({
    paddingLeft: '1rem',
    paddingRight: '1rem',
    [`@media (max-width: ${uiBreakpointValues(theme).lg}px)`]: {
      paddingLeft: '2rem',
      paddingRight: '1.5rem',
    },
  }),
  bottomWrapper: {
    borderRadius: '1rem 1rem 0px 0px',
    background: colorTheme.palette.backgroundGrey200.main,
  },
  copyrightAndLinksWrapper: {
    width: '100%',
    maxWidth: '1222px',
    margin: '0 auto',
  },
  copyrightAndLinks: (theme: Theme): SystemStyleObject<Theme> => ({
    paddingLeft: '1.3rem',
    paddingRight: '1rem',
    height: '3.688rem',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.3rem',
    [`@media (max-width: ${uiBreakpointValues(theme).lg}px)`]: {
      paddingRight: '2rem',
      paddingLeft: '2rem',
      pb: '0.2rem',
    },
  }),
  copyright: {
    color: colorTheme.palette.grey200.main,
  },
  mobileWrapper: {
    marginBottom: '0.75rem',
    borderTop: `1px solid ${colorTheme.palette.brandGray.main}`,
    background: colorTheme.palette.white.main,
    boxShadow:
      '0px -5px 46px 0px rgba(198, 209, 220, 0.25), 0px -5px 46px 0px rgba(198, 209, 220, 0.25)',
  },
  mobileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '1.125rem',
    paddingBottom: '0.75rem',
    '@media (max-width: 350px)': {
      gap: '0.5rem',
    },
  },
  mobileCopyright: {
    paddingBottom: '1.25rem',
    color: colorTheme.palette.grey200.main,
    textAlign: 'center',
    width: '100%',
    mt: '1rem',
  },
  socialLinks: {
    gap: '0.875rem',
    alignItems: 'center',
  },
};
