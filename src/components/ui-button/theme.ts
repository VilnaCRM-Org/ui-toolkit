import { Interpolation, Theme, createTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import breakpointsTheme from '../ui-breakpoints';
import colorTheme from '../ui-color-theme';

// The 18px line box is the SMALL button's: Figma 439:19257 is 137x50 around an
// 89x18 label inset 24/16 (24+89+24=137, 16+18+16=50), and the danger pill
// 439:19822 is 98x42 around the same 18px label inset 24/12. The medium button
// has a taller label box and overrides it below.
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

// Desktop medium CTA, Figma 439:19253: a 171x62 pill around a 107x22 label inset
// 32px horizontally and 20px vertically (32+107+32=171, 20+22+20=62). The height
// is the label's line box plus that padding, so lineHeight carries the 22px --
// inheriting the base 18px above renders the pill 58px tall, 4px short.
const mediumLabelBox = {
  fontWeight: '600',
  fontSize: '1.125rem',
  lineHeight: '1.375rem',
  padding: '1.25rem 2rem',
} as const;

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
  // Base family for the slots the variants below do not name themselves —
  // without it MUI's stock Roboto wins, and Roboto is not a face the toolkit
  // ships. Same family the contained/outlined button text already uses.
  typography: { fontFamily: 'Golos Text' },
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
            ...mediumLabelBox,
            alignSelf: 'center',
            // The mobile CTA is a different box and keeps the 18px line.
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
          // The contained CTA above IS the 171x62 pill and carries no stroke, so
          // its 20/32 padding is the whole inset. This rule adds `outlinedStyles`'
          // 1px border, and CSS draws a border OUTSIDE the padding box on an
          // auto-sized element -- `boxSizing` cannot absorb it, because
          // border-box only bites when a length is declared and both axes here
          // are `auto`. Reusing the CTA's padding verbatim therefore renders
          // 173x64, 2px over its contained sibling on both axes. Figma strokes
          // INSIDE the frame, so the border is subtracted from the padding
          // instead: 19/31 plus the 1px border reproduces the 20/32 inset and
          // lands the box back on 171x62 (1+19+22+19+1 = 62). Same compensation
          // `ui-add-button`, `ui-filter-chip`, `ui-task-card` and
          // `ui-integration-card` already apply.
          style: {
            ...outlinedStyles,
            ...mediumLabelBox,
            padding: '1.1875rem 1.9375rem',
            // A transparent 1px rather than `outlinedStyles`' `border: none`, so
            // the compensated padding holds in every state and the box does not
            // jitter when the button is disabled -- the danger pill's convention.
            '&:disabled': {
              backgroundColor: colorTheme.palette.brandGray.main,
              color: colorTheme.palette.white.main,
              border: '1px solid transparent',
            },
          },
        },
        {
          props: {
            name: 'socialButton',
            variant: 'outlined',
            size: 'medium',
          },
          // MUI applies EVERY matching variant rule, not just the most specific
          // one, so the plain outlined/medium rule above also lands on this
          // button -- which is how it picks up the 18px font size it never
          // declares. That made it inherit the medium CTA's label box too, and
          // this pill is 189x58 around a 22px content row (Figma 439:19329), not
          // a 171x62 CTA. It declares its own line box so the CTA's cannot reach
          // it; without this line the button grows 4px and its visual baseline
          // breaks.
          style: {
            fontFamily: 'Golos Text',
            textTransform: 'none',
            lineHeight: '1.125rem',
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
