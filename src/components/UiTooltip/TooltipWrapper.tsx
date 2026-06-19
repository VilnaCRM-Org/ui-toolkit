import { ClickAwayListener, Tooltip, Typography, useMediaQuery } from '@mui/material';
import React from 'react';

import { UiTooltipProps } from './types';

export default function WrapperUiTooltip({
  title,
  placement,
  arrow,
  sx,
  children,
  triggerLabel,
}: UiTooltipProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const tooltipId: string = React.useId();
  const isWideScreenMaxWidth: boolean = useMediaQuery('(max-width: 640px)');
  const isWideScreenMinWidth: boolean = useMediaQuery('(min-width: 640px)');

  React.useEffect(() => {
    setOpen(false);
  }, [isWideScreenMaxWidth, isWideScreenMinWidth]);

  const closeTooltip: () => void = () => setOpen(false);
  const toggleTooltip: () => void = () => setOpen(prev => !prev);

  const handleKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTooltip();
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeTooltip();
    }
  };

  return (
    <ClickAwayListener onClickAway={closeTooltip}>
      <Tooltip id={tooltipId} open={open} title={title} placement={placement} arrow={arrow} sx={sx}>
        <Typography
          component="span"
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-controls={open ? tooltipId : undefined}
          aria-label={triggerLabel}
          onClick={toggleTooltip}
          onKeyDown={handleKeyDown}
        >
          {children}
        </Typography>
      </Tooltip>
    </ClickAwayListener>
  );
}
