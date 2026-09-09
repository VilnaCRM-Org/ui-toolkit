import Box from '@mui/material/Box';
import React from 'react';

import UiSkeletonBlock from '../ui-skeleton-block';

import {
  BLOCK_STRIP_HEIGHT,
  CHART_BARS,
  CHART_STRIP_HEIGHT,
  PANEL_RADIUS,
  chartPlotStyles,
  getChartBarStyles,
  getPanelStyles,
  panelFillStyles,
  panelStripStyles,
} from './panel-styles';

export interface PanelBodyProps {
  chart: boolean;
}

/** Seven bottom-aligned bars in the recessed plot area (`632:46283`). */
function ChartPlot(): React.ReactElement {
  return (
    <Box sx={chartPlotStyles}>
      {CHART_BARS.map(bar => (
        <Box key={bar.key} sx={getChartBarStyles(bar.height)} />
      ))}
    </Box>
  );
}

function PanelFill({ chart }: Readonly<PanelBodyProps>): React.ReactElement {
  if (chart) {
    return <ChartPlot />;
  }

  return <UiSkeletonBlock height="auto" borderRadius={PANEL_RADIUS} sx={panelFillStyles} />;
}

/**
 * The block and chart bodies share one anatomy — a short strip over a tall
 * fill area — so they differ only in the strip height, the paddings and
 * whether the fill area is a solid block or the bar silhouette.
 */
export default function PanelBody({ chart }: Readonly<PanelBodyProps>): React.ReactElement {
  return (
    <Box sx={getPanelStyles(chart)}>
      <UiSkeletonBlock
        height={chart ? CHART_STRIP_HEIGHT : BLOCK_STRIP_HEIGHT}
        borderRadius={PANEL_RADIUS}
        sx={panelStripStyles}
      />
      <PanelFill chart={chart} />
    </Box>
  );
}
