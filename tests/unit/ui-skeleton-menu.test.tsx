import { render, screen } from '@testing-library/react';
import React from 'react';

import UiSkeletonMenu from '../../src/components/ui-skeleton-menu';
import {
  DIVIDER_GAP,
  ICON_INSET,
  ICON_SIZE,
  ICON_TITLE_GAP,
  MENU_BORDER_WIDTH,
  MENU_HEIGHT,
  MENU_PADDING_BOTTOM,
  MENU_PADDING_TOP,
  MENU_RADIUS,
  MENU_WIDTH,
  NAV_ROW_COUNT,
  NAV_ROW_HEIGHT,
  SECTION_HEIGHT,
  SECTION_TOP_OFFSET,
  SUB_LIST_OFFSET,
  SUB_ROW_COUNT,
  SUB_ROW_GAP,
  SUB_ROW_HEIGHT,
  SUB_ROW_INSET,
  SUB_ROW_PITCH,
  SUB_ROW_WIDTH,
  TITLE_INSET,
  TITLE_WIDTH,
  dividerStyles,
  getMenuRowKeys,
  menuContentStyles,
  menuRootStyles,
  navRowStyles,
  sectionStyles,
  subListStyles,
} from '../../src/components/ui-skeleton-menu/styles';
import { DEFAULT_LOADING_TEXT, SKELETON_BORDER_COLOR } from '../../src/components/ui-skeletons';

// Board D absolute positions the composition has to reproduce (node `538:39489`).
const SECTION_TOP: number = 291;
const DIVIDER_TOP: number = 692;
const FIGMA_CARD_FILL: string = '#FFF';
const SHIMMER_BACKGROUND_SIZE: string = '200% 100%';
// Five nav rows above the expanded section, plus the section's own header row
// and the trailing row below the divider.
const TOTAL_NAV_ROWS: number = NAV_ROW_COUNT + 2;

const WIDGET_ROLES: string[] = [
  'navigation',
  'list',
  'listitem',
  'menu',
  'menuitem',
  'button',
  'link',
  'heading',
];

const getRoot = (): HTMLElement => screen.getByRole('generic', { busy: true });

const getShapeTree = (): HTMLElement => {
  const hidden: HTMLElement | undefined = screen
    .getAllByRole('generic', { hidden: true })
    .find(element => element.getAttribute('aria-hidden') === 'true');
  if (!hidden) throw new Error('skeleton menu rendered no aria-hidden shape tree');
  return hidden;
};

const shapesWith = (property: string, value: string): HTMLElement[] =>
  screen
    .getAllByRole('generic', { hidden: true })
    .filter(element => window.getComputedStyle(element).getPropertyValue(property) === value);

const getNavRows = (): HTMLElement[] => shapesWith('height', `${NAV_ROW_HEIGHT}px`);
const getIconCircles = (): HTMLElement[] => shapesWith('width', `${ICON_SIZE}px`);
const getTitleBars = (): HTMLElement[] => shapesWith('width', `${TITLE_WIDTH}px`);
const getSubRows = (): HTMLElement[] => shapesWith('width', `${SUB_ROW_WIDTH}px`);
const getDivider = (): HTMLElement[] => shapesWith('margin-bottom', `${DIVIDER_GAP}px`);

describe('UiSkeletonMenu geometry constants', () => {
  it('carries the measured 238x791 sidebar card', () => {
    expect(MENU_WIDTH).toBe(238);
    expect(MENU_HEIGHT).toBe(791);
    expect(MENU_RADIUS).toBe('12px');
    expect(MENU_BORDER_WIDTH).toBe(1);
    expect(MENU_PADDING_TOP).toBe(21);
    expect(MENU_PADDING_BOTTOM).toBe(18);
  });

  it('carries the measured nav row anatomy', () => {
    expect(NAV_ROW_HEIGHT).toBe(54);
    expect(NAV_ROW_COUNT).toBe(5);
    expect(ICON_SIZE).toBe(24);
    expect(ICON_INSET).toBe(22);
    expect(TITLE_INSET).toBe(56);
    expect(TITLE_WIDTH).toBe(147);
  });

  it('derives the icon-to-title gap from the measured insets', () => {
    expect(ICON_TITLE_GAP).toBe(10);
    expect(ICON_TITLE_GAP).toBe(TITLE_INSET - ICON_INSET - ICON_SIZE);
  });

  it('carries the measured expanded section', () => {
    expect(SECTION_HEIGHT).toBe(192);
    expect(SECTION_TOP_OFFSET).toBe(2);
    expect(SUB_ROW_COUNT).toBe(3);
    expect(SUB_ROW_WIDTH).toBe(115);
    expect(SUB_ROW_HEIGHT).toBe(14);
    expect(SUB_ROW_INSET).toBe(61);
    expect(SUB_LIST_OFFSET).toBe(3);
  });

  it('derives the sub-row gap from the 26px pitch', () => {
    expect(SUB_ROW_PITCH).toBe(26);
    expect(SUB_ROW_GAP).toBe(12);
    expect(SUB_ROW_GAP).toBe(SUB_ROW_PITCH - SUB_ROW_HEIGHT);
  });

  it('lands the expanded section and the divider on their board positions', () => {
    expect(MENU_PADDING_TOP + NAV_ROW_COUNT * NAV_ROW_HEIGHT).toBe(SECTION_TOP);
    expect(
      MENU_HEIGHT - MENU_PADDING_BOTTOM - NAV_ROW_HEIGHT - DIVIDER_GAP - MENU_BORDER_WIDTH
    ).toBe(DIVIDER_TOP);
  });

  it('paints the card with the shared border token on a white fill', () => {
    expect(menuRootStyles).toEqual({
      boxSizing: 'border-box',
      width: '238px',
      height: '791px',
      backgroundColor: FIGMA_CARD_FILL,
      border: `1px solid ${SKELETON_BORDER_COLOR}`,
      borderRadius: '12px',
    });
  });

  it('takes the inside stroke off every measured inset', () => {
    expect(menuContentStyles).toEqual({
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      paddingTop: '20px',
      paddingBottom: '17px',
    });
    expect(ICON_INSET - MENU_BORDER_WIDTH).toBe(21);
    expect(SUB_ROW_INSET - MENU_BORDER_WIDTH).toBe(60);
  });

  it('builds the row, section and divider boxes from the measurements', () => {
    expect(navRowStyles).toEqual({
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      gap: '10px',
      height: '54px',
      paddingLeft: '21px',
    });
    expect(sectionStyles).toEqual({
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '192px',
      paddingTop: '2px',
    });
    expect(subListStyles).toEqual({
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '3px',
      paddingLeft: '60px',
    });
    expect(dividerStyles).toEqual({
      marginTop: 'auto',
      height: 0,
      borderTop: `1px solid ${SKELETON_BORDER_COLOR}`,
      marginBottom: '26px',
    });
  });
});

describe('getMenuRowKeys', () => {
  it('builds one unique, 1-based key per requested shape', () => {
    expect(getMenuRowKeys('nav', NAV_ROW_COUNT)).toEqual([
      { key: 'nav-1' },
      { key: 'nav-2' },
      { key: 'nav-3' },
      { key: 'nav-4' },
      { key: 'nav-5' },
    ]);
  });

  it('honours the prefix and collapses to nothing at zero', () => {
    expect(getMenuRowKeys('sub', SUB_ROW_COUNT)).toEqual([
      { key: 'sub-1' },
      { key: 'sub-2' },
      { key: 'sub-3' },
    ]);
    expect(getMenuRowKeys('nav', 0)).toEqual([]);
  });
});

describe('UiSkeletonMenu', () => {
  it('renders the five nav rows plus the section and trailing rows', () => {
    render(<UiSkeletonMenu />);
    const rows: HTMLElement[] = getNavRows();
    expect(rows).toHaveLength(TOTAL_NAV_ROWS);
    rows.forEach(row => {
      expect(row).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        gap: `${ICON_TITLE_GAP}px`,
        height: `${NAV_ROW_HEIGHT}px`,
        paddingLeft: `${ICON_INSET - MENU_BORDER_WIDTH}px`,
      });
    });
  });

  it('gives every row a 24px circle and a 147x18 title bar', () => {
    render(<UiSkeletonMenu />);
    const circles: HTMLElement[] = getIconCircles();
    const titles: HTMLElement[] = getTitleBars();
    expect(circles).toHaveLength(TOTAL_NAV_ROWS);
    expect(titles).toHaveLength(TOTAL_NAV_ROWS);
    circles.forEach(circle => {
      expect(circle).toHaveStyle({ width: '24px', height: '24px', borderRadius: '50%' });
    });
    titles.forEach(title => {
      expect(title).toHaveStyle({ width: '147px', height: '18px' });
    });
  });

  it('renders the three 115x14 sub-rows on the measured indent and gap', () => {
    render(<UiSkeletonMenu />);
    const subRows: HTMLElement[] = getSubRows();
    expect(subRows).toHaveLength(SUB_ROW_COUNT);
    subRows.forEach(subRow => {
      expect(subRow).toHaveStyle({ width: '115px', height: '14px', borderRadius: '57px' });
    });
  });

  it('boxes the expanded section and indents its sub-row list', () => {
    render(<UiSkeletonMenu />);
    const sections: HTMLElement[] = shapesWith('height', `${SECTION_HEIGHT}px`);
    expect(sections).toHaveLength(1);
    expect(sections[0]).toHaveStyle({ height: '192px', paddingTop: '2px' });
    const subLists: HTMLElement[] = shapesWith('padding-left', `${SUB_ROW_INSET - 1}px`);
    expect(subLists).toHaveLength(1);
    expect(subLists[0]).toHaveStyle({ gap: '12px', marginTop: '3px' });
  });

  it('bottom-anchors a single divider rule drawn as a border', () => {
    render(<UiSkeletonMenu />);
    const dividers: HTMLElement[] = getDivider();
    expect(dividers).toHaveLength(1);
    expect(dividers[0]).toHaveStyle({
      marginTop: 'auto',
      marginBottom: `${DIVIDER_GAP}px`,
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderTopColor: SKELETON_BORDER_COLOR,
    });
  });

  it('inherits the shared shimmer on every shape', () => {
    render(<UiSkeletonMenu />);
    [...getIconCircles(), ...getTitleBars(), ...getSubRows()].forEach(shape => {
      expect(shape).toHaveStyle({ backgroundSize: SHIMMER_BACKGROUND_SIZE });
    });
  });

  it('stacks the composition inside the measured card', () => {
    render(<UiSkeletonMenu />);
    expect(getRoot()).toHaveStyle({
      width: `${MENU_WIDTH}px`,
      height: `${MENU_HEIGHT}px`,
      borderRadius: MENU_RADIUS,
      boxSizing: 'border-box',
      backgroundColor: FIGMA_CARD_FILL,
    });
    expect(getShapeTree()).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      paddingTop: `${MENU_PADDING_TOP - MENU_BORDER_WIDTH}px`,
      paddingBottom: `${MENU_PADDING_BOTTOM - MENU_BORDER_WIDTH}px`,
    });
  });

  it('exposes a busy, role-less, unnamed container with hidden status text', () => {
    render(<UiSkeletonMenu />);
    const root: HTMLElement = getRoot();
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(root).not.toHaveAttribute('id');
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).toBeInTheDocument();
    expect(getShapeTree()).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards a custom loading text', () => {
    render(<UiSkeletonMenu loadingText="Loading menu" />);
    expect(screen.getByText('Loading menu')).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LOADING_TEXT)).not.toBeInTheDocument();
  });

  it('exposes no navigation or widget semantics and nothing focusable', () => {
    render(<UiSkeletonMenu />);
    WIDGET_ROLES.forEach(role => {
      expect(screen.queryAllByRole(role, { hidden: true })).toHaveLength(0);
    });
  });

  it('applies id and merges sx in object form', () => {
    render(<UiSkeletonMenu id="menu-a" sx={{ height: '400px' }} />);
    const root: HTMLElement = getRoot();
    expect(root).toHaveAttribute('id', 'menu-a');
    expect(root).toHaveStyle({ height: '400px', width: `${MENU_WIDTH}px` });
  });

  it('applies sx in array form', () => {
    render(<UiSkeletonMenu sx={[{ padding: '4px' }, { margin: '2px' }]} />);
    expect(getRoot()).toHaveStyle({ padding: '4px', margin: '2px' });
  });
});
