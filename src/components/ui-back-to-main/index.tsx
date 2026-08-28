import { Box } from '@mui/material';
import React from 'react';

import UiButton from '../ui-button';
import UiContainer from '../ui-container';
import UiTypography from '../ui-typography';

import backToMainStyles from './styles';

type UiBackToMainProps = {
  to?: string;
  label?: React.ReactNode;
  /** Decorative leading glyph; rendered inside an `aria-hidden` box. */
  icon?: React.ReactNode;
};

// The CRM back-arrow export (`assets/icons/arrows/back-arrow.svg`): an 8x14
// chevron at stroke 2 with round caps. Inlined with `currentColor` so it takes
// the link ink (and recolours under forced colors, unlike CRM's `<img>`).
function DefaultBackIcon(): React.ReactElement {
  return (
    <svg aria-hidden="true" focusable="false" width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path
        d="M7 13L1 7L7 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UiBackToMain({
  to = '/',
  label = 'Back to main',
  icon = <DefaultBackIcon />,
}: UiBackToMainProps): React.ReactElement {
  return (
    <Box component="section" sx={backToMainStyles.section}>
      <UiContainer>
        <UiButton
          disableRipple
          sx={backToMainStyles.backButton}
          to={to}
          aria-label={typeof label === 'string' ? label : undefined}
        >
          <Box sx={backToMainStyles.icon} aria-hidden="true">
            {icon}
          </Box>
          <UiTypography sx={backToMainStyles.backText} component="span">
            {label}
          </UiTypography>
        </UiButton>
      </UiContainer>
    </Box>
  );
}
