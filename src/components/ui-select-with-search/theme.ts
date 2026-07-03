import { Theme, createTheme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

// Outline / focus / error / disabled parity with `UiInput` (ui-input/theme.ts),
// reusing the shared `ui-color-theme` tokens. The fixed input height/padding
// from the UiInput theme is intentionally omitted here — MUI `Autocomplete`
// manages the input padding to make room for the popup/clear indicators.
const theme: Theme = createTheme({
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

export default theme;
