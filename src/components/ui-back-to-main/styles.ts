import { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import breakpointsTheme from '../ui-breakpoints';

const lgUp: string = `@media (min-width:${breakpointsTheme.breakpoints.values.lg}px)`;

const buildSection: (theme: Theme) => SxProps<Theme> = (theme: Theme): SxProps<Theme> => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  [lgUp]: {
    paddingTop: '1.25rem',
    paddingBottom: '1.25rem',
  },
});

const buildBackButton: (theme: Theme) => SxProps<Theme> = (theme: Theme): SxProps<Theme> => ({
  padding: 0,
  '&:hover': {
    backgroundColor: 'transparent',
  },
  '&:focus-visible': {
    backgroundColor: 'transparent',
    outline: theme.palette.primary.main
      ? `2px solid ${theme.palette.primary.main}`
      : '2px solid #1976d2',
    outlineOffset: '2px',
  },
});

const buildIcon: (theme: Theme) => SxProps<Theme> = (theme: Theme): SxProps<Theme> => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: theme.palette.grey[50],
  width: '24px',
  height: '24px',
});

const buildBackText: (theme: Theme) => SxProps<Theme> = (theme: Theme): SxProps<Theme> => ({
  marginLeft: theme.spacing(1),
  // No `fontFamily` here on purpose. `useTheme()` resolves the AMBIENT theme,
  // which outside a consumer's ThemeProvider is MUI's default — so pinning
  // `theme.typography.fontFamily` forced the label to Roboto. Leaving it unset
  // lets the UiTypography wrapper's own theme supply the toolkit family.
  fontWeight: 500,
  fontSize: theme.typography.pxToRem(15),
  lineHeight: theme.typography.pxToRem(18),
  textTransform: 'none',
  color: theme.palette.grey[50],
  [lgUp]: {
    lineHeight: '1.125rem',
    letterSpacing: 0,
  },
});

const getBackToMainStyles: (theme: Theme) => Record<string, SxProps<Theme>> = (
  theme: Theme
): Record<string, SxProps<Theme>> => ({
  section: buildSection(theme),
  backButton: buildBackButton(theme),
  icon: buildIcon(theme),
  backText: buildBackText(theme),
});

export default getBackToMainStyles;
