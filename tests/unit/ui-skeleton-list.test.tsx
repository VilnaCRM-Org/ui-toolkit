import { render, screen } from '@testing-library/react';
import React from 'react';

import UiSkeletonList from '../../src/components/ui-skeleton-list';
import {
  DEFAULT_LIST_ROWS,
  LIST_ROW_GAP,
  LIST_ROW_HEIGHT,
  LIST_ROW_PITCH,
  LIST_ROW_RADIUS,
  LIST_ROW_WIDTH,
  listContentStyles,
  listRootStyles,
} from '../../src/components/ui-skeleton-list/styles';
import { DEFAULT_LOADING_TEXT, getSkeletonKeys } from '../../src/components/ui-skeletons';

const WIDGET_ROLES: string[] = ['list', 'listitem', 'button', 'link', 'checkbox', 'radio'];

const getRoot = (): HTMLElement => screen.getByRole('generic', { busy: true });

const getShapeTree = (): HTMLElement => {
  const hidden: HTMLElement | undefined = screen
    .getAllByRole('generic', { hidden: true })
    .find(element => element.getAttribute('aria-hidden') === 'true');
  if (!hidden) throw new Error('skeleton list rendered no aria-hidden shape tree');
  return hidden;
};

const getRowShapes = (): HTMLElement[] =>
  screen
    .getAllByRole('generic', { hidden: true })
    .filter(element => window.getComputedStyle(element).height === LIST_ROW_HEIGHT);

describe('UiSkeletonList geometry constants', () => {
  it('carries the measured Board D row box', () => {
    expect(LIST_ROW_WIDTH).toBe(590);
    expect(LIST_ROW_HEIGHT).toBe('64px');
    expect(LIST_ROW_RADIUS).toBe('8px');
    expect(LIST_ROW_GAP).toBe('6px');
    expect(DEFAULT_LIST_ROWS).toBe(3);
  });

  it('keeps the 70px row pitch as height plus gap', () => {
    expect(LIST_ROW_PITCH).toBe(70);
    expect(parseInt(LIST_ROW_HEIGHT, 10) + parseInt(LIST_ROW_GAP, 10)).toBe(LIST_ROW_PITCH);
  });

  it('caps the column at the board width while staying fluid', () => {
    expect(listRootStyles).toEqual({ width: '100%', maxWidth: '590px' });
    expect(listContentStyles).toEqual({
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    });
  });
});

describe('list row keys', () => {
  it('builds one unique, 1-based key per requested row', () => {
    expect(getSkeletonKeys('row', DEFAULT_LIST_ROWS)).toEqual(['row-1', 'row-2', 'row-3']);
  });

  it('scales with the requested count and collapses to nothing at zero', () => {
    expect(getSkeletonKeys('row', 5)).toHaveLength(5);
    expect(getSkeletonKeys('row', 5)[4]).toBe('row-5');
    expect(getSkeletonKeys('row', 0)).toEqual([]);
  });
});

describe('UiSkeletonList', () => {
  it('renders three identical row shapes by default', () => {
    render(<UiSkeletonList />);
    const rows: HTMLElement[] = getRowShapes();
    expect(rows).toHaveLength(DEFAULT_LIST_ROWS);
    rows.forEach(row => {
      expect(row).toHaveStyle({
        height: LIST_ROW_HEIGHT,
        width: '100%',
        borderRadius: LIST_ROW_RADIUS,
      });
    });
  });

  it('honours the rows override', () => {
    render(<UiSkeletonList rows={5} />);
    expect(getRowShapes()).toHaveLength(5);
  });

  it('renders no rows when asked for none', () => {
    render(<UiSkeletonList rows={0} />);
    expect(screen.queryAllByRole('generic', { hidden: true }).length).toBeGreaterThan(0);
    expect(getRowShapes()).toHaveLength(0);
  });

  it('falls back to the design row count for a non-finite request', () => {
    render(<UiSkeletonList rows={Number.POSITIVE_INFINITY} />);
    expect(getRowShapes()).toHaveLength(DEFAULT_LIST_ROWS);
  });

  it('floors a fractional row count and clamps a negative one', () => {
    render(<UiSkeletonList rows={4.8} />);
    expect(getRowShapes()).toHaveLength(4);
  });

  it('renders no rows for a negative request', () => {
    render(<UiSkeletonList rows={-2} />);
    expect(getRowShapes()).toHaveLength(0);
  });

  it('stacks the rows on the measured 6px gap', () => {
    render(<UiSkeletonList />);
    expect(getShapeTree()).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      gap: LIST_ROW_GAP,
    });
  });

  it('caps the root at the 590px board width', () => {
    render(<UiSkeletonList />);
    expect(getRoot()).toHaveStyle({ width: '100%', maxWidth: `${LIST_ROW_WIDTH}px` });
  });

  it('inherits the shared shimmer on every row', () => {
    render(<UiSkeletonList />);
    getRowShapes().forEach(row => {
      expect(row).toHaveStyle({ backgroundSize: '200% 100%' });
    });
  });

  it('exposes a busy, role-less, unnamed container with hidden status text', () => {
    render(<UiSkeletonList />);
    const root: HTMLElement = getRoot();
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).toBeInTheDocument();
    expect(getShapeTree()).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards a custom loading text', () => {
    render(<UiSkeletonList loadingText="Loading rows" />);
    expect(screen.getByText('Loading rows')).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LOADING_TEXT)).not.toBeInTheDocument();
  });

  it('exposes no widget or list semantics and nothing focusable', () => {
    render(<UiSkeletonList />);
    WIDGET_ROLES.forEach(role => {
      expect(screen.queryAllByRole(role, { hidden: true })).toHaveLength(0);
    });
  });

  it('applies id and merges sx in object form', () => {
    render(<UiSkeletonList id="list-a" sx={{ maxWidth: '300px' }} />);
    const root: HTMLElement = getRoot();
    expect(root).toHaveAttribute('id', 'list-a');
    expect(root).toHaveStyle({ maxWidth: '300px', width: '100%' });
  });

  it('applies sx in array form', () => {
    render(<UiSkeletonList sx={[{ padding: '4px' }, { margin: '2px' }]} />);
    expect(getRoot()).toHaveStyle({ padding: '4px', margin: '2px' });
  });
});
