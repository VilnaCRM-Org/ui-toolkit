import { Theme, createTheme } from '@mui/material';

import { outlinedFieldTheme } from '../field-controls';
import colorTheme from '../ui-color-theme';

// Figma "Search": the shared outlined-field theme plus the leading magnifier
// (grey at rest, brand-blue on focus) and the `#969B9D` placeholder.
const theme: Theme = createTheme(outlinedFieldTheme, {
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiInputAdornment-positionStart': {
            color: colorTheme.palette.grey300.main,
          },
          '&.Mui-focused .MuiInputAdornment-positionStart': {
            color: colorTheme.palette.primary.main,
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
  },
});

export default theme;
