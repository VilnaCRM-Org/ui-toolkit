import { CircularProgress, useMediaQuery } from '@mui/material';
import React from 'react';

import breakpointsTheme from '../ui-breakpoints';
import colorTheme from '../ui-color-theme';

// CRM parity (crm `ui-form/submit-spinner`): the submitting indicator renders
// INSIDE the submit button via the MUI `loading` slot — 40px from the md
// breakpoint up, 28px below. The white ink over the disabled brandGray button is
// the CRM/design-source appearance, kept literally by owner ruling (2026-08-26)
// despite its low non-text contrast; no Figma loading master exists to overrule.
export default function SubmitSpinner(): React.ReactElement {
  const isWide: boolean = useMediaQuery(breakpointsTheme.breakpoints.up('md'));
  return (
    <CircularProgress
      aria-hidden
      sx={{ color: colorTheme.palette.white.main }}
      thickness={4.5}
      size={isWide ? 40 : 28}
    />
  );
}
