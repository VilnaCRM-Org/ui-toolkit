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
// band measures 2.46:1 (< the 3:1 SC 1.4.11 floor) and the ring is the sole
// focus cue on a transparent button (accessibility review amendment, 2026-08-26).
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

// Label ink is the design-source #969B9D (2.81:1 on white) — covered by the same
// Story 1.3 accessibility-visuals deferral as the item-row muted state and the
// action-icon-bar glyphs; remediate together in that sweep.
const backText: SxProps<Theme> = {
  marginLeft: '0.5rem',
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
