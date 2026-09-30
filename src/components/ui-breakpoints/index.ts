import { Theme, createTheme } from '@mui/material';

import { crmBreakpointValues, websiteBreakpointValues } from '@/utils/breakpoint-tokens';

export {
  crmBreakpointValues,
  heightBreakpoints,
  websiteBreakpointValues,
} from '@/utils/breakpoint-tokens';

export const websiteBreakpointsTheme: Theme = /* @__PURE__ */ createTheme({
  breakpoints: {
    values: websiteBreakpointValues,
  },
});

export const crmBreakpointsTheme: Theme = /* @__PURE__ */ createTheme({
  breakpoints: {
    values: crmBreakpointValues,
  },
});

export default websiteBreakpointsTheme;
