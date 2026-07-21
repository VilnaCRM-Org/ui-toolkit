import { Theme, createTheme } from '@mui/material';

import { outlinedFieldTheme } from '../field-controls';
import { crmBreakpointValues } from '../ui-breakpoints';
import colorTheme from '../ui-color-theme';

// The Figma "Search" comes in three responsive sizes: desktop (node 439:19479) is a
// 477px / 48px box with a 20px magnifier and Inter Medium 14/18; the tablet size
// (node 439:19497, ≤md) is narrower at 360px but taller at 52px with a 24px icon and
// 16px text; the mobile size (node 439:19515, ≤sm) is a 355px / 48px box with a 20px
// magnifier. Breakpoints come from the CRM scale (md 768, sm 480), not hardcoded.
const TABLET_MAX: string = `@media (max-width: ${crmBreakpointValues.md}px)`;
const MOBILE_MAX: string = `@media (max-width: ${crmBreakpointValues.sm}px)`;

const theme: Theme = createTheme(outlinedFieldTheme, {
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // Typed value: Inter Medium 14/18 (16 on tablet), Font/100 ink — not Roboto.
          fontFamily: 'Inter',
          fontSize: '0.875rem',
          fontWeight: 500,
          lineHeight: '1.125rem',
          color: colorTheme.palette.darkPrimary.main,
          [TABLET_MAX]: { fontSize: '1rem' },
          [MOBILE_MAX]: { fontSize: '0.875rem' },
          '& .MuiInputAdornment-positionStart': {
            color: colorTheme.palette.grey300.main,
            marginRight: '0.625rem',
          },
          // The magnifier grows to 24px on tablet, back to 20px on mobile/desktop.
          '& .MuiInputAdornment-positionStart svg': {
            [TABLET_MAX]: { width: '1.5rem', height: '1.5rem' },
            [MOBILE_MAX]: { width: '1.25rem', height: '1.25rem' },
          },
          // Figma tints the magnifier brand-blue on hover and focus — but NOT when
          // disabled (a disabled field must not react to hover).
          '&:hover:not(.Mui-disabled) .MuiInputAdornment-positionStart': {
            color: colorTheme.palette.primary.main,
          },
          '&.Mui-focused:not(.Mui-disabled) .MuiInputAdornment-positionStart': {
            color: colorTheme.palette.primary.main,
          },
          // A disabled field keeps its magnifier greyed even under the pointer.
          '&.Mui-disabled .MuiInputAdornment-positionStart': {
            color: colorTheme.palette.grey300.main,
          },
          // Figma "Search" hover keeps the resting #D0D4D8 stroke and adds a soft
          // drop shadow (only search does this — not select/multi-select).
          '&:hover:not(.Mui-focused):not(.Mui-disabled)': {
            boxShadow: '0px 4px 9px 0px rgba(74, 78, 95, 0.1)',
          },
        },
        input: {
          '&::placeholder': {
            fontWeight: 500,
          },
        },
      },
    },
    // The Autocomplete input root owns the field height: a fixed 48px box (Figma)
    // with a 13px horizontal inset; the flex row centres the 20px magnifier and the
    // input vertically. Zeroing the Autocomplete input padding keeps the text on the
    // 13px+20px+10px baseline instead of MUI's default 7.5px inset.
    MuiAutocomplete: {
      styleOverrides: {
        // Figma sizes the field per breakpoint: 477px desktop, 360px tablet, 355px
        // mobile (nodes 439:19479 / 19497 / 19515).
        root: {
          maxWidth: '29.8125rem',
          [TABLET_MAX]: { maxWidth: '22.5rem' },
          [MOBILE_MAX]: { maxWidth: '22.1875rem' },
        },
        inputRoot: {
          height: '3rem',
          minHeight: '3rem',
          // Tablet grows the field to 52px; mobile returns to the 48px desktop size.
          [TABLET_MAX]: { height: '3.25rem', minHeight: '3.25rem' },
          [MOBILE_MAX]: { height: '3rem', minHeight: '3rem' },
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: '0.8125rem',
          paddingRight: '0.8125rem',
        },
        input: {
          padding: 0,
          minWidth: 0,
        },
        // Open suggestions (Figma "Search" active, node 439:19397): a detached card
        // with a 2px Brand-gray stroke, 12px radius and the soft landing shadow. The
        // gap below the field tightens per breakpoint (4px desktop / 9px tablet / 8px
        // mobile), and the list is a fixed 473px — so on tablet it is WIDER than the
        // 360px field (Figma) — collapsing to the 355px field width on mobile.
        paper: {
          borderRadius: '0.75rem',
          border: `2px solid ${colorTheme.palette.brandGray.main}`,
          boxShadow: '0px 8px 13.5px 0px rgba(49, 59, 67, 0.14)',
          minWidth: '29.5625rem',
          marginTop: '0.25rem',
          [TABLET_MAX]: { marginTop: '0.5625rem' },
          [MOBILE_MAX]: { marginTop: '0.5rem', minWidth: 0 },
        },
        // Rows follow the field's responsive type: 52px / Inter Medium 14px / 19px
        // inset on desktop, growing to 62px / 16px / 22px on tablet; the active row
        // takes the faint Figma "Grey bg" (#FBFBFB) wash. Targeted through the listbox
        // so it out-specifies MUI's built-in `.MuiAutocomplete-option` rule.
        listbox: {
          padding: 0,
          '& .MuiAutocomplete-option': {
            minHeight: '3.25rem',
            paddingLeft: '1.1875rem',
            fontFamily: 'Inter',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: colorTheme.palette.darkPrimary.main,
            [TABLET_MAX]: { minHeight: '3.875rem', fontSize: '1rem', paddingLeft: '1.375rem' },
            [MOBILE_MAX]: { minHeight: '3.25rem', fontSize: '0.875rem', paddingLeft: '1.1875rem' },
            '&.Mui-focused': {
              backgroundColor: '#FBFBFB',
            },
          },
        },
      },
    },
  },
});

export default theme;
