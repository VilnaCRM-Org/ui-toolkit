import { ClickAwayListener, Tooltip, Typography, useMediaQuery } from '@mui/material';
import React from 'react';

import { UiTooltipProps } from './types';

export default function WrapperUiTooltip({
  title,
  placement,
  arrow,
  sx,
  children,
}: UiTooltipProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const isWideScreenMaxWidth: boolean = useMediaQuery('(max-width: 640px)');
  const isWideScreenMinWidth: boolean = useMediaQuery('(min-width: 640px)');

  React.useEffect(() => {
    setOpen(false);
  }, [isWideScreenMaxWidth, isWideScreenMinWidth]);

  const closeTooltip: () => void = () => setOpen(false);
  const toggleTooltip: () => void = () => setOpen(!open);

  const handleKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTooltip();
    }
  };

  return (
    <ClickAwayListener onClickAway={closeTooltip}>
      <Tooltip open={open} title={title} placement={placement} arrow={arrow} sx={sx}>
        <Typography
          component="span"
          role="button"
          tabIndex={0}
          aria-expanded={open}
          onClick={toggleTooltip}
          onKeyDown={handleKeyDown}
        >
          {children}
        </Typography>
      </Tooltip>
    </ClickAwayListener>
  );
}
