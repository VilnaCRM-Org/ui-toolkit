import type { AutocompleteRenderOptionState } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { createFieldOptionRenderer } from '../../src/components/field-controls';

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
// carry no semantic role of their own, so read their text off the rendered node.
function runsOf(node: React.ReactElement): (string | null)[] {
  const view = render(<ul>{node}</ul>);
  // eslint-disable-next-line testing-library/no-container
  return [...view.container.querySelectorAll('li > span')].map(s => s.textContent);
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
});
