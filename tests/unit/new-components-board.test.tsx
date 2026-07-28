import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Board } from '../../src/showcase/new-components-board/board';
import { searchNode } from '../../src/showcase/new-components-board/nodes';

import mockConsoleWarn from './utils/mock-console-warn';

// The Figma-parity showcase board is a static demonstration surface (its pixel
// contract lives in the visual suite). This unit smoke test renders the whole
// board so every group, tile and state builder is exercised — locking in that the
// decomposed modules compose into a single, crash-free React tree.
mockConsoleWarn();

// Every section heading Figma draws, in board order.
const GROUP_HEADINGS: readonly string[] = [
  'Пошук',
  'Select з пошуком',
  'Multiselect',
  'Radio button',
  'Календар (діапазон дат)',
  'Пагінація',
  'Завантаження файлу',
  'Рядок ендпоінта (REST API)',
  'Картка завдання (Дошка)',
];

describe('New Components board (Figma parity showcase)', () => {
  it('renders one section heading per showcase group', () => {
    render(<Board />);

    for (const heading of GROUP_HEADINGS) {
      expect(screen.getByRole('heading', { level: 3, name: heading })).toBeInTheDocument();
    }
  });

  it('renders the endpoint-row tiles as disclosure buttons and plain rows', () => {
    render(<Board />);

    // The expanded tile wires an onToggle, so it renders as a button; the row's
    // path and description are real (separate) text nodes on every tile.
    expect(screen.getAllByText('/put/{petID}/uploadImage').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Uploads an image').length).toBeGreaterThan(0);

    // Only the expanded tile is wired (its onToggle makes it a disclosure button);
    // toggling it exercises the tile's no-op handler.
    const expanded: HTMLElement = screen.getByRole('button', {
      name: 'POST /put/{petID} Update existing pet',
    });
    fireEvent.click(expanded);
    expect(expanded).toHaveAttribute('aria-expanded', 'true');

    // The rest/hover endpoint tiles wire no onToggle, so they render as plain
    // content — never a disclosure button. The GET tiles share this name, and
    // none is wired, so no such button exists.
    expect(
      screen.queryByRole('button', { name: 'GET /put/{petID}/uploadImage Uploads an image' })
    ).not.toBeInTheDocument();
  });

  it('forces the search field responsive/interaction variants without crashing', () => {
    // searchNode drives both branches of every optional (tablet/hover/open/
    // mobilePaper); rendering the full matrix asserts the builder stays total.
    render(
      <>
        {searchNode({})}
        {searchNode({ tablet: true, hover: true })}
        {searchNode({ open: true, mobilePaper: true })}
      </>
    );

    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
  });
});
