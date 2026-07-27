import { render, screen } from '@testing-library/react';
import React from 'react';

import Board from '../../src/showcase/board';

// The Figma-parity board is the source of the committed visual baseline, so it is
// asserted here through the same user-facing semantics the baseline captures: one
// section per showcased component, one tile per Figma state, and the forced
// interaction states (open dropdowns, typed search text, the upload error) that
// only exist because the board pins them statically.
const GROUP_TITLES: string[] = [
  'Пошук',
  'Select з пошуком',
  'Multiselect',
  'Radio button',
  'Календар (діапазон дат)',
  'Пагінація',
  'Завантаження файлу',
];

const TILE_LABELS: string[] = [
  'Rest',
  'Hover',
  'Open',
  'Tablet — Rest',
  'Tablet — Hover',
  'Tablet — Open',
  'Mobile — Rest',
  'Mobile — Hover',
  'Mobile — Open',
  'Rest',
  'Hover',
  'Open',
  'Filled',
  'Filled ×3',
  'Item hover',
  'Empty',
  'Open',
  'Selected',
  'Rest',
  'Hover',
  'Active',
  'Active (other month)',
  'Rest',
  'Hover',
  'Current',
  'Disabled',
  'Rest',
  'Hover',
  'Disabled',
  'Error',
];

const TILE_LABEL_PATTERN: RegExp = new RegExp(
  `^(${[...new Set(TILE_LABELS)]
    .map((label: string) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})$`
);

describe('New-components showcase board (Figma parity)', () => {
  it('renders one section heading per showcased component, in Figma order', () => {
    render(<Board />);
    const headings: HTMLElement[] = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((heading: HTMLElement) => heading.textContent)).toEqual(GROUP_TITLES);
  });

  it('lays out one labelled tile per Figma state, in board order', () => {
    render(<Board />);
    const labels: HTMLElement[] = screen.getAllByText(TILE_LABEL_PATTERN);
    expect(labels.map((label: HTMLElement) => label.textContent)).toEqual(TILE_LABELS);
  });

  it('renders the search field once per size/state tile', () => {
    render(<Board />);
    expect(screen.getAllByRole('combobox', { name: 'Пошук' })).toHaveLength(9);
  });

  it('renders the city select once per state tile', () => {
    render(<Board />);
    expect(screen.getAllByRole('combobox', { name: 'Місто' })).toHaveLength(3);
  });

  it('forces every dropdown tile open and inline so the popper is captured', () => {
    render(<Board />);
    // Three open search tiles (desktop/tablet/mobile) plus the open select and the
    // open multiselect — `disablePortal` keeps each listbox inside its own tile.
    expect(screen.getAllByRole('listbox')).toHaveLength(5);
  });

  it('pins the typed query on the open search tiles', () => {
    render(<Board />);
    expect(screen.getAllByDisplayValue('Топ прод')).toHaveLength(3);
  });

  it('renders a calendar grid per calendar state tile', () => {
    render(<Board />);
    expect(screen.getAllByRole('grid')).toHaveLength(4);
  });

  it('renders the radio group with the pre-selected contact channel', () => {
    render(<Board />);
    expect(screen.getByRole('radiogroup', { name: "Бажаний спосіб зв'язку" })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Електронна пошта' })).toBeChecked();
  });

  it('renders a page-3 cell in each pagination tile, disabled only in the disabled one', () => {
    render(<Board />);
    const cells: HTMLElement[] = screen.getAllByRole('button', { name: 'Сторінка 3' });
    expect(cells).toHaveLength(4);
    expect(cells.filter((cell: HTMLElement) => cell.hasAttribute('disabled'))).toHaveLength(1);
  });

  it('renders the upload error tile with its helper message', () => {
    render(<Board />);
    expect(screen.getByText('Виникла помилка. Перевірте ще раз')).toBeInTheDocument();
  });
});
