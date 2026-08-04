import Box from '@mui/material/Box';
import React from 'react';

import UiSkeletonBlock from '../ui-skeleton-block';

import {
  BAR_HEIGHT,
  BAR_RADIUS,
  CHIP_BAR_HEIGHT,
  CHIP_BAR_RADIUS,
  CHIP_BAR_WIDTH,
  CHIP_DOT_SIZE,
  DOT_RADIUS,
  STACKED_BAR_HEIGHT,
  STACKED_BAR_RADIUS,
  STACKED_LINES,
  chipDotStyles,
  getChipStyles,
  getKeys,
  stackedStyles,
} from './styles';
import type { SkeletonTableColumn } from './types';

interface SkeletonTableCellProps {
  column: SkeletonTableColumn;
}

interface ShapeProps {
  width: string;
}

/** Chip placeholder: a 5px dot and a 79x12.25 pill inside the 104x28 frame. */
function ChipShape({ width }: ShapeProps): React.ReactElement {
  return (
    <Box sx={getChipStyles(width)}>
      <UiSkeletonBlock
        width={CHIP_DOT_SIZE}
        height={CHIP_DOT_SIZE}
        borderRadius={DOT_RADIUS}
        sx={chipDotStyles}
      />
      <UiSkeletonBlock
        width={CHIP_BAR_WIDTH}
        height={CHIP_BAR_HEIGHT}
        borderRadius={CHIP_BAR_RADIUS}
      />
    </Box>
  );
}

/** Two 12.25px bars on a 17.5px pitch, the measured trailing text column. */
function StackedShape({ width }: ShapeProps): React.ReactElement {
  return (
    <Box sx={stackedStyles}>
      {getKeys('stacked-line', STACKED_LINES).map(key => (
        <UiSkeletonBlock
          key={key}
          width={width}
          height={STACKED_BAR_HEIGHT}
          borderRadius={STACKED_BAR_RADIUS}
        />
      ))}
    </Box>
  );
}

export default function SkeletonTableCell({ column }: SkeletonTableCellProps): React.ReactElement {
  const { kind, width } = column;

  if (kind === 'bar') {
    return <UiSkeletonBlock width={width} height={BAR_HEIGHT} borderRadius={BAR_RADIUS} />;
  }

  return kind === 'chip' ? <ChipShape width={width} /> : <StackedShape width={width} />;
}
