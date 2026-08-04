import { getSkeletonKeys } from '../ui-skeletons';

import type {
  SkeletonTaskColumn,
  SkeletonTaskRow,
  SkeletonWidgetCard,
  SkeletonWidgetColumns,
  SkeletonWidgetSize,
  SkeletonWidgetVariant,
} from './types';

// Board D widget cards, measured live from Figma file `xZ7ccrH6d4QyqLQsayFSEX`.
// The small task list (`538:38698`) is 376x410, the small block (`538:38709`)
// 374x410 and the small chart (`632:46278`) 375x410 — the same card drawn three
// times with +/-1px placement noise, so one 375x410 footprint covers all three.
export const SMALL_CARD: SkeletonWidgetCard = { width: 375, height: 410 };

// Medium single column card (`632:46350` inside `632:46444`).
export const MEDIUM_CARD: SkeletonWidgetCard = { width: 774, height: 410 };

// Medium two column card (`632:46447` inside `632:46446`): two 561-wide task
// columns, so the board grows in both axes rather than just reflowing.
export const MEDIUM_WIDE_CARD: SkeletonWidgetCard = { width: 1167, height: 540 };

/** Rows per column on every Board D task list (`538:39359` and siblings). */
export const DEFAULT_TASK_ROWS: number = 4;

/**
 * Two columns are a medium task-list-only layout: the block and chart bodies
 * have no repeated row, and the small card is too narrow for a second column.
 * Only the literal `2` opens the wide board, so an untyped caller passing
 * anything else still resolves to the single-column card.
 */
export function resolveColumnCount(
  size: SkeletonWidgetSize,
  variant: SkeletonWidgetVariant,
  columns: SkeletonWidgetColumns
): SkeletonWidgetColumns {
  if (size === 'medium' && variant === 'task-list') {
    return columns === 2 ? 2 : 1;
  }

  return 1;
}

/** Card footprint: the column count picks the wide medium board. */
export function getCardSize(
  size: SkeletonWidgetSize,
  columns: SkeletonWidgetColumns
): SkeletonWidgetCard {
  if (size === 'small') {
    return SMALL_CARD;
  }

  return columns === 2 ? MEDIUM_WIDE_CARD : MEDIUM_CARD;
}

function getTaskRowKeys(column: number, rows: number): SkeletonTaskRow[] {
  return getSkeletonKeys(`column-${column}-row`, rows).map(key => ({ key }));
}

/** `columns` identical task columns, each carrying `rows` row placeholders. */
export function getTaskColumns(columns: SkeletonWidgetColumns, rows: number): SkeletonTaskColumn[] {
  return getSkeletonKeys('column', columns).map((key, index) => ({
    key,
    rows: getTaskRowKeys(index + 1, rows),
  }));
}
