import { Interpolation, Theme, createTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import breakpointsTheme from '../ui-breakpoints';
import colorTheme from '../ui-color-theme';

const baseButtonStyles: Interpolation<{ theme: Theme }> = {
  textTransform: 'none',
  textDecoration: 'none',
  fontSize: '0.938rem',
  fontFamily: 'Golos Text',
  fontWeight: '500',
  lineHeight: '1.125rem',
  letterSpacing: '0',
  borderRadius: '3.563rem',
};

export const containedStyles: Interpolation<{ theme: Theme }> = {
  ...baseButtonStyles,
  backgroundColor: colorTheme.palette.primary.main,
  '&:hover': {
    backgroundColor: colorTheme.palette.containedButtonHover.main,
  },
  '&:active': {
    backgroundColor: colorTheme.palette.containedButtonActive.main,
  },
  '&:disabled': {
    backgroundColor: colorTheme.palette.brandGray.main,
    color: colorTheme.palette.white.main,
  },
};

export const outlinedStyles: Interpolation<{ theme: Theme }> = {
  ...baseButtonStyles,
  color: colorTheme.palette.darkSecondary.main,
  backgroundColor: colorTheme.palette.white.main,
  border: `1px solid ${colorTheme.palette.grey300.main}`,
  '&:hover': {
    backgroundColor: colorTheme.palette.grey500.main,
    border: '1px solid rgba(0,0,0,0)',
  },
  '&:active': {
    border: `1px solid ${colorTheme.palette.grey500.main}`,
  },
  '&:disabled': {
    backgroundColor: colorTheme.palette.brandGray.main,
    color: colorTheme.palette.white.main,
    border: 'none',
  },
};

// Board A y=1354, danger `Cancel` pill (rest 439:19822 / hover 439:19824 /
// active 439:19826 / disabled 439:19828). Border stays declared at 1px in every
// state (transparent where Figma paints none) so the 98x42 box never shifts.
export const dangerStyles: Interpolation<{ theme: Theme }> = {
  ...baseButtonStyles,
  padding: '0.75rem 1.5rem',
  backgroundColor: alpha(colorTheme.palette.error.main, 0.1),
  border: `1px solid ${colorTheme.palette.strokeDanger.main}`,
  color: colorTheme.palette.error.main,
  '&:hover': {
    backgroundColor: colorTheme.palette.error.main,
    border: '1px solid transparent',
    color: colorTheme.palette.white.main,
  },
  '&:active': {
    backgroundColor: colorTheme.palette.strokeDanger.main,
    border: '1px solid transparent',
    color: colorTheme.palette.white.main,
  },
  '&:disabled': {
    backgroundColor: colorTheme.palette.brandGray.main,
    border: '1px solid transparent',
    color: colorTheme.palette.white.main,
  },
};

export const theme: Theme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'contained', size: 'small' },
          style: { ...containedStyles, padding: '1rem 1.5rem' },
        },
        {
          props: { variant: 'contained', size: 'medium' },
          style: {
            ...containedStyles,
            alignSelf: 'center',
            fontWeight: '600',
            fontSize: '1.125rem',
            padding: '1.25rem 2rem',
            [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
              fontSize: '0.9375rem',
              fontWeight: '400',
              lineHeight: '1.125rem',
              padding: '1rem 1.438rem',
            },
          },
        },
        {
          props: { variant: 'outlined', size: 'small' },
          style: { ...outlinedStyles, padding: '1rem 1.5rem' },
        },
        {
          props: { variant: 'outlined', size: 'medium' },
          style: {
            ...outlinedStyles,
            fontWeight: '600',
            fontSize: '1.125rem',
            padding: '1.25rem 2rem',
          },
        },
        {
          props: {
            name: 'socialButton',
            variant: 'outlined',
            size: 'medium',
          },
          style: {
            fontFamily: 'Golos Text',
            textTransform: 'none',
            borderRadius: '0.75rem',
            padding: '1.125rem',
            gap: '0.563rem',
            border: `1px solid ${colorTheme.palette.brandGray.main}`,
            background: colorTheme.palette.white.main,
            color: colorTheme.palette.darkPrimary.main,
            '&:hover': {
              background: colorTheme.palette.white.main,
              boxShadow: '0px 4px 7px 0px rgba(116, 134, 151, 0.17)',
              border: `1px solid ${colorTheme.palette.brandGray.main}`,
            },
            '&:active': {
              background: colorTheme.palette.white.main,
              boxShadow: '0px 4px 7px 0px rgba(71, 85, 99, 0.21)',
              border: `1px solid ${colorTheme.palette.grey300.main}`,
            },
            '&:disabled': {
              background: colorTheme.palette.brandGray.main,
              boxShadow: 'none',
              border: 'none',
              img: {
                opacity: '0.2',
              },
              div: {
                color: colorTheme.palette.white.main,
              },
            },
          },
        },
        {
          props: {
            name: 'danger',
            variant: 'contained',
            size: 'small',
          },
          style: dangerStyles,
        },
      ],
    },
  },
});
