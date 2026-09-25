import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';

import websiteColorTheme from '../../src/components/ui-color-theme';
import UiSkeletonBlock from '../../src/components/ui-skeleton-block';
import UiSkeletonButton from '../../src/components/ui-skeleton-button';
import UiSkeletonImage from '../../src/components/ui-skeleton-image';
import UiSkeletonInput from '../../src/components/ui-skeleton-input';
import UiSkeletonText from '../../src/components/ui-skeleton-text';
import {
  baseSkeletonStyle,
  shadowPulseAnimation,
  shimmerAnimation,
  shimmerGradient,
  SKELETON_BORDER_COLOR,
  SKELETON_BORDER_RADIUS,
  SMALL_MOBILE_BREAKPOINT,
  SMALL_MOBILE_BREAKPOINT_UPPER,
} from '../../src/components/ui-skeletons/base';

import { countBars, getById } from './utils/skeleton-dom';

describe('UiSkeleton primitives', () => {
  it('renders UiSkeletonBlock with a custom id', () => {
    const { container } = render(<UiSkeletonBlock id="block-skeleton" />);
    expect(getById(container, 'block-skeleton')).toHaveAttribute('id', 'block-skeleton');
  });

  it('renders UiSkeletonText with a custom id', () => {
    const { container } = render(<UiSkeletonText id="text-skeleton" />);
    expect(getById(container, 'text-skeleton')).toHaveAttribute('id', 'text-skeleton');
  });

  it('renders UiSkeletonButton with a custom id', () => {
    const { container } = render(<UiSkeletonButton id="button-skeleton" />);
    expect(getById(container, 'button-skeleton')).toHaveAttribute('id', 'button-skeleton');
  });

  it('renders UiSkeletonInput with a custom id', () => {
    const { container } = render(<UiSkeletonInput id="input-skeleton" />);
    expect(getById(container, 'input-skeleton')).toHaveAttribute('id', 'input-skeleton');
  });
});

describe('UiSkeleton primitives are decorative', () => {
  // Skeleton shapes carry no information: they are hidden from assistive
  // technology so a screen reader never walks a wall of empty boxes. The
  // surrounding composed layout owns the aria-busy state and the status text.
  function expectDecorative(container: HTMLElement, id: string): HTMLElement {
    const root: HTMLElement = getById(container, id);
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(root).not.toHaveAttribute('tabindex');
    return root;
  }

  it('hides the UiSkeletonText single-line root', () => {
    const { container } = render(<UiSkeletonText id="hidden-text" />);
    expectDecorative(container, 'hidden-text');
  });

  it('hides the UiSkeletonText stack wrapper only, never the individual bars', () => {
    const { container } = render(<UiSkeletonText id="hidden-text-many" lines={3} />);
    const stack: HTMLElement = expectDecorative(container, 'hidden-text-many');
    // One aria-hidden on the wrapper already hides the whole subtree; repeating
    // it per bar would be redundant markup.
    expect(stack.innerHTML).not.toContain('aria-hidden');
    expect(countBars(stack)).toBe(3);
  });

  it('hides the UiSkeletonBlock root', () => {
    const { container } = render(<UiSkeletonBlock id="hidden-block" />);
    expectDecorative(container, 'hidden-block');
  });

  it('hides the UiSkeletonButton root', () => {
    const { container } = render(<UiSkeletonButton id="hidden-button" />);
    expectDecorative(container, 'hidden-button');
  });

  it('hides the UiSkeletonInput outer container only, never the placeholder', () => {
    const { container } = render(<UiSkeletonInput id="hidden-input" />);
    const outer: HTMLElement = expectDecorative(container, 'hidden-input');
    expect(outer.innerHTML).toContain('ui-skeleton-input__placeholder');
    expect(outer.innerHTML).not.toContain('aria-hidden');
  });

  it('hides the UiSkeletonImage root', () => {
    const { container } = render(<UiSkeletonImage id="hidden-image" />);
    expectDecorative(container, 'hidden-image');
  });
});

describe('UiSkeletons base tokens', () => {
  it('exposes the shimmer gradient and animation primitives', () => {
    expect(shimmerGradient).toContain('linear-gradient');
    expect(shimmerAnimation.name).toEqual(expect.any(String));
    expect(shadowPulseAnimation.name).toEqual(expect.any(String));
  });

  it('builds the base skeleton style from the gradient and animation', () => {
    expect(baseSkeletonStyle.backgroundImage).toBe(shimmerGradient);
    expect(baseSkeletonStyle.backgroundSize).toBe('200% 100%');
    expect(baseSkeletonStyle.animation).toContain(shimmerAnimation.name);
  });

  it('exposes the breakpoint, border and colour tokens', () => {
    expect(SMALL_MOBILE_BREAKPOINT).toBe(375);
    expect(SMALL_MOBILE_BREAKPOINT_UPPER).toBe(SMALL_MOBILE_BREAKPOINT + 1);
    expect(SKELETON_BORDER_RADIUS).toBe('57px');
    expect(SKELETON_BORDER_COLOR).toBe('#E1E7EA');
  });
});

describe('UiSkeleton default-prop styling (mutation guards)', () => {
  it('renders UiSkeletonBlock with its default width, height and radius', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonBlock id="block-defaults" />
      </ThemeProvider>
    );

    const block: HTMLElement = getById(container, 'block-defaults');
    expect(block).toHaveStyle({ width: '100%' });
    expect(block).toHaveStyle({ height: '3rem' });
    expect(block).toHaveStyle({ borderRadius: '8px' });
  });

  it('renders UiSkeletonText with its default medium height and full width', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonText id="text-defaults" />
      </ThemeProvider>
    );

    const text: HTMLElement = getById(container, 'text-defaults');
    expect(text).toHaveStyle({ height: '12px' });
    expect(text).toHaveStyle({ width: '100%' });
  });

  it('keeps the shimmer animation by default when disableAnimation is omitted', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonInput id="input-default-anim" />
      </ThemeProvider>
    );

    const input: HTMLElement = getById(container, 'input-default-anim');
    expect(input).not.toHaveStyle({ animation: 'none' });
    expect(input).toHaveStyle({ backgroundSize: '200% 100%' });
  });
});

describe('UiSkeletons reduced-motion', () => {
  it('suppresses the shimmer animation under prefers-reduced-motion', () => {
    expect(baseSkeletonStyle['@media (prefers-reduced-motion: reduce)']).toEqual({
      animation: 'none',
    });
  });
});

describe('UiSkeletons forced colors', () => {
  it('outlines every shape in Contrast Themes, where the gradient is stripped', () => {
    expect(baseSkeletonStyle['@media (forced-colors: active)']).toEqual({
      outline: '1px solid GrayText',
      outlineOffset: '-1px',
    });
  });
});
