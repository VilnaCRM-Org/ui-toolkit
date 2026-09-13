import { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import breakpointsTheme from '../ui-breakpoints';
import colorTheme from '../ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

const lgUp: string = `@media (min-width:${breakpointsTheme.breakpoints.values.lg}px)`;

// CRM parity (crm `ui-back-to-main` + `styles/colors.ts`): a white band with the
// link inked in CRM's `grey[50]`, which CRM maps to #969B9D — the kit `grey300`
// token. The values resolve from the kit's OWN tokens (not the host theme's
// `grey[50]`/`background.default`), so a host without those entries can no longer
// collapse the link into an invisible near-white-on-white render.
const section: SxProps<Theme> = {
  paddingTop: '1rem',
  paddingBottom: '1rem',
  backgroundColor: palette.white.main,
  [lgUp]: {
    paddingTop: '1.25rem',
    paddingBottom: '1.25rem',
  },
};

// The focus ring is `darkPrimary`, not the CRM brand-blue: #1EAEFF on the white
// band measures 2.46:1 (< the 3:1 SC 1.4.11 floor, DEV-65) and the ring is the
// sole focus cue on a transparent button (accessibility review, 2026-08-26).
const backButton: SxProps<Theme> = {
  padding: 0,
  color: palette.grey300.main,
  '&:hover': {
    backgroundColor: 'transparent',
  },
  '&:focus-visible': {
    backgroundColor: 'transparent',
    outline: `2px solid ${palette.darkPrimary.main}`,
    outlineOffset: '2px',
  },
};

const icon: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: palette.grey300.main,
  width: '24px',
  height: '24px',
};

// Label ink is the design-source #969B9D (2.81:1 on white, DEV-66) — deferred to
// the same accessibility-visuals sweep as the item-row muted state and the
// action-icon-bar glyphs (D-03); remediate together there.
const backText: SxProps<Theme> = {
  marginLeft: '0.5rem',
  // A literal family, never `theme.typography.fontFamily`: the ambient theme
  // outside a consumer's ThemeProvider is MUI's default, which pinned the label
  // to Roboto. CRM's host theme resolves this to Golos, so the kit names it.
  fontFamily: 'Golos Text',
  fontWeight: 500,
  fontSize: '0.9375rem',
  lineHeight: '1.125rem',
  textTransform: 'none',
  color: palette.grey300.main,
  [lgUp]: {
    lineHeight: '1.125rem',
    letterSpacing: 0,
  },
};

const backToMainStyles: Record<string, SxProps<Theme>> = {
  section,
  backButton,
  icon,
  backText,
};

export default backToMainStyles;
