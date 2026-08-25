import React from 'react';

import ScopedThemeProvider from '../theme-scope';

import theme from './theme';
import WrapperUiTooltip from './tooltip-wrapper';
import type { UiTooltipProps } from './types';

function UiTooltip({
  title,
  placement,
  arrow,
  sx,
  children,
  triggerLabel,
}: UiTooltipProps): React.ReactElement {
  return (
    <ScopedThemeProvider theme={theme}>
      <WrapperUiTooltip
        title={title}
        placement={placement}
        arrow={arrow}
        sx={sx}
        triggerLabel={triggerLabel}
      >
        {children}
      </WrapperUiTooltip>
    </ScopedThemeProvider>
  );
}

export default UiTooltip;
