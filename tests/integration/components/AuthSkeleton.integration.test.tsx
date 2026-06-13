import { render, screen } from '@testing-library/react';
import React from 'react';

import AuthSkeleton from '../../../src/components/AuthSkeleton';

// Integration tier: AuthSkeleton is rendered with its REAL composed children —
// UiSkeletonText / UiSkeletonInput / UiSkeletonButton / UiSkeletonBlock plus the
// MUI <Divider>. None of the skeleton primitives are mocked, so these tests
// assert the genuine rendered tree and the cross-component propagation of the
// `disableAnimation` prop down into every primitive.
//
// The primitives no longer expose a data-testid; each is located by the unique
// `id` AuthSkeleton renders it with (mirroring the CRM convention).

const SOCIAL_IDS: readonly string[] = ['google', 'facebook', 'apple', 'linkedin'];

// Stable ids AuthSkeleton assigns to each composed primitive, grouped by type so
// the suite can assert both presence and aggregate counts per primitive.
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

function getById(container: HTMLElement, id: string): HTMLElement {
  const el: HTMLElement | null = container.querySelector<HTMLElement>(`#${id}`);
  if (el === null) {
    throw new Error(`Expected element #${id} to be present in the composed skeleton tree`);
  }
  return el;
}

function countPresent(container: HTMLElement, ids: readonly string[]): number {
  return ids.filter(id => container.querySelector(`#${id}`) !== null).length;
}

describe('AuthSkeleton (integration)', () => {
  it('renders the aria-labelled loading section as a <section> landmark', () => {
    render(<AuthSkeleton />);

    const section: HTMLElement = screen.getByLabelText('Loading form');
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe('SECTION');
  });

  it('honours a custom ariaLabel on the loading section', () => {
    render(<AuthSkeleton ariaLabel="Authentication loading" />);

    expect(screen.getByLabelText('Authentication loading')).toBeInTheDocument();
    expect(screen.queryByLabelText('Loading form')).not.toBeInTheDocument();
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
      expect(input.querySelector('.ui-skeleton-input__placeholder')).not.toBeNull();
    });
    expect(container.querySelectorAll('.ui-skeleton-input__placeholder')).toHaveLength(3);
  });

  it('renders the real submit button primitive', () => {
    const { container } = render(<AuthSkeleton />);

    const submit: HTMLElement = getById(container, 'auth-skeleton-submit');
    expect(submit).toBeInTheDocument();
    expect(countPresent(container, BUTTON_IDS)).toBe(1);
  });

  it('renders the MUI Divider with a presentation role wrapping a real text primitive', () => {
    const { container } = render(<AuthSkeleton />);

    const divider: HTMLElement = screen.getByRole('presentation');
    expect(divider).toBe(getById(container, 'auth-skeleton-divider'));
    expect(divider).toHaveClass('MuiDivider-root');

    // The divider label is a real UiSkeletonText nested inside the MUI divider.
    const dividerText: HTMLElement = getById(container, 'auth-skeleton-divider-text');
    expect(dividerText).toBeInTheDocument();
    expect(divider.querySelector('#auth-skeleton-divider-text')).toBe(dividerText);
  });

  it('renders all four social blocks as real UiSkeletonBlock primitives', () => {
    const { container } = render(<AuthSkeleton />);

    expect(countPresent(container, BLOCK_IDS)).toBe(SOCIAL_IDS.length);

    SOCIAL_IDS.forEach(id => {
      const block: HTMLElement = getById(container, `auth-skeleton-social-${id}`);
      expect(block).toBeInTheDocument();
    });
  });

  it('renders the switcher text primitive as a direct child of the section', () => {
    const { container } = render(<AuthSkeleton />);

    const section: HTMLElement = screen.getByLabelText('Loading form');
    const switcher: HTMLElement = getById(container, 'auth-skeleton-switcher');

    expect(switcher).toBeInTheDocument();
    expect(switcher.parentElement).toBe(section);
  });

  it('composes the complete skeleton tree (title, subtitle, fields, submit, divider, social, switcher)', () => {
    const { container } = render(<AuthSkeleton />);

    const expectedIds: readonly string[] = [
      'auth-skeleton-title',
      'auth-skeleton-subtitle',
      'auth-skeleton-subtitle-line2',
      'auth-skeleton-field-label-1',
      'auth-skeleton-field-label-2',
      'auth-skeleton-field-label-3',
      'auth-skeleton-input-1',
      'auth-skeleton-input-2',
      'auth-skeleton-input-3',
      'auth-skeleton-submit',
      'auth-skeleton-divider',
      'auth-skeleton-divider-text',
      'auth-skeleton-social-google',
      'auth-skeleton-social-facebook',
      'auth-skeleton-social-apple',
      'auth-skeleton-social-linkedin',
      'auth-skeleton-switcher',
    ];

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

    const wrappedIds: readonly string[] = [
      'auth-skeleton-title',
      'auth-skeleton-subtitle',
      'auth-skeleton-subtitle-line2',
      'auth-skeleton-field-label-1',
      'auth-skeleton-submit',
      'auth-skeleton-divider-text',
      'auth-skeleton-social-google',
      'auth-skeleton-social-linkedin',
      'auth-skeleton-switcher',
    ];

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
