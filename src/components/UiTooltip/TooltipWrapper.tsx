import { ClickAwayListener, Tooltip, Typography, useMediaQuery } from '@mui/material';
import React from 'react';

import { UiTooltipProps } from './types';

type TooltipDisclosure = {
  open: boolean;
  tooltipId: string;
  closeTooltip: () => void;
  toggleTooltip: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void;
};

type KeyActionContext = {
  open: boolean;
  toggleTooltip: () => void;
  closeTooltip: () => void;
};

function resolveKeyAction(key: string, context: KeyActionContext): (() => void) | null {
  if (key === 'Enter' || key === ' ') {
    return context.toggleTooltip;
  }
  if (key === 'Escape' && context.open) {
    return context.closeTooltip;
  }
  return null;
}

function createKeyDownHandler(
  context: KeyActionContext
): (event: React.KeyboardEvent<HTMLSpanElement>) => void {
  return event => {
    const action: (() => void) | null = resolveKeyAction(event.key, context);

    if (action) {
      event.preventDefault();
      action();
    }
  };
}

function useTooltipDisclosure(): TooltipDisclosure {
  const [open, setOpen] = React.useState(false);
  const tooltipId: string = React.useId();
  const isWideScreenMaxWidth: boolean = useMediaQuery('(max-width: 640px)');
  const isWideScreenMinWidth: boolean = useMediaQuery('(min-width: 640px)');

  React.useEffect(() => {
    setOpen(false);
  }, [isWideScreenMaxWidth, isWideScreenMinWidth]);

  const closeTooltip: () => void = () => setOpen(false);
  const toggleTooltip: () => void = () => setOpen(prev => !prev);
  const handleKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void = createKeyDownHandler(
    { open, toggleTooltip, closeTooltip }
  );

  return { open, tooltipId, closeTooltip, toggleTooltip, handleKeyDown };
}

export default function WrapperUiTooltip({
  title,
  placement,
  arrow,
  sx,
  children,
  triggerLabel,
}: UiTooltipProps): React.ReactElement {
  const { open, tooltipId, closeTooltip, toggleTooltip, handleKeyDown } = useTooltipDisclosure();

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
