import breakpointsTheme from '@/components/ui-breakpoints';
import colorTheme from '@/components/ui-color-theme';

const { md, lg, xl } = breakpointsTheme.breakpoints.values;

export default {
  footer: {
    borderTop: `1px solid ${colorTheme.palette.brandGray.main}`,
    backgroundColor: colorTheme.palette.white.main,
    boxShadow: '0px -5px 46px 0px rgba(198, 209, 220, 0.25)',
    paddingTop: '1.1rem',
    paddingBottom: '1.25rem',
    [`@media (min-width:${md}px)`]: {
      paddingTop: '0.475625rem',
      paddingBottom: '0.725625rem',
    },
    [`@media (min-width:${lg}px)`]: {
      paddingTop: '0.538125rem',
    },
    [`@media (min-width:${xl}px)`]: {
      paddingTop: '0.5625rem',
      paddingBottom: '0.43375rem',
    },
  },
  content: {
    [`@media (min-width:${md}px)`]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  logo: {
    display: 'block',
    width: '8.125rem',
    height: '2.75rem',
    margin: '0 auto 0.9375rem',
    [`@media (min-width:${md}px)`]: {
      margin: 0,
    },
    [`@media (min-width:${lg}px)`]: {
      width: '8.6875rem',
      height: '2.92375rem',
    },
    [`@media (min-width:${xl}px)`]: {
      width: '9rem',
      height: '3rem',
    },
  },
  links: {
    textAlign: 'center',
    [`@media (min-width:${md}px)`]: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
  },
  link: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.25rem',
    padding: '1.0625rem 0 1.125rem',
    borderRadius: '0.5rem',
    color: colorTheme.palette.grey200.main,
    textDecoration: 'none',
    backgroundColor: colorTheme.palette.backgroundGrey200.main,
    '&:hover': {
      textDecoration: 'underline',
    },
    '&:focus-visible': {
      textDecoration: 'underline',
      outline: `2px solid ${colorTheme.palette.darkPrimary.main}`,
      outlineOffset: '2px',
    },
    [`@media (min-width:${md}px)`]: {
      marginTop: 0,
      padding: '0.5rem 1rem',
    },
  },
  linkText: {
    color: 'inherit',
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: '1.125rem',
  },
};
