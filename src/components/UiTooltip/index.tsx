import { ThemeProvider } from '@mui/material';
import React from 'react';

import theme from './theme';
import WrapperUiTooltip from './TooltipWrapper';
import { UiTooltipProps } from './types';

function UiTooltip({
  title,
  placement,
  arrow,
  sx,
  children,
  triggerLabel,
}: UiTooltipProps): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <WrapperUiTooltip
        title={title}
        placement={placement}
        arrow={arrow}
        sx={sx}
        triggerLabel={triggerLabel}
      >
        {children}
      </WrapperUiTooltip>
    </ThemeProvider>
  );
}

export default UiTooltip;
