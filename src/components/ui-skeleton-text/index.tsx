import Box from '@mui/material/Box';
import React from 'react';

import { normalizeCount } from '../ui-skeletons';

import getTextSkeletonStyles, { getTextLinesContainerStyles, resolveTextSize } from './styles';
import SkeletonTextLines from './text-lines';
import type { SkeletonTextSize, UiSkeletonTextProps } from './types';

export default function UiSkeletonText({
  id,
  size,
  width = '100%',
  lines = 1,
  sx = [],
}: UiSkeletonTextProps): React.ReactElement {
  const lineCount: number = normalizeCount(lines, 1);
  const barSize: SkeletonTextSize = resolveTextSize(size, lineCount);

  if (lineCount > 1) {
    return (
      <Box
        id={id}
        aria-hidden="true"
        sx={[getTextLinesContainerStyles(width), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <SkeletonTextLines size={barSize} lines={lineCount} />
      </Box>
    );
  }

  return (
    <Box
      id={id}
      aria-hidden="true"
      sx={[getTextSkeletonStyles(barSize, width), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
