import { Theme, createTheme } from '@mui/material';

import breakpointsTheme from '../ui-breakpoints';
import colorTheme from '../ui-color-theme';

const theme: Theme = createTheme({
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: colorTheme.palette.primary.main,
          fontFamily: 'Inter',
          fontSize: '0.875rem',
          fontStyle: 'normal',
          fontWeight: '700',
          lineHeight: '1.125rem',
          textDecoration: 'underline',
          [`@media (max-width: 1130px)`]: {
            fontSize: '1rem',
          },
          [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
            fontSize: '0.875rem',
          },
          '&:hover': {
            color: colorTheme.palette.textLinkHover.main,
          },
          '&:active': {
            color: colorTheme.palette.textLinkActive.main,
          },
          // Board A's Disabled column (`439:19364`, `439:19614`) repaints the link
          // ink to Brand gray and changes nothing else — the measured disabled and
          // rest glyphs share their typography and carry no decoration delta — so
          // only `color` moves here. The nested hover/active resets keep the
          // interactive accents from firing while the link is disabled; they sit
          // last so they win the equal-specificity race against the rules above.
          '&[aria-disabled="true"]': {
            color: colorTheme.palette.brandGray.main,
            cursor: 'default',
            '&:hover': {
              color: colorTheme.palette.brandGray.main,
            },
            '&:active': {
              color: colorTheme.palette.brandGray.main,
            },
          },
        },
      },
    },
  },
});

export default theme;
