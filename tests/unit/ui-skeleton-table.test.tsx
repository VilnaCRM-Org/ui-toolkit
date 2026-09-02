import { render, screen } from '@testing-library/react';
import React from 'react';

import UiSkeletonTable from '../../src/components/ui-skeleton-table';
import {
  DEFAULT_COLUMNS,
  DEFAULT_ROWS,
  TABLE_COLUMNS,
  bodyRowStyles,
  bodyStyles,
  chipDotStyles,
  contentStyles,
  getCellStyles,
  getChipStyles,
  getColumnSlots,
  getHeaderSlots,
  getRootStyles,
  getTableWidth,
  glyphStyles,
  headerRowStyles,
  stackedStyles,
} from '../../src/components/ui-skeleton-table/styles';
import { DEFAULT_LOADING_TEXT } from '../../src/components/ui-skeletons';

import firstOf from './utils/first-of';

// Shapes per body row at the design column set: three bars, the chip's dot and
// pill, the two stacked bars and the three glyph dots.
const SHAPES_PER_ROW: number = 10;

const getRoot = (): HTMLElement => screen.getByRole('generic', { busy: true });

// Every primitive shape (and the composed shell's tree wrapper) carries
// aria-hidden; the plain layout boxes in between do not.
const getHiddenBoxes = (): HTMLElement[] =>
  screen
    .getAllByRole('generic', { hidden: true })
    .filter(element => element.getAttribute('aria-hidden') === 'true');

const getShapes = (): HTMLElement[] => getHiddenBoxes().slice(1);

const TABLE_ROLES: string[] = [
  'table',
  'grid',
  'treegrid',
  'row',
  'rowgroup',
  'cell',
  'gridcell',
  'columnheader',
  'rowheader',
];

const STRUCTURAL_ROLES: string[] = [
  'button',
  'link',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'heading',
  'banner',
  'main',
  'navigation',
  'region',
  'status',
];

describe('UiSkeletonTable — measured Board D anatomy', () => {
  it('defaults to the ten rows and five columns measured on node 538:40309', () => {
    expect(DEFAULT_ROWS).toBe(10);
    expect(DEFAULT_COLUMNS).toBe(5);

    render(<UiSkeletonTable />);

    expect(getShapes()).toHaveLength(DEFAULT_COLUMNS + DEFAULT_ROWS * SHAPES_PER_ROW);
    expect(getShapes()).toHaveLength(105);
  });

  it('renders one uniform 63x14 header bar per column', () => {
    render(<UiSkeletonTable />);

    const header: HTMLElement[] = getShapes().slice(0, DEFAULT_COLUMNS);

    expect(header).toHaveLength(5);
    header.forEach(bar => {
      expect(bar).toHaveStyle({ width: '63px', height: '14px', borderRadius: '20px' });
    });
  });

  it('renders the measured body-row shapes in column order', () => {
    render(<UiSkeletonTable />);

    const row: HTMLElement[] = getShapes().slice(DEFAULT_COLUMNS, DEFAULT_COLUMNS + SHAPES_PER_ROW);

    expect(row[0]).toHaveStyle({ width: '190px', height: '14px', borderRadius: '20px' });
    expect(row[1]).toHaveStyle({ width: '136px', height: '14px' });
    expect(row[2]).toHaveStyle({ width: '63px', height: '14px' });
    expect(row[3]).toHaveStyle({ width: '5px', height: '5px', borderRadius: '50%' });
    expect(row[4]).toHaveStyle({ width: '79px', height: '12.25px', borderRadius: '6.125px' });
    expect(row[5]).toHaveStyle({ width: '280px', height: '12.25px', borderRadius: '17.5px' });
    expect(row[6]).toHaveStyle({ width: '280px', height: '12.25px', borderRadius: '17.5px' });
    row.slice(7).forEach(dot => {
      expect(dot).toHaveStyle({ width: '4px', height: '4px', borderRadius: '50%' });
    });
  });

  it('repeats the identical shape sequence on every following row', () => {
    render(<UiSkeletonTable />);

    const shapes: HTMLElement[] = getShapes();

    expect(shapes[DEFAULT_COLUMNS + SHAPES_PER_ROW]).toHaveStyle({ width: '190px' });
    expect(shapes[DEFAULT_COLUMNS + SHAPES_PER_ROW * 9]).toHaveStyle({ width: '190px' });
    expect(shapes[shapes.length - 1]).toHaveStyle({ width: '4px' });
  });
});

describe('UiSkeletonTable — row and column overrides', () => {
  it('drops every body row when rows is zero, keeping the header strip', () => {
    render(<UiSkeletonTable rows={0} />);

    expect(getShapes()).toHaveLength(DEFAULT_COLUMNS);
  });

  it('cycles the measured width pattern past the five design columns', () => {
    render(<UiSkeletonTable rows={2} columns={7} />);

    const shapes: HTMLElement[] = getShapes();

    expect(shapes).toHaveLength(31);
    shapes.slice(0, 7).forEach(bar => {
      expect(bar).toHaveStyle({ width: '63px', height: '14px' });
    });
    expect(shapes[14]).toHaveStyle({ width: '190px' });
    expect(shapes[15]).toHaveStyle({ width: '136px' });
    expect(shapes[19]).toHaveStyle({ width: '190px' });
  });

  it('narrows to a single column when asked', () => {
    render(<UiSkeletonTable rows={1} columns={1} />);

    // One header bar, one 190px body bar and the three glyph dots.
    expect(getShapes()).toHaveLength(5);
    expect(getShapes()[1]).toHaveStyle({ width: '190px' });
  });
});

describe('UiSkeletonTable — width derived from the requested columns', () => {
  // The tracks the count cycles through, plus the 42/16 row padding and the
  // 24px glyph lane: the five design columns land on the measured 1166px.
  const CHROME: number = 42 + 16 + 24;

  it('derives the measured 1166px board width from the five design columns', () => {
    expect(getTableWidth(DEFAULT_COLUMNS)).toBe(1166);
    expect(TABLE_COLUMNS.reduce((total, column) => total + column.track, CHROME)).toBe(1166);
    expect(getRootStyles(DEFAULT_COLUMNS)).toEqual({ width: '100%', maxWidth: '1166px' });
  });

  it('extends the width by the extra cycled tracks past the design set', () => {
    // 1084 design tracks + the cycled 228 and 196 = 1508, plus the 82px chrome.
    expect(getTableWidth(7)).toBe(1590);
    expect(getTableWidth(7) - getTableWidth(DEFAULT_COLUMNS)).toBe(228 + 196);
    expect(getRootStyles(7)).toEqual({ width: '100%', maxWidth: '1590px' });
  });

  it('shrinks the width with the tracks a narrower table drops', () => {
    expect(getTableWidth(1)).toBe(228 + CHROME);
    expect(getTableWidth(0)).toBe(CHROME);
  });

  it('grows the rendered cap with the extra tracks instead of clipping them', () => {
    render(<UiSkeletonTable rows={1} columns={7} />);

    expect(getRoot()).toHaveStyle({ width: '100%', maxWidth: '1590px' });
  });

  it('shrinks to a host narrower than the derived width rather than overflowing it', () => {
    // jsdom runs no layout engine, so this pins the two declarations that decide
    // the outcome rather than a measured overflow: the frame is capped at the
    // footprint but sized by its host, and the shape tree clips the fixed tracks
    // that no longer fit. Sizing the frame to getTableWidth() would instead push
    // a 1590px decorative block out of this 480px column.
    render(
      <div style={{ width: '480px' }}>
        <UiSkeletonTable rows={1} columns={7} />
      </div>
    );

    expect(getRoot()).toHaveStyle({ width: '100%', maxWidth: '1590px' });
    expect(firstOf(getHiddenBoxes())).toHaveStyle({ width: '100%', overflow: 'hidden' });
  });

  it('keeps the design default at the measured width when columns is omitted', () => {
    render(<UiSkeletonTable rows={1} />);

    expect(getRoot()).toHaveStyle({ width: '100%', maxWidth: '1166px' });
  });
});

describe('UiSkeletonTable — invalid row and column counts', () => {
  it('falls back to the design counts for a non-finite request', () => {
    render(<UiSkeletonTable rows={Number.POSITIVE_INFINITY} columns={Number.NaN} />);

    expect(getShapes()).toHaveLength(DEFAULT_COLUMNS + DEFAULT_ROWS * SHAPES_PER_ROW);
    expect(getRoot()).toHaveStyle({ maxWidth: '1166px' });
  });

  it('floors a fractional count and clamps a negative one to nothing', () => {
    render(<UiSkeletonTable rows={2.7} columns={-3} />);

    // No column tracks survive, so every shape comes from the two body rows'
    // glyph dots and the width collapses to the padding plus the glyph lane.
    expect(getShapes()).toHaveLength(6);
    expect(getRoot()).toHaveStyle({ maxWidth: '82px' });
  });
});

describe('UiSkeletonTable — accessibility contract', () => {
  it('exposes a single busy, unnamed container with the default status text', () => {
    render(<UiSkeletonTable />);

    const root: HTMLElement = getRoot();

    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).toBeInTheDocument();
  });

  it('renders no table element and no tabular role anywhere in the subtree', () => {
    render(<UiSkeletonTable />);

    TABLE_ROLES.forEach(role => {
      expect(screen.queryAllByRole(role, { hidden: true })).toHaveLength(0);
    });
    expect(screen.queryByRole('table', { hidden: true })).not.toBeInTheDocument();

    const markup: string = getRoot().innerHTML;

    expect(markup).not.toMatch(/<(?:table|thead|tbody|tfoot|tr|th|td|caption)[\s/>]/i);
    expect(markup).not.toMatch(
      /role="(?:table|grid|treegrid|row|rowgroup|cell|gridcell|columnheader|rowheader)"/i
    );
    expect(markup).not.toMatch(/role="(?:presentation|none)"/i);
  });

  it('renders no landmark, heading or focusable content', () => {
    render(<UiSkeletonTable />);

    STRUCTURAL_ROLES.forEach(role => {
      expect(screen.queryAllByRole(role, { hidden: true })).toHaveLength(0);
    });
    expect(getRoot().innerHTML).not.toMatch(/tabindex/i);
  });

  it('hides every shape from assistive technology but not the status text', () => {
    render(<UiSkeletonTable rows={1} />);

    expect(screen.getByText(DEFAULT_LOADING_TEXT)).not.toHaveAttribute('aria-hidden');
    getHiddenBoxes().forEach(box => {
      expect(box).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

describe('UiSkeletonTable — pass-through props', () => {
  it('applies id, a localized loading text and an object sx over the root styles', () => {
    render(
      <UiSkeletonTable
        id="skeleton-table-a"
        rows={1}
        loadingText="Loading table"
        sx={{ marginTop: '4px' }}
      />
    );

    const root: HTMLElement = getRoot();

    expect(root).toHaveAttribute('id', 'skeleton-table-a');
    expect(root).toHaveStyle({ marginTop: '4px', width: '100%', maxWidth: '1166px' });
    expect(screen.getByText('Loading table')).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LOADING_TEXT)).not.toBeInTheDocument();
  });

  it('accepts sx in array form', () => {
    render(<UiSkeletonTable rows={1} sx={[{ marginTop: '6px' }, { paddingTop: '2px' }]} />);

    expect(getRoot()).toHaveStyle({ marginTop: '6px', paddingTop: '2px', maxWidth: '1166px' });
  });
});

describe('ui-skeleton-table geometry builders', () => {
  it('pins the measured column tracks, widths and shapes', () => {
    expect(TABLE_COLUMNS).toEqual([
      { track: 228, width: '190px', kind: 'bar' },
      { track: 196, width: '136px', kind: 'bar' },
      { track: 117, width: '63px', kind: 'bar' },
      { track: 219, width: '104px', kind: 'chip' },
      { track: 324, width: '280px', kind: 'stacked' },
    ]);
  });

  it('cycles column slots and keys past the design set', () => {
    expect(getColumnSlots(7)).toEqual([
      { track: 228, width: '190px', kind: 'bar', key: 'column-1' },
      { track: 196, width: '136px', kind: 'bar', key: 'column-2' },
      { track: 117, width: '63px', kind: 'bar', key: 'column-3' },
      { track: 219, width: '104px', kind: 'chip', key: 'column-4' },
      { track: 324, width: '280px', kind: 'stacked', key: 'column-5' },
      { track: 228, width: '190px', kind: 'bar', key: 'column-6' },
      { track: 196, width: '136px', kind: 'bar', key: 'column-7' },
    ]);
  });

  it('keeps header slots on the body tracks with one uniform bar width', () => {
    expect(getHeaderSlots(5)).toEqual([
      { track: 228, width: '63px', kind: 'bar', key: 'column-1' },
      { track: 196, width: '63px', kind: 'bar', key: 'column-2' },
      { track: 117, width: '63px', kind: 'bar', key: 'column-3' },
      { track: 219, width: '63px', kind: 'bar', key: 'column-4' },
      { track: 324, width: '63px', kind: 'bar', key: 'column-5' },
    ]);
  });

  it('pins the cell and chip box models', () => {
    expect(getCellStyles(228)).toEqual({ width: '228px', flexShrink: 0 });
    expect(getChipStyles('104px')).toEqual({
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '4px',
      width: '104px',
      height: '28px',
      padding: '5px 8px',
    });
    expect(chipDotStyles).toEqual({ alignSelf: 'center' });
  });

  it('pins the row, body and container layout geometry', () => {
    expect(getRootStyles(DEFAULT_COLUMNS)).toEqual({ width: '100%', maxWidth: '1166px' });
    expect(contentStyles).toEqual({
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      overflow: 'hidden',
    });
    expect(bodyStyles).toEqual({
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
    });
    expect(headerRowStyles).toEqual({
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      paddingLeft: '42px',
      paddingRight: '16px',
      height: '14px',
      marginBottom: '10px',
    });
    expect(bodyRowStyles).toEqual({
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      paddingLeft: '42px',
      paddingRight: '16px',
      height: '56px',
      borderRadius: '8px',
      overflow: 'hidden',
    });
  });

  it('pins the stacked-column and row-glyph layout', () => {
    expect(stackedStyles).toEqual({
      display: 'flex',
      flexDirection: 'column',
      gap: '5.25px',
    });
    expect(glyphStyles).toEqual({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      gap: '3px',
      width: '24px',
      height: '24px',
      marginLeft: 'auto',
    });
  });
});
