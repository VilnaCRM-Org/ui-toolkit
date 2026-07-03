import { Theme, createTheme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

// Figma "Search": white field, 8px radius, #D0D4D8 stroke, #969B9D placeholder,
// and a leading magnifier that is grey at rest and brand-blue on focus. Reuses
// the shared `ui-color-theme` tokens; border/focus/error/disabled parity with
// `UiInput`.
const theme: Theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          '& .MuiInputAdornment-positionStart': {
            color: colorTheme.palette.grey300.main,
          },
          '&.Mui-focused .MuiInputAdornment-positionStart': {
            color: colorTheme.palette.primary.main,
          },
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
        input: {
          '&::placeholder': {
            color: colorTheme.palette.grey300.main,
            opacity: 1,
            fontFamily: 'Inter',
            fontWeight: '500',
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
