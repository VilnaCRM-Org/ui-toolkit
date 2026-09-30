import { breakpointTokens as breakpointsTheme } from '@/utils/breakpoint-tokens';
import { colorTokens as colorTheme } from '@/utils/palette-tokens';

export default {
  errorText: {
    marginTop: '0.25rem',
    paddingBottom: '10px',
    color: colorTheme.palette.error.main,
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
      fontSize: '0.75rem',
    },
  },
};
