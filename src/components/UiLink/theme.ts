import { SxProps, Theme } from '@mui/material';

import breakpointsTheme from '../UiBreakpoints';
import colorTheme from '../UiColorTheme';

const linkStyles: SxProps<Theme> = {
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
};

export default linkStyles;
