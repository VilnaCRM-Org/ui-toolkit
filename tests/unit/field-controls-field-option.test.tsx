import type { AutocompleteRenderOptionState } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { createFieldOptionRenderer } from '../../src/components/field-controls';

import nthOf from './utils/nth-of';

interface Role {
  label: string;
  value: string;
}

const OPTION_PROPS: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key } = {};

function optionState(inputValue: string): AutocompleteRenderOptionState {
  return { inputValue, index: 0, selected: false };
}

function stringRow(label: string, input: string): React.ReactElement {
  return createFieldOptionRenderer<string>(o => o)(OPTION_PROPS, label, optionState(input));
}

function roleRow(role: Role, input: string): React.ReactElement {
  return createFieldOptionRenderer<Role>(o => o.label)(OPTION_PROPS, role, optionState(input));
}

// The ghost row is a bare <li> of two <span> runs (dark head, grey tail); the runs
// carry no semantic role of their own, so read them off the rendered node.
function spansOf(node: React.ReactElement): HTMLElement[] {
  const view = render(<ul>{node}</ul>);
  // eslint-disable-next-line testing-library/no-container
  return [...view.container.querySelectorAll<HTMLElement>('li > span')];
}

function runsOf(node: React.ReactElement): (string | null)[] {
  return spansOf(node).map(s => s.textContent);
}

describe('createFieldOptionRenderer', () => {
  it('splits a prefix-matching option into a dark head and a grey completion tail', () => {
    expect(runsOf(stringRow('Top performers', 'Top perf'))).toEqual(['Top perf', 'ormers']);
  });

  it('keeps a non-prefix option whole in the head with an empty tail', () => {
    expect(runsOf(stringRow('Top sales', 'zzz'))).toEqual(['Top sales', '']);
  });

  it('labels the row with the whole option so assistive tech announces it intact', () => {
    render(<ul>{stringRow('Top performers', 'Top')}</ul>);
    expect(screen.getByRole('listitem', { name: 'Top performers' })).toBeInTheDocument();
  });

  it('reads the label through the accessor for object options', () => {
    render(<ul>{roleRow({ label: 'Designer', value: 'design' }, 'Des')}</ul>);
    expect(screen.getByRole('listitem', { name: 'Designer' })).toBeInTheDocument();
  });

  // Figma's suggestion row is two inks, not one: the typed head in the dark value ink
  // and the completion tail in the grey placeholder ink, so the completion reads as a
  // suggestion rather than as text the user wrote. The hex values are spelled out here
  // on purpose — an assertion that read the palette token back would keep passing
  // whatever that token drifted to, which is how this pair went unguarded.
  it('paints the typed head dark and the completion tail grey', () => {
    const runs: HTMLElement[] = spansOf(stringRow('Top performers', 'Top perf'));
    // #1A1C1E darkPrimary, #969B9D grey300.
    expect(nthOf(runs, 0)).toHaveStyle({ color: 'rgb(26, 28, 30)' });
    expect(nthOf(runs, 1)).toHaveStyle({ color: 'rgb(150, 155, 157)' });
  });

  // MUI's option <li> is display:flex, so each run is its own flex item and would trim
  // its edge whitespace. A query that stops on a word boundary leaves the separating
  // space at the end of the head, and only `white-space: pre` keeps it — without it
  // the row reads "Topperformers".
  it('keeps both runs on white-space: pre so the boundary space survives', () => {
    const runs: HTMLElement[] = spansOf(stringRow('Top performers', 'Top '));
    expect(runs.map(run => run.textContent)).toEqual(['Top ', 'performers']);
    expect(nthOf(runs, 0)).toHaveStyle({ whiteSpace: 'pre' });
    expect(nthOf(runs, 1)).toHaveStyle({ whiteSpace: 'pre' });
  });
});
