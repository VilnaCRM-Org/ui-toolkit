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

describe('AuthSkeleton mutation hardening', () => {
  it('applies the base skeleton sx on wrapped primitives by default', () => {
    render(<AuthSkeleton />);

    // Default wrap() must return [baseSx] (not []), so the per-skeleton base
    // styles still land. Pinning width/height/marginBottom from titleSkeleton
    // kills the ArrayDeclaration mutant that drops baseSx ([] -> empty styles).
    const title: HTMLElement = getSkeletonById('auth-skeleton-title');
    const titleStyle: CSSStyleDeclaration = getComputedStyle(title);
    expect(titleStyle.width).toBe('7.5rem');
    expect(titleStyle.height).toBe('1.375rem');
    expect(titleStyle.marginBottom).toBe('0.5rem');
  });

  it('gives the first two field rows the spaced fieldContainer margin', () => {
    const { container } = render(<AuthSkeleton />);

    [1, 2].forEach((id: number): void => {
      // The field <Box> has no role/id; reach it via its labelled child.
      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const label: HTMLElement = container.querySelector(
        `#auth-skeleton-field-label-${id}`
      ) as HTMLElement;
      // eslint-disable-next-line testing-library/no-node-access
      const fieldBox: HTMLElement = label.parentElement as HTMLElement;
      // fieldContainer carries fieldGapMargins (marginBottom 0.5rem); the
      // `true` ConditionalExpression and the `id !== 3` EqualityOperator mutants
      // would instead apply lastFieldContainer (marginBottom 0) here.
      expect(getComputedStyle(fieldBox).marginBottom).toBe('0.5rem');
    });
  });

  it('gives the third (last) field row the collapsed lastFieldContainer margin', () => {
    const { container } = render(<AuthSkeleton />);

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const label3: HTMLElement = container.querySelector(
      '#auth-skeleton-field-label-3'
    ) as HTMLElement;
    // eslint-disable-next-line testing-library/no-node-access
    const lastFieldBox: HTMLElement = label3.parentElement as HTMLElement;
    // id === 3 selects lastFieldContainer (marginBottom 0); the `false`
    // ConditionalExpression and the `id !== 3` EqualityOperator mutants would
    // apply fieldContainer (marginBottom 0.5rem) on the last row instead.
    expect(getComputedStyle(lastFieldBox).marginBottom).toBe('0px');
  });

  it('renders the form wrapper with its merged formWrapper styles', () => {
    render(<AuthSkeleton />);

    const title: HTMLElement = getSkeletonById('auth-skeleton-title');
    // The FormBody <Box> is the DOM parent of the title primitive.
    // eslint-disable-next-line testing-library/no-node-access
    const formWrapperBox: HTMLElement = title.parentElement as HTMLElement;
    const wrapperStyle: CSSStyleDeclaration = getComputedStyle(formWrapperBox);
    // wrap({ ...formWrapper, ...formWrapperPulse }) must spread the real style
    // objects; the ObjectLiteral mutant wrap({}) would drop every declaration.
    expect(wrapperStyle.borderRadius).toBe('16px');
    expect(wrapperStyle.maxWidth).toBe('22.6875rem');
    expect(wrapperStyle.position).toBe('relative');
  });
});
