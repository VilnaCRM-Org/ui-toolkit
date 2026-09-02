import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { baseSkeletonStyle } from '../ui-skeletons';

import type { SkeletonChartBar } from './types';

/** Block/chart panels: an 8px-radius strip over an 8px-radius fill area. */
export const PANEL_RADIUS: string = '8px';
const BLOCK_PANEL_PADDING: string = '10px 4.8% 22px';
const BLOCK_PANEL_GAP: string = '10px';
export const BLOCK_STRIP_HEIGHT: string = '50px';
const CHART_PANEL_PADDING: string = '11.75px 4.8% 10.3px';
const CHART_PANEL_GAP: string = '10.3px';
export const CHART_STRIP_HEIGHT: string = '51.5px';

// Chart plot (`632:46283`): a faint recessed panel holding 7 bottom-aligned
// bars, each 47.29 wide on a 1px gap with 3px top corners, floated 8.24px off
// the plot floor. The bars are `flex: 1`, so the 2px of unused track becomes
// the plot's right padding and the widths stay exact at the board size.
const CHART_PLOT_BACKGROUND: string = 'rgba(229, 233, 238, 0.29)';
const CHART_PLOT_PADDING: string = '0 2px 8.24px 0';
const CHART_BAR_GAP: string = '1px';
export const CHART_BAR_RADIUS: string = '3px 3px 0 0';
export const CHART_BARS: SkeletonChartBar[] = [
  { key: 'bar-1', height: 35.03 },
  { key: 'bar-2', height: 46.36 },
  { key: 'bar-3', height: 40.18 },
  { key: 'bar-4', height: 111.26 },
  { key: 'bar-5', height: 159.67 },
  { key: 'bar-6', height: 79.32 },
  { key: 'bar-7', height: 107.14 },
];

export const panelStripStyles: SystemStyleObject<Theme> = { flexShrink: 0 };

export const panelFillStyles: SystemStyleObject<Theme> = { flex: 1, minHeight: 0 };

export const chartPlotStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  alignItems: 'flex-end',
  flex: 1,
  minHeight: 0,
  boxSizing: 'border-box',
  gap: CHART_BAR_GAP,
  padding: CHART_PLOT_PADDING,
  borderRadius: PANEL_RADIUS,
  backgroundColor: CHART_PLOT_BACKGROUND,
};

export function getPanelStyles(chart: boolean): SystemStyleObject<Theme> {
  return {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    boxSizing: 'border-box',
    padding: chart ? CHART_PANEL_PADDING : BLOCK_PANEL_PADDING,
    gap: chart ? CHART_PANEL_GAP : BLOCK_PANEL_GAP,
  };
}

export function getChartBarStyles(height: number): SystemStyleObject<Theme> {
  return {
    ...baseSkeletonStyle,
    flex: 1,
    minWidth: 0,
    height: `${height}px`,
    borderRadius: CHART_BAR_RADIUS,
  };
}
