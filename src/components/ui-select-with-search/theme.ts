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
          // Open state (focus-independent): square the bottom corners and take the
          // card's grey400 stroke so field + list read as one continuous card. Must
          // NOT be gated on focus, or a forced-open-but-unfocused field keeps its
          // rounded bottom corners.
          '&.Mui-expanded .MuiOutlinedInput-notchedOutline': {
            borderColor: colorTheme.palette.grey400.main,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
          // When the open field is ALSO focused, the shared field-controls focus
          // stroke (grey250) has equal specificity and would win by source order, so
          // re-assert grey400 at higher specificity to keep the "one card" stroke.
          '&.Mui-expanded .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colorTheme.palette.grey400.main,
          },
          // Closed + focused: Figma leaves the stroke unchanged (no darkening), so pin
          // focus back to the resting Brand-gray, overriding the shared focus stroke.
          '&:not(.Mui-expanded)': {
            '.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colorTheme.palette.brandGray.main,
            },
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
        // MUI ships the clear × `visibility: hidden` and reveals it only on hover or
        // while the field is focused, which makes removing a selection undiscoverable
        // the moment focus leaves. Keep it visible whenever there IS a selection
        // (MUI mounts it only when the field is dirty, so an empty field still shows
        // nothing). Same slot-level override `ui-multi-select` uses — but the box is
        // deliberately left at MUI's own 28px (20px glyph + 4px padding), which clears
        // the SC 2.5.8 target-size floor on its own (DEV-63); do NOT shrink it to the
        // multi-select's 24px chip treatment now that this is the primary way to
        // clear the field.
        clearIndicator: {
          visibility: 'visible',
          color: colorTheme.palette.grey300.main,
        },
        // Open popup (Figma node 448:25553): the options list joins flush under the
        // field — top corners square (it butts against the field, whose bottom edge is
        // the divider), bottom corners 8px — so field + list read as one rounded card,
        // no shadow. `overflow: hidden` clips the last row's wash to the rounded corner.
        paper: {
          borderRadius: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          overflow: 'hidden',
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
            '&[aria-selected="true"].Mui-focused': {
              backgroundColor: colorTheme.palette.grey500.main,
            },
          },
        },
      },
    },
  },
});

export default theme;
