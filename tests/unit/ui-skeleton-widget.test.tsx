import { render, screen } from '@testing-library/react';
import React from 'react';

import UiSkeletonWidget from '../../src/components/ui-skeleton-widget';
import {
  DEFAULT_TASK_ROWS,
  MEDIUM_CARD,
  MEDIUM_WIDE_CARD,
  SMALL_CARD,
  getCardSize,
  getTaskColumns,
  resolveColumnCount,
} from '../../src/components/ui-skeleton-widget/geometry';
import {
  CHART_BARS,
  CHART_BAR_RADIUS,
  CHART_STRIP_HEIGHT,
  getChartBarStyles,
  getPanelStyles,
} from '../../src/components/ui-skeleton-widget/panel-styles';
import {
  HEADER_DOT_KEYS,
  HEADER_DOT_SIZE,
  getCardStyles,
  headerDotStyles,
  titleBarStyles,
  widgetContentStyles,
} from '../../src/components/ui-skeleton-widget/styles';
import {
  SCROLLBAR_WIDTH,
  SCROLL_THUMB_HEIGHT,
  TASK_BARS,
  TASK_ROW_HEIGHT,
  getTaskBarStyles,
  getTaskColumnStyles,
  getTaskGridStyles,
  getTaskRowStyles,
} from '../../src/components/ui-skeleton-widget/task-styles';
import type { SkeletonWidgetColumns } from '../../src/components/ui-skeleton-widget/types';
import { DEFAULT_LOADING_TEXT, baseSkeletonStyle } from '../../src/components/ui-skeletons';

const WIDGET_ROLES: string[] = [
  'button',
  'link',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'list',
  'listitem',
  'table',
  'heading',
  'banner',
  'region',
  'status',
];

// The column prop is a 1 | 2 union, so an untyped consumer is the only way a
// value outside it reaches the builder; the cast reproduces exactly that.
const asColumns = (columns: number): SkeletonWidgetColumns => columns as SkeletonWidgetColumns;

const getRoot = (): HTMLElement => screen.getByRole('generic', { busy: true });

const getShapeTree = (): HTMLElement => {
  const hidden: HTMLElement | undefined = screen
    .getAllByRole('generic', { hidden: true })
    .find(element => element.getAttribute('aria-hidden') === 'true');
  if (!hidden) throw new Error('skeleton widget rendered no aria-hidden shape tree');
  return hidden;
};

const shapesWithHeight = (height: string): HTMLElement[] =>
  screen
    .getAllByRole('generic', { hidden: true })
    .filter(element => window.getComputedStyle(element).height === height);

const chartBarHeights = (): string[] =>
  screen
    .getAllByRole('generic', { hidden: true })
    .map(element => window.getComputedStyle(element).height)
    .filter(height => CHART_BARS.some(bar => `${bar.height}px` === height));

describe('UiSkeletonWidget measured geometry', () => {
  it('carries the three Board D card footprints', () => {
    expect(SMALL_CARD).toEqual({ width: 375, height: 410 });
    expect(MEDIUM_CARD).toEqual({ width: 774, height: 410 });
    expect(MEDIUM_WIDE_CARD).toEqual({ width: 1167, height: 540 });
    expect(DEFAULT_TASK_ROWS).toBe(4);
  });

  it('places the task bars on one ratio recipe shared by every row width', () => {
    expect(TASK_BARS).toEqual([
      { key: 'primary', size: 'm', width: '81.99%', left: '15.05%', top: '14px' },
      { key: 'secondary', size: 'm', width: '65.32%', left: '15.05%', top: '36px' },
      { key: 'meta', size: 's', width: '25.81%', left: '16.13%', top: '65px' },
    ]);
    expect(TASK_ROW_HEIGHT).toBe('94px');
  });

  it('carries the seven measured chart bar heights in board order', () => {
    expect(CHART_BARS).toEqual([
      { key: 'bar-1', height: 35.03 },
      { key: 'bar-2', height: 46.36 },
      { key: 'bar-3', height: 40.18 },
      { key: 'bar-4', height: 111.26 },
      { key: 'bar-5', height: 159.67 },
      { key: 'bar-6', height: 79.32 },
      { key: 'bar-7', height: 107.14 },
    ]);
  });

  it('draws exactly three header dots', () => {
    expect(HEADER_DOT_KEYS).toEqual(['dot-1', 'dot-2', 'dot-3']);
  });
});

describe('resolveColumnCount', () => {
  it('keeps two columns only for the medium task list', () => {
    expect(resolveColumnCount('medium', 'task-list', 2)).toBe(2);
    expect(resolveColumnCount('medium', 'task-list', 1)).toBe(1);
  });

  it('collapses every other combination to a single column', () => {
    expect(resolveColumnCount('small', 'task-list', 2)).toBe(1);
    expect(resolveColumnCount('medium', 'block', 2)).toBe(1);
    expect(resolveColumnCount('medium', 'chart', 2)).toBe(1);
  });

  it('collapses a count outside the union to the single column board', () => {
    expect(resolveColumnCount('medium', 'task-list', asColumns(Number.NaN))).toBe(1);
    expect(resolveColumnCount('medium', 'task-list', asColumns(Number.POSITIVE_INFINITY))).toBe(1);
    expect(resolveColumnCount('medium', 'task-list', asColumns(2.5))).toBe(1);
  });
});

describe('getCardSize', () => {
  it('ignores the column count at the small size', () => {
    expect(getCardSize('small', 1)).toEqual(SMALL_CARD);
    expect(getCardSize('small', 2)).toEqual(SMALL_CARD);
  });

  it('widens and heightens the medium card for the two column board', () => {
    expect(getCardSize('medium', 1)).toEqual(MEDIUM_CARD);
    expect(getCardSize('medium', 2)).toEqual(MEDIUM_WIDE_CARD);
  });
});

describe('getTaskColumns', () => {
  it('builds one uniquely keyed row per column', () => {
    expect(getTaskColumns(1, 2)).toEqual([
      { key: 'column-1', rows: [{ key: 'column-1-row-1' }, { key: 'column-1-row-2' }] },
    ]);
  });

  it('repeats the row count across both columns without key collisions', () => {
    const columns = getTaskColumns(2, 1);
    expect(columns).toEqual([
      { key: 'column-1', rows: [{ key: 'column-1-row-1' }] },
      { key: 'column-2', rows: [{ key: 'column-2-row-1' }] },
    ]);
  });

  it('collapses to an empty column when no rows are requested', () => {
    expect(getTaskColumns(1, 0)).toEqual([{ key: 'column-1', rows: [] }]);
  });
});

describe('UiSkeletonWidget style builders', () => {
  it('builds the card shell with the forced-colours fallback border', () => {
    expect(getCardStyles(SMALL_CARD)).toEqual({
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '375px',
      height: '410px',
      border: '1px solid #E1E7EA',
      borderRadius: '12px',
      backgroundColor: '#F9FAFC',
      '@media (forced-colors: active)': { border: '1px solid CanvasText' },
    });
  });

  it('divides flush rows with a hairline and gapped rows with a tinted tile', () => {
    expect(getTaskRowStyles(false)).toEqual({
      position: 'relative',
      flexShrink: 0,
      height: '94px',
      borderRadius: 0,
      backgroundColor: 'transparent',
      borderBottom: '1px solid #E1E7EA',
    });
    expect(getTaskRowStyles(true)).toEqual({
      position: 'relative',
      flexShrink: 0,
      height: '94px',
      borderRadius: '8px',
      backgroundColor: 'rgba(231, 235, 240, 0.21)',
      borderBottom: 'none',
    });
  });

  it('gaps the rows of a column only on the two column board', () => {
    const column = { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 };
    expect(getTaskColumnStyles(false)).toEqual({ ...column, gap: 0 });
    expect(getTaskColumnStyles(true)).toEqual({ ...column, gap: '14px' });
  });

  it('pads and gaps the task grid only on the two column board', () => {
    const grid = {
      display: 'flex',
      flex: 1,
      minWidth: 0,
      boxSizing: 'border-box',
      overflow: 'hidden',
    };
    expect(getTaskGridStyles(false)).toEqual({ ...grid, gap: 0, padding: 0 });
    expect(getTaskGridStyles(true)).toEqual({
      ...grid,
      gap: '12px',
      padding: '26px 13px 0 16px',
    });
  });

  it('pins each task bar at its measured offset', () => {
    expect(getTaskBarStyles(TASK_BARS[0])).toEqual({
      position: 'absolute',
      left: '15.05%',
      top: '14px',
    });
  });

  it('switches the panel paddings between the block and chart bodies', () => {
    const panel = {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      boxSizing: 'border-box',
    };
    expect(getPanelStyles(false)).toEqual({
      ...panel,
      padding: '10px 4.8% 22px',
      gap: '10px',
    });
    expect(getPanelStyles(true)).toEqual({
      ...panel,
      padding: '11.75px 4.8% 10.3px',
      gap: '10.3px',
    });
  });

  it('paints chart bars with the shared shimmer and 3px top corners', () => {
    expect(getChartBarStyles(35.03)).toEqual({
      ...baseSkeletonStyle,
      flex: 1,
      minWidth: 0,
      height: '35.03px',
      borderRadius: CHART_BAR_RADIUS,
    });
  });

  it('repaints the header dots in Contrast Themes, where the fill is dropped', () => {
    expect(headerDotStyles).toEqual({
      width: HEADER_DOT_SIZE,
      height: HEADER_DOT_SIZE,
      borderRadius: '50%',
      backgroundColor: '#969B9D',
      '@media (forced-colors: active)': { backgroundColor: 'GrayText' },
    });
  });

  it('lets the title bar shrink so a narrow host never clips the dots', () => {
    expect(titleBarStyles).toEqual({ flexShrink: 1, minWidth: 0 });
  });

  it('stacks the header above the body inside the hidden shape tree', () => {
    expect(widgetContentStyles).toEqual({
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    });
  });
});

describe('UiSkeletonWidget rendering', () => {
  it('defaults to the small 375x410 task list card', () => {
    render(<UiSkeletonWidget />);
    expect(getRoot()).toHaveStyle({ width: '100%', maxWidth: '375px', height: '410px' });
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(DEFAULT_TASK_ROWS);
  });

  it('renders one avatar and three bars inside every task row', () => {
    render(<UiSkeletonWidget rows={2} />);
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(2);
    expect(shapesWithHeight('34px')).toHaveLength(2);
    expect(shapesWithHeight('12px')).toHaveLength(4);
    expect(shapesWithHeight('8px')).toHaveLength(2);
  });

  it('parks the 4px scroll affordance beside the task grid', () => {
    render(<UiSkeletonWidget />);
    const thumbs: HTMLElement[] = shapesWithHeight(SCROLL_THUMB_HEIGHT);
    expect(thumbs).toHaveLength(1);
    expect(thumbs[0]).toHaveStyle({ width: '100%' });
    expect(shapesWithHeight('410px')).toHaveLength(1);
    expect(screen.getAllByRole('generic', { hidden: true })).not.toHaveLength(0);
    expect(SCROLLBAR_WIDTH).toBe('4px');
  });

  it('honours the rows override per column', () => {
    render(<UiSkeletonWidget rows={6} />);
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(6);
  });

  it('widens to 774x410 at the medium size', () => {
    render(<UiSkeletonWidget size="medium" />);
    expect(getRoot()).toHaveStyle({ maxWidth: '774px', height: '410px' });
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(DEFAULT_TASK_ROWS);
  });

  it('draws two gapped columns on the 1167x540 board', () => {
    render(<UiSkeletonWidget size="medium" columns={2} rows={3} />);
    expect(getRoot()).toHaveStyle({ maxWidth: '1167px', height: '540px' });
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(6);
  });

  it('ignores the column override outside the medium task list', () => {
    render(<UiSkeletonWidget columns={2} rows={3} />);
    expect(getRoot()).toHaveStyle({ maxWidth: '375px' });
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(3);
  });

  it('renders the block variant as a strip over a filled block', () => {
    render(<UiSkeletonWidget variant="block" />);
    expect(shapesWithHeight('50px')).toHaveLength(1);
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(0);
    expect(chartBarHeights()).toEqual([]);
  });

  it('renders the chart variant as a strip over seven bottom aligned bars', () => {
    render(<UiSkeletonWidget size="medium" variant="chart" />);
    expect(shapesWithHeight(CHART_STRIP_HEIGHT)).toHaveLength(1);
    expect(chartBarHeights()).toEqual(CHART_BARS.map(bar => `${bar.height}px`));
    expect(getRoot()).toHaveStyle({ maxWidth: '774px' });
  });

  it('keeps the header title bar and its three dots on every variant', () => {
    render(<UiSkeletonWidget variant="chart" />);
    expect(shapesWithHeight('18px')).toHaveLength(1);
    expect(shapesWithHeight(HEADER_DOT_SIZE)).toHaveLength(HEADER_DOT_KEYS.length);
    expect(shapesWithHeight('48px')).toHaveLength(1);
  });

  it('keeps the title bar at its measured width while allowing it to shrink', () => {
    render(<UiSkeletonWidget />);
    const title: HTMLElement[] = shapesWithHeight('18px');
    expect(title).toHaveLength(1);
    expect(title[0]).toHaveStyle({ width: '147px', flexShrink: 1, minWidth: '0' });
  });

  it('falls back to the four design rows for a non-finite row count', () => {
    render(<UiSkeletonWidget rows={Number.POSITIVE_INFINITY} />);
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(DEFAULT_TASK_ROWS);
  });

  it('floors a fractional row count and clamps a negative one to none', () => {
    render(<UiSkeletonWidget rows={3.6} />);
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(3);
  });

  it('renders no task row for a negative row count', () => {
    render(<UiSkeletonWidget rows={-5} />);
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(0);
  });

  it('keeps the single column card when the column count is outside the union', () => {
    render(<UiSkeletonWidget size="medium" columns={asColumns(Number.NaN)} rows={1} />);
    expect(getRoot()).toHaveStyle({ maxWidth: '774px' });
    expect(shapesWithHeight(TASK_ROW_HEIGHT)).toHaveLength(1);
  });

  it('exposes a busy, role-less, unnamed container with hidden status text', () => {
    render(<UiSkeletonWidget />);
    const root: HTMLElement = getRoot();
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).toBeInTheDocument();
    expect(getShapeTree()).toHaveAttribute('aria-hidden', 'true');
    expect(getShapeTree()).toHaveStyle({ display: 'flex', flexDirection: 'column' });
  });

  it('forwards a custom loading text', () => {
    render(<UiSkeletonWidget loadingText="Loading widget" />);
    expect(screen.getByText('Loading widget')).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LOADING_TEXT)).not.toBeInTheDocument();
  });

  it('exposes no landmark, heading, widget or focusable semantics', () => {
    render(<UiSkeletonWidget size="medium" columns={2} />);
    WIDGET_ROLES.forEach(role => {
      expect(screen.queryAllByRole(role, { hidden: true })).toHaveLength(0);
    });
  });

  it('applies id and merges sx in object form', () => {
    render(<UiSkeletonWidget id="widget-a" sx={{ maxWidth: '300px' }} />);
    const root: HTMLElement = getRoot();
    expect(root).toHaveAttribute('id', 'widget-a');
    expect(root).toHaveStyle({ maxWidth: '300px', width: '100%' });
  });

  it('applies sx in array form', () => {
    render(<UiSkeletonWidget sx={[{ padding: '4px' }, { margin: '2px' }]} />);
    expect(getRoot()).toHaveStyle({ padding: '4px', margin: '2px' });
  });
});
