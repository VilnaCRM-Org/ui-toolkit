import type React from 'react';

type TriggerDisclosure = {
  open: boolean;
  tooltipId: string;
  toggleTooltip: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void;
};

type TriggerProps = {
  role: 'button';
  tabIndex: number;
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
  'aria-label': string | undefined;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void;
};

export default function buildTriggerProps(
  disclosure: TriggerDisclosure,
  triggerLabel: string | undefined
): TriggerProps {
  return {
    role: 'button',
    tabIndex: 0,
    'aria-expanded': disclosure.open,
    'aria-controls': disclosure.open ? disclosure.tooltipId : undefined,
    'aria-label': triggerLabel,
    onClick: disclosure.toggleTooltip,
    onKeyDown: disclosure.handleKeyDown,
  };
}
