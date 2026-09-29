import { Theme, createTheme } from '@mui/material';

import { crmPalette, sharedPalette } from '@/utils/palette-tokens';

export { crmPalette, sharedPalette } from '@/utils/palette-tokens';

export const websiteColorTheme: Theme = /* @__PURE__ */ createTheme({
  palette: {
    ...sharedPalette,
  },
});

export const crmColorTheme: Theme = /* @__PURE__ */ createTheme({
  palette: {
    ...crmPalette,
  },
});

export default websiteColorTheme;
