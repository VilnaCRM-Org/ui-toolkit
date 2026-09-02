import Box from '@mui/material/Box';
import React from 'react';

import getTextSkeletonStyles, { getTextLines } from './styles';
import type { SkeletonTextSize } from './types';

export interface SkeletonTextLinesProps {
  size: SkeletonTextSize;
  lines: number;
}

export default function SkeletonTextLines({
  size,
  lines,
}: SkeletonTextLinesProps): React.ReactElement {
  return (
    <>
      {getTextLines(lines).map(line => (
        <Box key={line.key} sx={getTextSkeletonStyles(size, line.width)} />
      ))}
    </>
  );
}
