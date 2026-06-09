import { Theme, createTheme } from '@mui/material';

export const websiteBreakpointValues = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

export const crmBreakpointValues = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

export const websiteBreakpointsTheme: Theme = createTheme({
  breakpoints: {
    values: websiteBreakpointValues,
  },
});

export const crmBreakpointsTheme: Theme = createTheme({
  breakpoints: {
    values: crmBreakpointValues,
  },
});

export const heightBreakpoints = {
  compact: 550,
  medium: 700,
} as const;

export default websiteBreakpointsTheme;
