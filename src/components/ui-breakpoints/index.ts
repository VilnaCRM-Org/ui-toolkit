import { Theme, createTheme } from '@mui/material';

export const websiteBreakpointValues: {
  readonly xs: 375;
  readonly sm: 640;
  readonly md: 768;
  readonly lg: 1024;
  readonly xl: 1440;
} = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

export const crmBreakpointValues: {
  readonly xs: 320;
  readonly sm: 480;
  readonly md: 768;
  readonly lg: 1024;
  readonly xl: 1440;
} = {
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

export const heightBreakpoints: {
  readonly compact: 550;
  readonly medium: 700;
} = {
  compact: 550,
  medium: 700,
} as const;

export default websiteBreakpointsTheme;
