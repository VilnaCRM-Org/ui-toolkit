import { Box, SxProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import React from 'react';

import UiButton from '../UiButton';
import UiContainer from '../UiContainer';
import UiTypography from '../UiTypography';

import getBackToMainStyles from './styles';

type UiBackToMainProps = {
  to?: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
};

function DefaultBackIcon(): React.ReactElement {
  return (
    <span aria-hidden="true" style={{ fontSize: '1rem', lineHeight: 1 }}>
      ←
    </span>
  );
}

export default function UiBackToMain({
  to = '/',
  label = 'Back to main',
  icon = <DefaultBackIcon />,
}: UiBackToMainProps): React.ReactElement {
  const theme: Theme = useTheme();
  const styles: Record<string, SxProps<Theme>> = getBackToMainStyles(theme);

  return (
    <Box component="section" sx={styles.section}>
      <UiContainer>
        <UiButton
          disableRipple
          sx={styles.backButton}
          to={to}
          aria-label={typeof label === 'string' ? label : undefined}
        >
          <Box sx={styles.icon}>{icon}</Box>
          <UiTypography sx={styles.backText} component="span">
            {label}
          </UiTypography>
        </UiButton>
      </UiContainer>
    </Box>
  );
}
