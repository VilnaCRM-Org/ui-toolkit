import Box from '@mui/material/Box';
import React from 'react';

import UiSkeletonImage from '../ui-skeleton-image';
import UiSkeletonText from '../ui-skeleton-text';

import { getTaskColumns } from './geometry';
import {
  AVATAR_SIZE,
  TASK_BARS,
  avatarStyles,
  getTaskBarStyles,
  getTaskColumnStyles,
  getTaskGridStyles,
  getTaskRowStyles,
  scrollThumbStyles,
  scrollTrackStyles,
  taskBodyStyles,
} from './task-styles';
import type { SkeletonTaskColumn, SkeletonWidgetColumns } from './types';

export interface TaskListBodyProps {
  rows: number;
  columns: SkeletonWidgetColumns;
}

interface TaskColumnProps {
  column: SkeletonTaskColumn;
  gapped: boolean;
}

/** 34x34 avatar disc plus the three ratio-placed text bars of one task row. */
function TaskRow({ gapped }: Readonly<{ gapped: boolean }>): React.ReactElement {
  return (
    <Box sx={getTaskRowStyles(gapped)}>
      <UiSkeletonImage variant="round" width={AVATAR_SIZE} height={AVATAR_SIZE} sx={avatarStyles} />
      {TASK_BARS.map(bar => (
        <UiSkeletonText
          key={bar.key}
          size={bar.size}
          width={bar.width}
          sx={getTaskBarStyles(bar)}
        />
      ))}
    </Box>
  );
}

function TaskColumn({ column, gapped }: Readonly<TaskColumnProps>): React.ReactElement {
  return (
    <Box sx={getTaskColumnStyles(gapped)}>
      {column.rows.map(row => (
        <TaskRow key={row.key} gapped={gapped} />
      ))}
    </Box>
  );
}

/** The 4px track with its 27.8% thumb that every task card parks on the right. */
function ScrollAffordance(): React.ReactElement {
  return (
    <Box sx={scrollTrackStyles}>
      <Box sx={scrollThumbStyles} />
    </Box>
  );
}

export default function TaskListBody({
  rows,
  columns,
}: Readonly<TaskListBodyProps>): React.ReactElement {
  const gapped: boolean = columns === 2;

  return (
    <Box sx={taskBodyStyles}>
      <Box sx={getTaskGridStyles(gapped)}>
        {getTaskColumns(columns, rows).map(column => (
          <TaskColumn key={column.key} column={column} gapped={gapped} />
        ))}
      </Box>
      <ScrollAffordance />
    </Box>
  );
}
