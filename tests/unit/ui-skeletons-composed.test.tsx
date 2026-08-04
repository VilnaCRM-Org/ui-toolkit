import { render, screen } from '@testing-library/react';
import React from 'react';

import { ComposedSkeleton, DEFAULT_LOADING_TEXT } from '../../src/components/ui-skeletons';

const getRoot = (): HTMLElement => screen.getByRole('generic', { busy: true });

const getShapeTree = (): HTMLElement => {
  const hidden = screen
    .getAllByRole('generic', { hidden: true })
    .find(element => element.getAttribute('aria-hidden') === 'true');
  if (!hidden) throw new Error('composed skeleton rendered no aria-hidden shape tree');
  return hidden;
};

const FOCUSABLE_ROLES: string[] = ['button', 'link', 'textbox', 'checkbox', 'radio', 'combobox'];

describe('ComposedSkeleton', () => {
  it('renders a busy, unnamed, role-less container with hidden status text', () => {
    render(<ComposedSkeleton>{<span>shape</span>}</ComposedSkeleton>);
    const root = getRoot();
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(root).toHaveTextContent(`${DEFAULT_LOADING_TEXT}shape`);
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).toBeInTheDocument();
  });

  it('exposes the default Ukrainian loading text and accepts an override', () => {
    expect(DEFAULT_LOADING_TEXT).toBe('Завантаження');
    render(<ComposedSkeleton loadingText="Loading tasks">{<span />}</ComposedSkeleton>);
    expect(screen.getByText('Loading tasks')).toBeInTheDocument();
  });

  it('hides the shape tree from assistive technology, not the status text', () => {
    render(
      <ComposedSkeleton contentSx={{ columnGap: '2px' }}>{<span>shape</span>}</ComposedSkeleton>
    );
    expect(screen.getByText(DEFAULT_LOADING_TEXT)).not.toHaveAttribute('aria-hidden');
    const shapes = getShapeTree();
    expect(shapes).toHaveAttribute('aria-hidden', 'true');
    expect(shapes).toHaveTextContent('shape');
  });

  it('contains no focusable content in the rendered subtree', () => {
    render(<ComposedSkeleton>{<span>shape</span>}</ComposedSkeleton>);
    FOCUSABLE_ROLES.forEach(role => {
      expect(screen.queryAllByRole(role, { hidden: true })).toHaveLength(0);
    });
  });

  it('applies id and merges sx and contentSx in object and array form', () => {
    render(
      <ComposedSkeleton
        id="composed-a"
        sx={{ padding: '2px' }}
        contentSx={[{ gap: '4px' }, { rowGap: '6px' }]}
      >
        {<span />}
      </ComposedSkeleton>
    );
    const root = getRoot();
    expect(root).toHaveAttribute('id', 'composed-a');
    expect(root).toHaveStyle({ padding: '2px' });
    expect(getShapeTree()).toHaveStyle({ gap: '4px', rowGap: '6px' });
  });
});
