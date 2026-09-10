import { Theme, createTheme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

import { helperTextTypography } from './helper-text';

// Shared outlined-field theme for the Autocomplete-based controls (search /
// select): 8px radius, `#D0D4D8` stroke, hover/focus/error/disabled parity with
// `UiInput`, and the error helper-text treatment. Individual controls extend it
// with `createTheme(outlinedFieldTheme, {...})` for their own bits (e.g. the
// search magnifier focus colour).
const outlinedFieldTheme: Theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          // Figma shows the text-insertion caret in brand-blue.
          caretColor: colorTheme.palette.primary.main,
          // MUI darkens the outline to text.primary on hover; Figma does NOT. Pin the
          // hover stroke to the resting grey400 so search's stroke does not change,
          // select darkens FROM its lighter brand-gray TO this grey400, and
          // multi-select overrides it back to its own grey300 rest.
          '&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: colorTheme.palette.grey400.main,
          },
          // Focus keeps a visible 1px grey250 stroke as the keyboard focus indicator
          // (WCAG 2.4.7). Figma leaves the stroke light and accents the caret/icon in
          // brand-blue instead; that alone is not a sufficient focus cue, so the slightly
          // darker focus stroke is a deliberate, documented a11y deviation (DEV-25).
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: `1px solid ${colorTheme.palette.grey250.main}`,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: colorTheme.palette.strokeDanger.main,
          },
          '&.Mui-disabled': {
            backgroundColor: colorTheme.palette.brandGray.main,
            color: colorTheme.palette.grey300.main,
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderWidth: 0,
          },
        },
        notchedOutline: {
          border: `1px solid ${colorTheme.palette.grey400.main}`,
          borderRadius: '0.5rem',
        },
        input: {
          '&::placeholder': {
            color: colorTheme.palette.grey300.main,
            opacity: 1,
            fontFamily: 'Inter',
            // Figma collapsed-field placeholder is Inter Regular (400); matches UiInput.
            fontWeight: '400',
          },
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        // Shared typography for both resting and error helper text so the resting
        // state stays in the Inter/token system instead of falling back to MUI's
        // default Roboto/rgba; error only swaps the colour. The recipe itself
        // lives in `helper-text.ts`, which the two ThemeProvider-less controls
        // read as well, so there is exactly one copy of it.
        root: helperTextTypography,
      },
    },
  },
});

export default outlinedFieldTheme;
