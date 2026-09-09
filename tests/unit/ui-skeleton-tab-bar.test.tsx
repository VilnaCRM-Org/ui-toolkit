import { render, screen } from '@testing-library/react';
import React from 'react';

import UiSkeletonTabBar from '../../src/components/ui-skeleton-tab-bar';
import {
  ACTIVE_TAB_INDEX,
  DEFAULT_TAB_COUNT,
  LABEL_HEIGHT,
  LABEL_INSET,
  LABEL_TOP,
  LABEL_WIDTH,
  TAB_BAR_HEIGHT,
  TAB_BAR_WIDTH,
  TAB_PITCH,
  TRACK_HEIGHT,
  TRACK_RADIUS,
  TRACK_TOP,
  activeSegmentStyles,
  getTabs,
  labelBarStyles,
  labelCellStyles,
  labelRowStyles,
  segmentStyles,
  tabBarContentStyles,
  tabBarRootStyles,
  trackStyles,
} from '../../src/components/ui-skeleton-tab-bar/styles';
import type { SkeletonTab } from '../../src/components/ui-skeleton-tab-bar/styles';
import { DEFAULT_LOADING_TEXT } from '../../src/components/ui-skeletons';

// Fills measured on Board D node `538:39646`: the `Primary` token on the active
// underline and the `Font/500 (Line)` token on the track behind all six.
const ACTIVE_FILL: string = '#1EAEFF';
const TRACK_FILL: string = '#EAECEE';
// The same two fills as jsdom resolves them, used to tell the three kinds of
// 4px shape (track, plain segment, active segment) apart in the rendered tree.
const ACTIVE_FILL_RGB: string = 'rgb(30, 174, 255)';
const TRACK_FILL_RGB: string = 'rgb(234, 236, 238)';
const SHIMMER_BACKGROUND_SIZE: string = '200% 100%';
// Measured underline segment origins and the label origins that sit ~21px into
// each of those columns. Figma rounds the 188.67 pitch per shape, so the label
// origins land within a pixel of the column edge plus the inset.
// Measured segment and label x-origins for the six default tabs, paired at the
// fixture so the inset assertion reads one row instead of two arrays by index.
const TAB_ORIGINS: { segment: number; label: number }[] = [
  { segment: 0, label: 21 },
  { segment: 189, label: 209 },
  { segment: 377, label: 398 },
  { segment: 566, label: 587 },
  { segment: 755, label: 776 },
  { segment: 943, label: 965 },
];

const WIDGET_ROLES: string[] = ['tab', 'tablist', 'tabpanel', 'button', 'link', 'list', 'listitem'];

const getRoot = (): HTMLElement => screen.getByRole('generic', { busy: true });

const getShapeTree = (): HTMLElement => {
  const hidden: HTMLElement | undefined = screen
    .getAllByRole('generic', { hidden: true })
    .find(element => element.getAttribute('aria-hidden') === 'true');
  if (!hidden) throw new Error('skeleton tab bar rendered no aria-hidden shape tree');
  return hidden;
};

const shapesWith = (property: string, value: string): HTMLElement[] =>
  screen
    .getAllByRole('generic', { hidden: true })
    .filter(element => window.getComputedStyle(element).getPropertyValue(property) === value);

const getLabelBars = (): HTMLElement[] => shapesWith('width', `${LABEL_WIDTH}px`);
const getLabelCells = (): HTMLElement[] => shapesWith('padding-left', `${LABEL_INSET}px`);
const getUnderlineBand = (): HTMLElement[] => shapesWith('height', `${TRACK_HEIGHT}px`);
const getActiveSegments = (): HTMLElement[] =>
  getUnderlineBand().filter(
    element => window.getComputedStyle(element).backgroundColor === ACTIVE_FILL_RGB
  );
const getShimmerSegments = (): HTMLElement[] =>
  getUnderlineBand().filter(
    element => window.getComputedStyle(element).backgroundSize === SHIMMER_BACKGROUND_SIZE
  );

describe('UiSkeletonTabBar geometry constants', () => {
  it('carries the measured 1132x39 bar', () => {
    expect(TAB_BAR_WIDTH).toBe(1132);
    expect(TAB_BAR_HEIGHT).toBe(39);
    expect(DEFAULT_TAB_COUNT).toBe(6);
    expect(ACTIVE_TAB_INDEX).toBe(0);
  });

  it('carries the measured 189px tab pitch', () => {
    expect(TAB_PITCH).toBe(189);
    expect(Math.round(TAB_BAR_WIDTH / DEFAULT_TAB_COUNT)).toBe(TAB_PITCH);
    TAB_ORIGINS.forEach(({ segment }, index) => {
      expect(Math.round((TAB_BAR_WIDTH / DEFAULT_TAB_COUNT) * index)).toBe(segment);
    });
  });

  it('insets every label bar into its own column', () => {
    TAB_ORIGINS.forEach(({ segment, label }) => {
      expect(Math.abs(label - segment - LABEL_INSET)).toBeLessThanOrEqual(1);
    });
  });

  it('carries the measured 4px track and label bars', () => {
    expect(TRACK_HEIGHT).toBe(4);
    expect(TRACK_TOP).toBe(35);
    expect(TRACK_RADIUS).toBe('48px');
    expect(LABEL_WIDTH).toBe(147);
    expect(LABEL_HEIGHT).toBe(18);
    expect(LABEL_TOP).toBe(1);
    expect(LABEL_INSET).toBe(21);
  });

  it('bottom-aligns the track inside the bar height', () => {
    expect(TRACK_TOP + TRACK_HEIGHT).toBe(TAB_BAR_HEIGHT);
    expect(LABEL_TOP + LABEL_HEIGHT).toBeLessThan(TRACK_TOP);
  });

  it('builds the bar, label and track boxes from the measurements', () => {
    expect(tabBarRootStyles).toEqual({
      width: '100%',
      maxWidth: '1132px',
      height: '39px',
    });
    expect(tabBarContentStyles).toEqual({
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    });
    expect(labelRowStyles).toEqual({ display: 'flex', paddingTop: '1px' });
    expect(labelCellStyles).toEqual({
      boxSizing: 'border-box',
      flexGrow: 1,
      flexBasis: 0,
      minWidth: 0,
      paddingLeft: '21px',
    });
    expect(labelBarStyles).toEqual({ maxWidth: '100%' });
    expect(trackStyles).toEqual({
      display: 'flex',
      marginTop: 'auto',
      height: '4px',
      borderRadius: '48px',
      backgroundColor: TRACK_FILL,
    });
  });

  it('shares the column sizing between plain and active segments', () => {
    expect(segmentStyles).toEqual({ flexGrow: 1, flexBasis: 0, minWidth: 0 });
    expect(activeSegmentStyles).toEqual({
      flexGrow: 1,
      flexBasis: 0,
      minWidth: 0,
      height: '4px',
      borderRadius: '48px',
      backgroundColor: ACTIVE_FILL,
      '@media (forced-colors: active)': { backgroundColor: 'Highlight' },
    });
  });
});

describe('getTabs', () => {
  it('marks only the first of the six default tabs active', () => {
    const tabs: SkeletonTab[] = getTabs(DEFAULT_TAB_COUNT);
    expect(tabs).toHaveLength(DEFAULT_TAB_COUNT);
    expect(tabs[0]).toEqual({ key: 'tab-1', active: true });
    expect(tabs.filter(tab => tab.active)).toHaveLength(1);
    expect(tabs[DEFAULT_TAB_COUNT - 1]).toEqual({ key: 'tab-6', active: false });
  });

  it('scales with the requested count and collapses to nothing at zero', () => {
    expect(getTabs(4)).toHaveLength(4);
    expect(getTabs(1)).toEqual([{ key: 'tab-1', active: true }]);
    expect(getTabs(0)).toEqual([]);
  });

  it('never hands a bad length to the underlying array builder', () => {
    expect(getTabs(2.6)).toHaveLength(2);
    expect(getTabs(Number.POSITIVE_INFINITY)).toEqual([]);
  });
});

describe('UiSkeletonTabBar invalid tab counts', () => {
  it('falls back to the six design tabs for a non-finite request', () => {
    render(<UiSkeletonTabBar tabs={Number.POSITIVE_INFINITY} />);
    expect(getLabelBars()).toHaveLength(DEFAULT_TAB_COUNT);
  });

  it('floors a fractional tab count', () => {
    render(<UiSkeletonTabBar tabs={3.9} />);
    expect(getLabelBars()).toHaveLength(3);
  });

  it('renders no tab column for a negative count', () => {
    render(<UiSkeletonTabBar tabs={-2} />);
    expect(getLabelBars()).toHaveLength(0);
  });
});

describe('UiSkeletonTabBar', () => {
  it('renders six 147x18 label bars inset into six equal columns', () => {
    render(<UiSkeletonTabBar />);
    const labels: HTMLElement[] = getLabelBars();
    const cells: HTMLElement[] = getLabelCells();
    expect(labels).toHaveLength(DEFAULT_TAB_COUNT);
    expect(cells).toHaveLength(DEFAULT_TAB_COUNT);
    labels.forEach(label => {
      expect(label).toHaveStyle({ width: '147px', height: '18px', maxWidth: '100%' });
    });
    cells.forEach(cell => {
      expect(cell).toHaveStyle({ paddingLeft: '21px', boxSizing: 'border-box' });
    });
  });

  it('lays the six underline segments on one full-width track', () => {
    render(<UiSkeletonTabBar />);
    expect(getUnderlineBand()).toHaveLength(DEFAULT_TAB_COUNT + 1);
    expect(getShimmerSegments()).toHaveLength(DEFAULT_TAB_COUNT - 1);
    const active: HTMLElement[] = getActiveSegments();
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveStyle({
      backgroundColor: ACTIVE_FILL,
      height: `${TRACK_HEIGHT}px`,
      borderRadius: TRACK_RADIUS,
    });
  });

  it('paints the track with the measured line token behind the segments', () => {
    render(<UiSkeletonTabBar />);
    const track: HTMLElement | undefined = getUnderlineBand().find(
      element => window.getComputedStyle(element).backgroundColor === TRACK_FILL_RGB
    );
    expect(track).toBeDefined();
    expect(track).toHaveStyle({
      backgroundColor: TRACK_FILL,
      height: `${TRACK_HEIGHT}px`,
      borderRadius: TRACK_RADIUS,
      marginTop: 'auto',
    });
  });

  it('honours the tabs override on both the labels and the underlines', () => {
    render(<UiSkeletonTabBar tabs={4} />);
    expect(getLabelBars()).toHaveLength(4);
    expect(getUnderlineBand()).toHaveLength(5);
    expect(getShimmerSegments()).toHaveLength(3);
    expect(getActiveSegments()).toHaveLength(1);
  });

  it('renders a single active underline when asked for one tab', () => {
    render(<UiSkeletonTabBar tabs={1} />);
    expect(getLabelBars()).toHaveLength(1);
    expect(getShimmerSegments()).toHaveLength(0);
    expect(getActiveSegments()).toHaveLength(1);
  });

  it('keeps the bare track when asked for no tabs', () => {
    render(<UiSkeletonTabBar tabs={0} />);
    expect(getLabelBars()).toHaveLength(0);
    expect(getUnderlineBand()).toHaveLength(1);
    expect(getActiveSegments()).toHaveLength(0);
  });

  it('inherits the shared shimmer on the labels and the plain segments', () => {
    render(<UiSkeletonTabBar />);
    [...getLabelBars(), ...getShimmerSegments()].forEach(shape => {
      expect(shape).toHaveStyle({ backgroundSize: SHIMMER_BACKGROUND_SIZE });
    });
  });

  it('caps the bar at the board width and stacks labels over the track', () => {
    render(<UiSkeletonTabBar />);
    expect(getRoot()).toHaveStyle({
      width: '100%',
      maxWidth: `${TAB_BAR_WIDTH}px`,
      height: `${TAB_BAR_HEIGHT}px`,
    });
    expect(getShapeTree()).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    });
  });

  it('exposes a busy, role-less, unnamed container with hidden status text', () => {
    render(<UiSkeletonTabBar />);
    const root: HTMLElement = getRoot();
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(root).not.toHaveAttribute('id');
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).toBeInTheDocument();
    expect(getShapeTree()).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards a custom loading text', () => {
    render(<UiSkeletonTabBar loadingText="Loading tabs" />);
    expect(screen.getByText('Loading tabs')).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LOADING_TEXT)).not.toBeInTheDocument();
  });

  it('exposes no tab semantics, no selection state and nothing focusable', () => {
    render(<UiSkeletonTabBar />);
    WIDGET_ROLES.forEach(role => {
      expect(screen.queryAllByRole(role, { hidden: true })).toHaveLength(0);
    });
    getUnderlineBand().forEach(segment => {
      expect(segment).not.toHaveAttribute('aria-selected');
    });
  });

  it('applies id and merges sx in object form', () => {
    render(<UiSkeletonTabBar id="tabs-a" sx={{ maxWidth: '600px' }} />);
    const root: HTMLElement = getRoot();
    expect(root).toHaveAttribute('id', 'tabs-a');
    expect(root).toHaveStyle({ maxWidth: '600px', width: '100%' });
  });

  it('applies sx in array form', () => {
    render(<UiSkeletonTabBar sx={[{ padding: '4px' }, { margin: '2px' }]} />);
    expect(getRoot()).toHaveStyle({ padding: '4px', margin: '2px' });
  });
});
