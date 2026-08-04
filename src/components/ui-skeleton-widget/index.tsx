import React from 'react';

import { ComposedSkeleton, normalizeCount } from '../ui-skeletons';

import { DEFAULT_TASK_ROWS, getCardSize, resolveColumnCount } from './geometry';
import PanelBody from './panel-body';
import { getCardStyles, widgetContentStyles } from './styles';
import TaskListBody from './task-list-body';
import type { SkeletonWidgetColumns, UiSkeletonWidgetProps } from './types';
import WidgetHeader from './widget-header';

/**
 * Board D composed widget card: the shared 48px header over a task list, a
 * block fill or a bar chart, wrapped in the busy skeleton shell. Every shape
 * is decorative — the card carries no landmark, heading, widget role or
 * focusable content, and the shell owns the visually hidden status text.
 */
export default function UiSkeletonWidget({
  id,
  size = 'small',
  variant = 'task-list',
  rows = DEFAULT_TASK_ROWS,
  columns = 1,
  loadingText,
  sx = [],
}: UiSkeletonWidgetProps): React.ReactElement {
  const resolved: SkeletonWidgetColumns = resolveColumnCount(size, variant, columns);

  return (
    <ComposedSkeleton
      id={id}
      loadingText={loadingText}
      sx={[getCardStyles(getCardSize(size, resolved)), ...(Array.isArray(sx) ? sx : [sx])]}
      contentSx={widgetContentStyles}
    >
      <WidgetHeader />
      {variant === 'task-list' ? (
        <TaskListBody rows={normalizeCount(rows, DEFAULT_TASK_ROWS)} columns={resolved} />
      ) : (
        <PanelBody chart={variant === 'chart'} />
      )}
    </ComposedSkeleton>
  );
}
