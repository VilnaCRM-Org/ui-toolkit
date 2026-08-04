import { render, screen } from '@testing-library/react';
import React from 'react';

import { AuthSkeleton } from '../../src/components';
import authSkeletonStyles from '../../src/components/auth-skeleton/styles';

// Anything that can take focus inside a purely decorative loading placeholder
// would strand a keyboard user on an empty box, so the subtree must hold none.
const FOCUSABLE_SELECTOR: string = 'a[href], button, input, select, textarea, [tabindex]';

// Every rendered id is prefixed with a React.useId() instance token, so the
// suite matches on the stable suffix rather than on the whole literal.
function getSkeletonById(idSuffix: string): HTMLElement {
  const element: HTMLElement | undefined = screen
    .getAllByRole('generic', { hidden: true })
    .find(node => node.id.endsWith(idSuffix));
  expect(element).toBeDefined();
  return element as HTMLElement;
}

function getRoot(): HTMLElement {
  return screen.getByRole('generic', { busy: true });
}

function collectSkeletonIds(): string[] {
  return screen
    .getAllByRole('generic', { hidden: true })
    .map(node => node.id)
    .filter(id => id !== '');
}

describe('AuthSkeleton accessibility contract', () => {
  it('renders a plain busy container, not a named section landmark', () => {
    render(<AuthSkeleton />);

    const root: HTMLElement = getRoot();
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('aria-busy', 'true');
    // A generic element must stay nameless and role-less: no landmark, no role,
    // no accessible name to compete with the page's own status region.
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(screen.queryByRole('region', { hidden: true })).not.toBeInTheDocument();
  });

  it('exposes the loading text to assistive technology only', () => {
    render(<AuthSkeleton />);

    const status: HTMLElement = screen.getByText('Loading form');
    expect(status.tagName).toBe('SPAN');
    expect(status).not.toHaveAttribute('aria-hidden');
  });

  it('lets the ariaLabel prop localize the hidden loading text', () => {
    render(<AuthSkeleton ariaLabel="Authentication loading" />);

    expect(screen.getByText('Authentication loading')).toBeInTheDocument();
    expect(screen.queryByText('Loading form')).not.toBeInTheDocument();
  });

  it('hides the whole decorative shape tree from assistive technology', () => {
    render(<AuthSkeleton />);

    const hiddenWrapper: HTMLElement | undefined = screen
      .getAllByRole('generic', { hidden: true })
      .find(node => node.getAttribute('aria-hidden') === 'true');
    expect(hiddenWrapper).toBeDefined();
    expect(hiddenWrapper?.innerHTML).toContain('auth-skeleton-title');
    expect(getSkeletonById('auth-skeleton-title')).toHaveAttribute('aria-hidden', 'true');
  });

  it('contains no focusable element anywhere in the skeleton subtree', () => {
    render(<AuthSkeleton />);

    // The focusable surface is a structural property of the whole subtree, so
    // it is asserted with a selector rather than a per-element semantic query.
    // eslint-disable-next-line testing-library/no-node-access
    expect(getRoot().querySelectorAll(FOCUSABLE_SELECTOR)).toHaveLength(0);
  });

  it('scopes every id to the instance so two skeletons never collide', () => {
    render(
      <>
        <AuthSkeleton />
        <AuthSkeleton />
      </>
    );

    const ids: string[] = collectSkeletonIds();
    expect(ids).toHaveLength(32);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('AuthSkeleton', () => {
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
    render(<AuthSkeleton />);

    [1, 2].forEach((id: number): void => {
      const label: HTMLElement = getSkeletonById(`auth-skeleton-field-label-${id}`);
      // The field <Box> has no id of its own; reach it via its labelled child.
      // eslint-disable-next-line testing-library/no-node-access
      const fieldBox: HTMLElement = label.parentElement as HTMLElement;
      // fieldContainer carries fieldGapMargins (marginBottom 0.5rem); the
      // `true` ConditionalExpression and the `id !== 3` EqualityOperator mutants
      // would instead apply lastFieldContainer (marginBottom 0) here.
      expect(getComputedStyle(fieldBox).marginBottom).toBe('0.5rem');
    });
  });

  it('gives the third (last) field row the collapsed lastFieldContainer margin', () => {
    render(<AuthSkeleton />);

    const label3: HTMLElement = getSkeletonById('auth-skeleton-field-label-3');
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

describe('AuthSkeleton reduced-motion and forced colors', () => {
  it('suppresses the form pulse animation under prefers-reduced-motion', () => {
    expect(authSkeletonStyles.formWrapperPulse).toMatchObject({
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    });
  });

  it('keeps the card outlined in Contrast Themes, where the pulse shadow is dropped', () => {
    expect(authSkeletonStyles.formWrapperPulse).toMatchObject({
      '@media (forced-colors: active)': { border: '1px solid CanvasText' },
    });
  });
});
