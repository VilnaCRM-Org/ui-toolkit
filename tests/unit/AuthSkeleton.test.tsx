import { render, screen } from '@testing-library/react';
import React from 'react';

import { AuthSkeleton } from '../../src/components';

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
    const { container } = render(<AuthSkeleton />);

    const title: Element | null = container.querySelector('#auth-skeleton-title');
    expect(title).not.toBeNull();
    // Without disableAnimation the wrap() helper returns only [baseSx],
    // so the base shimmer animation is preserved and never set to "none".
    expect(getComputedStyle(title as Element).animation).not.toBe('none');
  });

  it('disables animations on wrapped skeletons when disableAnimation is true', () => {
    const { container } = render(<AuthSkeleton disableAnimation />);

    // wrap() appends STATIC_SX ({ animation: 'none', backgroundSize: '100% 100%' })
    // to every wrapped skeleton, exercising the truthy branch of buildWrap.
    const title: Element | null = container.querySelector('#auth-skeleton-title');
    expect(title).not.toBeNull();
    const titleStyle: CSSStyleDeclaration = getComputedStyle(title as Element);
    expect(titleStyle.animation).toBe('none');
    expect(titleStyle.backgroundSize).toBe('100% 100%');
  });

  it('forwards disableAnimation down to the input skeletons', () => {
    const { container } = render(<AuthSkeleton disableAnimation />);

    const input: Element | null = container.querySelector('#auth-skeleton-input-1');
    expect(input).not.toBeNull();
    expect(getComputedStyle(input as Element).animation).toBe('none');
  });
});
