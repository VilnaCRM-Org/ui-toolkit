import { Theme, createTheme } from '@mui/material';

import { outlinedFieldTheme } from '../field-controls';
import colorTheme from '../ui-color-theme';

// Figma "Multiselect" (node 535:37450): the shared outlined-field theme plus the
// multi-select metrics — a 64px box (taller than the 48px select), Inter typed
// ink, an Inter Regular 16/18 #969B9D placeholder inset 27px from the border, and
// the thin grey chevron. `minHeight` (not a fixed height) lets the field grow as
// selected chips wrap. Without these the Autocomplete inherits MUI's Roboto/56px
// defaults, so the value text, field height and placeholder inset drift.
const theme: Theme = createTheme(outlinedFieldTheme, {
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: 'Inter',
          fontSize: '1rem',
          lineHeight: '1.125rem',
          color: colorTheme.palette.darkPrimary.main,
          // The multi-select field keeps its grey300 stroke on hover (Figma only
          // restyles the chips), overriding the shared theme's grey400 hover pin.
          '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
            borderColor: colorTheme.palette.grey300.main,
          },
        },
        input: {
          '&::placeholder': {
            fontSize: '1rem',
            lineHeight: '1.125rem',
          },
        },
        notchedOutline: {
          // Figma "Multiselect" field stroke is grey300 (#969B9D) — a step darker
          // than the search/select grey400 — and it does not change on hover (only
          // the chips react).
          borderColor: colorTheme.palette.grey300.main,
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: {
          minHeight: '4rem',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          // Chips sit 13px from the field edge (Figma node 535:37529); the 3px chip
          // margin lands them there from a 10px inset. The input carries its own left
          // padding so the empty placeholder still starts at the Figma 27px.
          paddingLeft: '0.625rem',
          paddingRight: '0.875rem',
        },
        input: {
          padding: 0,
          paddingLeft: '1.0625rem',
        },
        popupIndicator: {
          color: colorTheme.palette.grey300.main,
          // Figma insets the chevron 26px from the field edge (node 535:37491),
          // not MUI's default ~9px — nudge it left.
          marginRight: '0.9375rem',
        },
        // Figma shows a clear-all "x-close" (node 622:44553) whenever chips exist;
        // MUI renders it only on hover/focus, so keep it visible while there is a
        // value. It is a 24px glyph inset ~54px from the field edge (left of the
        // chevron), bigger than MUI's default 20px.
        clearIndicator: {
          visibility: 'visible',
          color: colorTheme.palette.grey300.main,
          marginRight: '0.125rem',
          '& svg': { fontSize: '1.5rem' },
        },
        // When chips wrap onto a second row the field grows taller, but Figma keeps
        // the clear-X and chevron pinned to the first row rather than re-centring them
        // in the taller field. Pin the top to the single-row position (MUI otherwise
        // centres it with `top: 50%; translateY(-50%)`).
        endAdornment: {
          top: '1rem',
          transform: 'none',
        },
        // Open dropdown (Figma "Multiselect" node 535:37501): a detached card with a
        // grey400 stroke, 8px radius and the deep "landing" shadow, dropped ~9px
        // below the field.
        paper: {
          borderRadius: '0.5rem',
          border: `1px solid ${colorTheme.palette.grey400.main}`,
          boxShadow: '0px 8px 27px 0px rgba(49, 59, 67, 0.14)',
          marginTop: '0.5rem',
        },
        // Rows: 52px, Inter Medium 16px, 19px inset, faint #FBFBFB active wash.
        // Nested under the listbox so it out-specifies MUI's built-in option rule.
        listbox: {
          padding: 0,
          '& .MuiAutocomplete-option': {
            minHeight: '3.25rem',
            paddingLeft: '1.1875rem',
            fontFamily: 'Inter',
            fontSize: '1rem',
            fontWeight: 500,
            color: colorTheme.palette.darkPrimary.main,
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
