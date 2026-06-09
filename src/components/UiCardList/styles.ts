import breakpointsTheme from '../UiBreakpoints';
import colorTheme from '../UiColorTheme';

import { hoveredCard, largeImage, smallImage, smallWrapper } from './sharedCardStyles';

export default {
  smallGrid: {
    display: 'grid',
    marginTop: '2rem',
    gap: '0.75rem',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      display: 'none',
    },
    [`@media (min-width: ${breakpointsTheme.breakpoints.values.md}px)`]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [`@media (min-width: ${breakpointsTheme.breakpoints.values.xl}px)`]: {
      gridTemplateColumns: 'repeat(4, 289px)',
    },
  },
  gridSmallMobile: {
    display: 'none',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      minHeight: '18.5rem',
      display: 'grid',
      marginTop: '1.5rem',
      gap: '0.75rem',
    },
  },
  largeGrid: {
    display: 'grid',
    marginTop: '2.5rem',
    gap: '0.813rem',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.lg}px)`]: {
      gap: '0.75rem',
      marginTop: '2rem',
    },
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      display: 'none',
    },
    [`@media (min-width: ${breakpointsTheme.breakpoints.values.md}px)`]: {
      gridTemplateRows: 'repeat(2, 1fr)',
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [`@media (min-width: ${breakpointsTheme.breakpoints.values.lg}px)`]: {
      gridTemplateRows: 'repeat(2, minmax(23.75rem, auto))',
      gridTemplateColumns: 'repeat(3, minmax(15.625rem, 24.3125rem))',
    },
    [`@media (min-width: ${breakpointsTheme.breakpoints.values.xl}px)`]: {
      gridTemplateRows: 'repeat(2, minmax(21.375rem, auto))',
    },
  },
  gridLargeMobile: {
    display: 'none',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      display: 'grid',
      marginTop: '1.5rem',
      minHeight: '19.313rem',
    },
  },
  gridContainerLargeScreen: {
    display: 'none',
    [`@media (min-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      display: 'block',
    },
  },
  swiperContainerSmallScreen: {
    display: 'none',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm - 0.02}px)`]: {
      display: 'block',
    },
  },
  smallWrapper,
  smallTitle: {
    paddingTop: '2rem',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.lg}px)`]: {
      paddingTop: '0',
    },
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.md}px)`]: {
      fontSize: '1.125rem',
      fontWeight: '600',
    },
  },
  smallText: {
    marginTop: '0.625rem',
    zIndex: 2,
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.md}px)`]: {
      fontSize: '0.9375rem',
      fontWeight: '400',
      lineHeight: '1.563rem',
      marginTop: '0.75rem',
    },
  },
  smallImage,
  hoveredCard,
  largeWrapper: {
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: `1px solid ${colorTheme.palette.grey500.main}`,
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      padding: '1rem 1.125rem 0 1rem',
      minHeight: '16.438rem',
    },
    ':hover': {
      boxShadow: '0px 8px 27px 0px rgba(49, 59, 67, 0.14)',
      border: `1px solid ${colorTheme.palette.grey400.main}`,
    },
  },
  largeTitle: {
    paddingTop: '1rem',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.lg}px)`]: {
      fontSize: '1.375rem',
    },
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      paddingTop: '1rem',
      fontSize: '1.125rem',
    },
  },
  largeText: {
    marginTop: '0.75rem',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      fontSize: '0.9375rem',
      lineHeight: '1.563rem',
    },
  },
  largeImage,
};
