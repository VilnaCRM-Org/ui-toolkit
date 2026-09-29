import { CSSObject, type Theme } from '@mui/material';

import { breakpointTokens as breakpointsTheme } from '@/utils/breakpoint-tokens';
import { fontFamilies } from '@/utils/font-tokens';
import { sharedPalette } from '@/utils/palette-tokens';
import { smUpQuery } from '@/utils/ui-breakpoint-queries';

import { SKELETON_BORDER_COLOR } from '../ui-skeletons';

export const fieldGapMargins: (theme: Theme) => CSSObject = (theme: Theme): CSSObject => ({
  marginBottom: '0.5rem',
  [smUpQuery(theme)]: {
    marginBottom: '1.125rem',
  },
  [`@media (min-width:${breakpointsTheme.breakpoints.values.md}px)`]: {
    marginBottom: '1.4375rem',
  },
  [`@media (min-width:${breakpointsTheme.breakpoints.values.lg}px)`]: {
    marginBottom: '1.125rem',
  },
  [`@media (min-width:${breakpointsTheme.breakpoints.values.xl}px)`]: {
    marginBottom: '1rem',
  },
});

export const formSection: CSSObject = {
  paddingTop: '0.5rem',
  paddingLeft: '0.375rem',
  paddingRight: '0.375rem',
  paddingBottom: '1.5rem',
  fontFamily: fontFamilies.golos,
  backgroundColor: sharedPalette.backgroundGrey100.main,
  [`@media (min-width:${breakpointsTheme.breakpoints.values.md}px)`]: {
    paddingTop: '8.4375rem',
    paddingBottom: '8.4375rem',
  },
  [`@media (min-width:${breakpointsTheme.breakpoints.values.xl}px)`]: {
    paddingTop: '3.4375rem',
    paddingBottom: '3.4375rem',
  },
};

export const formWrapper: CSSObject = {
  position: 'relative',
  width: '100%',
  padding: '1.5rem 1.5rem 1.375rem',
  margin: '0 auto',
  backgroundColor: sharedPalette.white.main,
  border: `1px solid ${SKELETON_BORDER_COLOR}`,
  borderRadius: '16px',
  boxShadow: '0px 7px 40px 0px rgba(211, 216, 224, 0.2)',
  maxWidth: '22.6875rem',
  [`@media (min-width:${breakpointsTheme.breakpoints.values.md}px)`]: {
    maxWidth: '39.5rem',
    paddingTop: '2.625rem',
    paddingLeft: '2.8125rem',
    paddingRight: '2.8125rem',
    paddingBottom: '2.1875rem',
  },
  [`@media (min-width:${breakpointsTheme.breakpoints.values.xl}px)`]: {
    maxWidth: '31.375rem',
    padding: '2.1rem 2.4375rem 1.9375rem',
  },
};
