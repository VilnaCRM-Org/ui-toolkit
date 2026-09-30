import { render, screen } from '@testing-library/react';
import React from 'react';

import { ComposedSkeleton, DEFAULT_LOADING_TEXT } from '../../src/components/ui-skeletons';

describe('ComposedSkeleton landmark', () => {
  it('renders a busy region named by the loading text with landmark="section"', () => {
    render(
      <ComposedSkeleton landmark="section" loadingText="Loading tasks">
        <span>shape</span>
      </ComposedSkeleton>
    );
    const region: HTMLElement = screen.getByRole('region', { name: 'Loading tasks' });
    expect(region.tagName).toBe('SECTION');
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region).toHaveTextContent(/^shape$/);
    expect(screen.queryByText('Loading tasks')).not.toBeInTheDocument();
  });

  it('names the region with the default loading text', () => {
    render(
      <ComposedSkeleton landmark="section">
        <span />
      </ComposedSkeleton>
    );
    expect(screen.getByRole('region', { name: DEFAULT_LOADING_TEXT })).toBeInTheDocument();
  });

  it('renders no region without the opt-in', () => {
    render(
      <ComposedSkeleton loadingText="Loading tasks">
        <span />
      </ComposedSkeleton>
    );
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByRole('generic', { busy: true }).tagName).toBe('DIV');
    expect(screen.getByText('Loading tasks').tagName).toBe('SPAN');
  });
});
