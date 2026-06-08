import breakpointsTheme from '../UiBreakpoints';
import colorTheme from '../UiColorTheme';

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
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      display: 'block',
    },
  },
  smallWrapper: {
    padding: '2.5rem 2rem 2.5rem 1.563rem',
    borderRadius: '0.75rem',
    border: `1px solid ${colorTheme.palette.grey500.main}`,
    maxHeight: '20.75rem',
    alignItems: 'start',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.xl - 1}px)`]: {
      padding: '2.125rem 1.875rem 2.125rem 1.563rem',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '2.813rem',
      maxHeight: '11.375rem',
    },
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      flexDirection: 'column',
      padding: '1rem 1.125rem 0rem 1rem',
      gap: '1rem',
      alignItems: 'start',
      minHeight: '15.125rem',
    },
  },
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
  smallImage: {
    width: '5rem',
    height: '5rem',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      width: '3.125rem',
      height: '3.125rem',
    },
  },
  hoveredCard: {
    cursor: 'pointer',
    color: colorTheme.palette.primary.main,
    textDecoration: 'underline',
    fontWeight: '700',
  },
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
  largeImage: {
    width: '4.375rem',
    height: '4.375rem',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.md}px)`]: {
      width: '3.125rem',
      height: '3.125rem',
    },
  },
};
