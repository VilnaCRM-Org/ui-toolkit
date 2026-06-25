import breakpointsTheme from '../ui-breakpoints';
import { hoveredCard, largeImage, smallImage, smallWrapper } from '../ui-card-list';
import colorTheme from '../ui-color-theme';

export default {
  smallWrapper,

  smallTitle: {
    pt: '2rem',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.lg}px)`]: {
      pt: '0',
    },
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.md}px)`]: {
      fontSize: '1.125rem',
      fontWeight: '600',
    },
  },

  smallText: {
    mt: '0.625rem',
    zIndex: 2,
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.lg}px)`]: {
      a: {
        textDecoration: 'none',
        fontWeight: '400',
        color: colorTheme.palette.darkPrimary.main,
      },
    },
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.md}px)`]: {
      fontSize: '0.9375rem',
      fontWeight: '400',
      lineHeight: '1.563rem',
      mt: '0.75rem',
    },
  },

  smallImage,

  hoveredCard,

  servicesLink: {
    color: 'inherit',
    fontWeight: 'inherit',
    textDecorationColor: 'inherit',
  },

  largeWrapper: {
    p: '1.5rem',
    borderRadius: '0.75rem',
    border: `1px solid ${colorTheme.palette.grey500.main}`,
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      padding: '1rem 1.125rem 0 1rem',
      borderRadius: '0.75rem',
      border: `1px solid ${colorTheme.palette.grey500.main}`,
      minHeight: '16.438rem',
    },
    ':hover': {
      boxShadow: '0px 8px 27px 0px rgba(49, 59, 67, 0.14)',
      border: `1px solid ${colorTheme.palette.grey400.main}`,
    },
  },

  largeTitle: {
    pt: '1rem',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.lg}px)`]: {
      fontSize: '1.375rem',
    },
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      pt: '1rem',
      fontSize: '1.125rem',
    },
  },

  largeText: {
    mt: '0.75rem',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      fontSize: '0.9375rem',
      lineHeight: '1.563rem',
    },
  },

  largeImage,
};
