import { render, screen } from '@testing-library/react';
import React from 'react';

import { AuthSkeleton } from '../../src/components';

// The skeleton primitives render as MUI Box divs (role="generic") identified
// only by their `id`; resolve them through a semantic role query + id filter
// rather than reaching into the container DOM.
function getSkeletonById(id: string): HTMLElement {
  const element: HTMLElement | undefined = screen
    .getAllByRole('generic')
    .find(node => node.id === id);
  expect(element).toBeDefined();
  return element as HTMLElement;
}

describe('AuthSkeleton', () => {
  it('renders the form-loading skeleton region', () => {
    render(<AuthSkeleton />);

    expect(screen.getByLabelText('Loading form')).toBeInTheDocument();
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('supports a custom aria label', () => {
    render(<AuthSkeleton ariaLabel="Authentication loading" />);

    expect(screen.getByLabelText('Authentication loading')).toBeInTheDocument();
  });

  it('keeps the shimmer animation running by default (disableAnimation=false)', () => {
    render(<AuthSkeleton />);

    const title: HTMLElement = getSkeletonById('auth-skeleton-title');
    // Without disableAnimation the wrap() helper returns only [baseSx],
    // so the base shimmer animation is preserved and never set to "none".
    expect(getComputedStyle(title).animation).not.toBe('none');
  });

  it('disables animations on wrapped skeletons when disableAnimation is true', () => {
    render(<AuthSkeleton disableAnimation />);

    // wrap() appends STATIC_SX ({ animation: 'none', backgroundSize: '100% 100%' })
    // to every wrapped skeleton, exercising the truthy branch of buildWrap.
    const title: HTMLElement = getSkeletonById('auth-skeleton-title');
    const titleStyle: CSSStyleDeclaration = getComputedStyle(title);
    expect(titleStyle.animation).toBe('none');
    expect(titleStyle.backgroundSize).toBe('100% 100%');
  });

  it('forwards disableAnimation down to the input skeletons', () => {
    render(<AuthSkeleton disableAnimation />);

    const input: HTMLElement = getSkeletonById('auth-skeleton-input-1');
    expect(getComputedStyle(input).animation).toBe('none');
  });
});
