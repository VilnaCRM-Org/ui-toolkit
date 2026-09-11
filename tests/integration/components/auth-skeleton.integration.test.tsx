import { render, screen } from '@testing-library/react';
import React from 'react';

import AuthSkeleton from '../../../src/components/auth-skeleton';

// Integration tier: AuthSkeleton is rendered with its REAL composed children —
// UiSkeletonText / UiSkeletonInput / UiSkeletonButton / UiSkeletonBlock plus the
// MUI <Divider>. None of the skeleton primitives are mocked, so these tests
// assert the genuine rendered tree and the cross-component propagation of the
// `disableAnimation` prop down into every primitive.
//
// The primitives expose neither a data-testid nor a role (they are aria-hidden
// decoration); each is located by the id AuthSkeleton renders it with, matched
// on its stable suffix because a React.useId() token prefixes every id.

const SOCIAL_IDS: readonly string[] = ['google', 'facebook', 'apple', 'linkedin'];

// Stable id suffixes AuthSkeleton assigns to each composed primitive, grouped by
// type so the suite can assert both presence and aggregate counts per primitive.
const TEXT_IDS: readonly string[] = [
  'auth-skeleton-title',
  'auth-skeleton-subtitle',
  'auth-skeleton-subtitle-line2',
  'auth-skeleton-field-label-1',
  'auth-skeleton-field-label-2',
  'auth-skeleton-field-label-3',
  'auth-skeleton-divider-text',
  'auth-skeleton-switcher',
];
const INPUT_IDS: readonly string[] = [
  'auth-skeleton-input-1',
  'auth-skeleton-input-2',
  'auth-skeleton-input-3',
];
const BUTTON_IDS: readonly string[] = ['auth-skeleton-submit'];
const BLOCK_IDS: readonly string[] = SOCIAL_IDS.map(id => `auth-skeleton-social-${id}`);

function selector(idSuffix: string): string {
  return `[id$="${idSuffix}"]`;
}

function getById(container: HTMLElement, idSuffix: string): HTMLElement {
  // Skeleton primitives are decorative (no role/label); asserted by stable id only.
  // eslint-disable-next-line testing-library/no-node-access
  const el: HTMLElement | null = container.querySelector<HTMLElement>(selector(idSuffix));
  if (el === null) {
    throw new Error(`Expected element ${selector(idSuffix)} to be present in the skeleton tree`);
  }
  return el;
}

function countPresent(container: HTMLElement, ids: readonly string[]): number {
  return ids.filter(id => container.querySelector(selector(id)) !== null).length;
}

describe('AuthSkeleton (integration)', () => {
  it('renders a busy container holding the hidden loading text, not a landmark', () => {
    const { container } = render(<AuthSkeleton />);

    const root: HTMLElement = screen.getByRole('generic', { busy: true });
    expect(root.tagName).toBe('DIV');
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(screen.getByText('Loading form')).toBeInTheDocument();
    // The real primitives below it are all inside the aria-hidden shape tree.
    expect(getById(container, 'auth-skeleton-title')).toHaveAttribute('aria-hidden', 'true');
  });

  it('honours a custom ariaLabel as the hidden loading text', () => {
    render(<AuthSkeleton ariaLabel="Authentication loading" />);

    expect(screen.getByText('Authentication loading')).toBeInTheDocument();
    expect(screen.queryByText('Loading form')).not.toBeInTheDocument();
  });

  it('renders the real title and two-line subtitle text primitives', () => {
    const { container } = render(<AuthSkeleton />);

    const title: HTMLElement = getById(container, 'auth-skeleton-title');
    const subtitle: HTMLElement = getById(container, 'auth-skeleton-subtitle');
    const subtitleLine2: HTMLElement = getById(container, 'auth-skeleton-subtitle-line2');

    [title, subtitle, subtitleLine2].forEach(el => {
      expect(el).toBeInTheDocument();
    });
  });

  it('renders three field rows, each composing a real label text + real input', () => {
    const { container } = render(<AuthSkeleton />);

    [1, 2, 3].forEach(id => {
      const label: HTMLElement = getById(container, `auth-skeleton-field-label-${id}`);
      const input: HTMLElement = getById(container, `auth-skeleton-input-${id}`);

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
  });

  it('renders the real UiSkeletonInput primitive with its inner placeholder element', () => {
    const { container } = render(<AuthSkeleton />);

    const inputs: HTMLElement[] = INPUT_IDS.map(id => getById(container, id));
    expect(inputs).toHaveLength(3);

    // The placeholder div is produced by the REAL UiSkeletonInput child, proving
    // the primitive was rendered rather than mocked away.
    inputs.forEach(input => {
      // Asserts the REAL UiSkeletonInput rendered its inner placeholder; structural.
      // eslint-disable-next-line testing-library/no-node-access
      expect(input.querySelector('.ui-skeleton-input__placeholder')).not.toBeNull();
    });
    // Aggregate count of the real inner placeholders; structural assertion, no semantic query.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.ui-skeleton-input__placeholder')).toHaveLength(3);
  });

  it('renders the real submit button primitive', () => {
    const { container } = render(<AuthSkeleton />);

    const submit: HTMLElement = getById(container, 'auth-skeleton-submit');
    expect(submit).toBeInTheDocument();
    expect(countPresent(container, BUTTON_IDS)).toBe(1);
  });

  it('renders the MUI Divider wrapping a real text primitive', () => {
    const { container } = render(<AuthSkeleton />);

    // The divider carries no id of its own — it is a structural wrapper inside
    // the aria-hidden shape tree, so it is located by its MUI class.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const divider: HTMLElement | null = container.querySelector<HTMLElement>('.MuiDivider-root');
    expect(divider).not.toBeNull();
    expect(divider).toHaveAttribute('role', 'presentation');

    // The divider label is a real UiSkeletonText nested inside the MUI divider.
    const dividerText: HTMLElement = getById(container, 'auth-skeleton-divider-text');
    expect(dividerText).toBeInTheDocument();
    // Asserts the real text primitive is nested inside the divider; structural, no semantic query.
    // eslint-disable-next-line testing-library/no-node-access
    expect(divider?.querySelector(selector('auth-skeleton-divider-text'))).toBe(dividerText);
  });

  it('renders all four social blocks as real UiSkeletonBlock primitives', () => {
    const { container } = render(<AuthSkeleton />);

    expect(countPresent(container, BLOCK_IDS)).toBe(SOCIAL_IDS.length);

    SOCIAL_IDS.forEach(id => {
      const block: HTMLElement = getById(container, `auth-skeleton-social-${id}`);
      expect(block).toBeInTheDocument();
    });
  });

  it('renders the switcher text primitive inside the aria-hidden shape tree', () => {
    const { container } = render(<AuthSkeleton />);

    const root: HTMLElement = screen.getByRole('generic', { busy: true });
    const switcher: HTMLElement = getById(container, 'auth-skeleton-switcher');

    // Asserts the switcher sits in the hidden shape wrapper, whose own parent is
    // the busy root — the canonical composed-skeleton nesting.
    // eslint-disable-next-line testing-library/no-node-access
    const shapeTree: HTMLElement = switcher.parentElement as HTMLElement;
    expect(shapeTree).toHaveAttribute('aria-hidden', 'true');
    // eslint-disable-next-line testing-library/no-node-access
    expect(shapeTree.parentElement).toBe(root);
  });

  it('composes the complete skeleton tree from every real primitive', () => {
    const { container } = render(<AuthSkeleton />);

    const expectedIds: readonly string[] = [...TEXT_IDS, ...INPUT_IDS, ...BUTTON_IDS, ...BLOCK_IDS];

    expectedIds.forEach(id => {
      expect(getById(container, id)).toBeInTheDocument();
    });

    // Aggregate counts across the composed primitives:
    // text = title + 2 subtitle + 3 labels + divider-text + switcher = 8.
    expect(countPresent(container, TEXT_IDS)).toBe(8);
    expect(countPresent(container, INPUT_IDS)).toBe(3);
    expect(countPresent(container, BUTTON_IDS)).toBe(1);
    expect(countPresent(container, BLOCK_IDS)).toBe(4);
  });

  it('keeps the shimmer animation running by default (disableAnimation=false)', () => {
    const { container } = render(<AuthSkeleton />);

    const title: HTMLElement = getById(container, 'auth-skeleton-title');
    // Default wrap() returns only [baseSx], so STATIC_SX is never applied and the
    // base shimmer animation is preserved on the real text primitive.
    expect(getComputedStyle(title).animation).not.toBe('none');
  });

  it('propagates disableAnimation into every wrapped text/button/block primitive', () => {
    const { container } = render(<AuthSkeleton disableAnimation />);

    // Cover every wrapped text/button/block primitive (inputs are asserted
    // separately below) so facebook/apple and field-label-2/3 are not skipped.
    const wrappedIds: readonly string[] = [...TEXT_IDS, ...BUTTON_IDS, ...BLOCK_IDS];

    wrappedIds.forEach(id => {
      const style: CSSStyleDeclaration = getComputedStyle(getById(container, id));
      expect(style.animation).toBe('none');
      expect(style.backgroundSize).toBe('100% 100%');
    });
  });

  it('propagates disableAnimation down into the real input skeleton children', () => {
    const { container } = render(<AuthSkeleton disableAnimation />);

    [1, 2, 3].forEach(id => {
      const input: HTMLElement = getById(container, `auth-skeleton-input-${id}`);
      // disableAnimation flows through the prop into the child UiSkeletonInput,
      // which applies its own static style — proving cross-component wiring.
      expect(getComputedStyle(input).animation).toBe('none');
    });
  });
});
