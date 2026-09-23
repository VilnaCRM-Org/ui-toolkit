import type { SxProps, Theme, TooltipProps } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

type Style = SystemStyleObject<Theme>;
type TooltipSlotProps = NonNullable<TooltipProps['slotProps']>;
type SlotEntry = { sx?: SxProps<Theme> | undefined } & Record<string, unknown>;
type SlotValue = SlotEntry | ((ownerState: never) => SlotEntry) | undefined;

function buildTooltipStyles(theme: Theme): Style {
  return {
    fontFamily: fontFamilies.inter,
    color: theme.palette.darkPrimary.main,
    backgroundColor: theme.palette.white.main,
    borderRadius: '0.5rem',
    border: `1px solid ${theme.palette.grey400.main}`,
    maxWidth: '20.625rem',
    padding: '1.12rem 1.5rem',
    [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
      maxWidth: '16rem',
      padding: '0.5rem 0.75rem',
    },
  };
}

function buildArrowStyles(theme: Theme): Style {
  return { color: theme.palette.grey400.main };
}

export const tooltipStyles: (theme: Theme) => Style = cacheByTheme(buildTooltipStyles);

export const arrowStyles: (theme: Theme) => Style = cacheByTheme(buildArrowStyles);

export const triggerSx: SxProps<Theme> = {
  fontFamily: fontFamilies.inter,
  letterSpacing: 'inherit',
};

function sxList(sx: SxProps<Theme> | undefined): Style[] {
  if (sx === undefined) {
    return [];
  }
  return (Array.isArray(sx) ? sx : [sx]) as Style[];
}

function mergeEntry(style: Style, entry: SlotEntry | undefined): SlotEntry {
  return { ...entry, sx: [style, ...sxList(entry?.sx)] };
}

function mergeSlot(style: Style, slot: SlotValue): SlotValue {
  if (typeof slot === 'function') {
    return (ownerState: never): SlotEntry => mergeEntry(style, slot(ownerState));
  }
  return mergeEntry(style, slot);
}

export function tooltipSlotProps(
  theme: Theme,
  slotProps: TooltipSlotProps | undefined
): TooltipSlotProps {
  return {
    ...slotProps,
    tooltip: mergeSlot(tooltipStyles(theme), slotProps?.tooltip as SlotValue),
    arrow: mergeSlot(arrowStyles(theme), slotProps?.arrow as SlotValue),
  } as TooltipSlotProps;
}
