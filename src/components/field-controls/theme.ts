import { Theme, createTheme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

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
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colorTheme.palette.grey300.main,
          },
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
          '&:hover': {
            borderColor: colorTheme.palette.grey300.main,
          },
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: {
          '&.Mui-error': {
            margin: '0.25rem 0 0 0',
            fontFamily: 'Inter',
            fontWeight: '500',
            fontSize: '0.875rem',
            lineHeight: '1.125rem',
            letterSpacing: 0,
            color: colorTheme.palette.error.main,
          },
        },
      },
    },
  },
});

export default outlinedFieldTheme;
