import { Theme, createTheme } from '@mui/material';

import { outlinedFieldTheme } from '../field-controls';
import colorTheme from '../ui-color-theme';

// Figma "select с поиском" (node 448:25545): the shared outlined-field theme plus
// the exact select metrics — a 48px box, Golos Text Medium 15/18 value ink
// (#1B2327), a #969B9D placeholder, the lighter Brand-gray (#E1E7EA) resting
// stroke, a 20px text inset and the thin grey chevron. The open popup is a
// bordered 8px card with 44px option rows and an #EAECEE active row, not MUI's
// detached elevated 4px Paper. Without these the Autocomplete inherits MUI's
// Roboto 16px/56px + elevated-Paper defaults.
const theme: Theme = createTheme(outlinedFieldTheme, {
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // Value text: Golos Text Medium 15/18, Dark-primary ink #1B2327.
          fontFamily: 'Golos Text',
          fontSize: '0.9375rem',
          fontWeight: 500,
          lineHeight: '1.125rem',
          color: colorTheme.palette.darkSecondary.main,
          // Figma hover darkens the stroke one step (#E1E7EA → #D0D4D8, no shadow) —
          // handled by the shared theme's hover rule, which pins it to grey400.
        },
        notchedOutline: {
          // Resting stroke is the lighter Brand-gray, not grey400.
          borderColor: colorTheme.palette.brandGray.main,
        },
        input: {
          '&::placeholder': {
            fontFamily: 'Golos Text',
            fontWeight: 500,
            fontSize: '0.9375rem',
            lineHeight: '1.125rem',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        // When open, the field's bottom corners go square and its stroke matches the
        // card's grey400 (not the closed-state focus grey250), so field + list read as
        // one continuous card (Figma node 448:25553).
        root: {
          '&.Mui-expanded .MuiOutlinedInput-notchedOutline': {
            borderColor: colorTheme.palette.grey400.main,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
        },
        inputRoot: {
          height: '3rem',
          minHeight: '3rem',
          paddingTop: 0,
          paddingBottom: 0,
          // 20px text inset (Figma value/placeholder start), 14px right for the chevron.
          paddingLeft: '1.25rem',
          paddingRight: '0.875rem',
        },
        input: {
          padding: 0,
          minWidth: 0,
        },
        popupIndicator: {
          // Thin grey chevron (#969B9D), not MUI's action.active. The 8px right
          // margin insets it to the Figma ~17px from the field edge (MUI parks the
          // endAdornment at 9px).
          color: colorTheme.palette.grey300.main,
          marginRight: '0.5rem',
        },
        // Open popup (Figma node 448:25553): the options list joins flush under the
        // field with square corners — no top radius (it butts against the field, whose
        // bottom edge is the divider) and no bottom radius either — and no shadow.
        paper: {
          borderRadius: 0,
          border: `1px solid ${colorTheme.palette.grey400.main}`,
          borderTop: 'none',
          boxShadow: 'none',
          marginTop: 0,
        },
        // Rows: 44px, Golos Text Medium 15px, text aligned to the field's 20px inset,
        // #EAECEE active/selected wash. Targeted through the listbox so it out-
        // specifies MUI's built-in `.MuiAutocomplete-option` rule (a bare `option`
        // slot loses and the rows silently collapse to the 36px default).
        listbox: {
          padding: 0,
          '& .MuiAutocomplete-option': {
            minHeight: '2.75rem',
            paddingLeft: '1.25rem',
            fontFamily: 'Golos Text',
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: colorTheme.palette.darkSecondary.main,
            '&.Mui-focused': {
              backgroundColor: colorTheme.palette.grey500.main,
            },
            '&[aria-selected="true"]': {
              backgroundColor: colorTheme.palette.grey500.main,
            },
          },
        },
      },
    },
  },
});

export default theme;
