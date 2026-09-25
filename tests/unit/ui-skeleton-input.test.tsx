import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';

import websiteColorTheme from '../../src/components/ui-color-theme';
import UiSkeletonInput from '../../src/components/ui-skeleton-input';
import skeletonInputStyles, {
  BASE_INPUT_HEIGHT,
  MD_INPUT_HEIGHT,
  XL_INPUT_HEIGHT,
} from '../../src/components/ui-skeleton-input/styles';
import { baseSkeletonStyle } from '../../src/components/ui-skeletons/base';

import { getById } from './utils/skeleton-dom';

describe('UiSkeletonInput animation toggling', () => {
  it('applies the static (no-animation) style when disableAnimation is true', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonInput id="input-static" disableAnimation />
      </ThemeProvider>
    );

    const input: HTMLElement = getById(container, 'input-static');
    expect(input).toHaveAttribute('id', 'input-static');
    expect(input).toHaveStyle({ animation: 'none' });
  });

  it('keeps the shimmer animation when disableAnimation is false (default)', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonInput id="input-animated" disableAnimation={false} />
      </ThemeProvider>
    );

    const input: HTMLElement = getById(container, 'input-animated');
    expect(input).toHaveAttribute('id', 'input-animated');
    expect(input).not.toHaveStyle({ animation: 'none' });
  });
});

describe('UiSkeletonInput styles', () => {
  it('exposes the static skeleton style with no animation', () => {
    expect(skeletonInputStyles.staticSkeleton).toEqual({
      animation: 'none',
      backgroundSize: '100% 100%',
    });
  });

  it('resolves the inputContainer callback against the theme', () => {
    const resolved: Record<string, unknown> = skeletonInputStyles.inputContainer(
      websiteColorTheme
    ) as Record<string, unknown>;

    expect(resolved.position).toBe('relative');
    expect(resolved.height).toBe(`clamp(${BASE_INPUT_HEIGHT}rem, 4vw, ${XL_INPUT_HEIGHT}rem)`);
    expect(resolved['&::after']).toMatchObject({
      backgroundColor: websiteColorTheme.palette.background.default,
    });
  });

  it('exposes the placeholder style built on the base skeleton style', () => {
    expect(skeletonInputStyles.inputPlaceholder).toMatchObject(baseSkeletonStyle);
  });

  it('exports the documented input height constants', () => {
    expect(BASE_INPUT_HEIGHT).toBe(3);
    expect(MD_INPUT_HEIGHT).toBe(4.9375);
    expect(XL_INPUT_HEIGHT).toBe(4);
  });
});

describe('UiSkeletonInput placeholder styling (mutation guards)', () => {
  function getPlaceholder(container: HTMLElement): HTMLElement {
    // Placeholder is a decorative inner Box exposed only via its class name.
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const el: HTMLElement | null = container.querySelector<HTMLElement>(
      '.ui-skeleton-input__placeholder'
    );
    if (el === null) {
      throw new Error('Expected the skeleton input placeholder to be present');
    }
    return el;
  }

  it('applies the placeholder base styles to the inner element', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonInput id="input-ph-base" />
      </ThemeProvider>
    );

    const placeholder: HTMLElement = getPlaceholder(container);
    expect(placeholder).toHaveStyle({ position: 'absolute' });
    expect(placeholder).toHaveStyle({ width: '9.1875rem' });
    expect(placeholder).toHaveStyle({ zIndex: '1' });
  });

  it('disables the placeholder animation when disableAnimation is set', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonInput id="input-ph-static" disableAnimation />
      </ThemeProvider>
    );

    expect(getPlaceholder(container)).toHaveStyle({ animation: 'none' });
  });
});
