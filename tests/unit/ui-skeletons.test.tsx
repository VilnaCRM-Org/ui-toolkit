import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';

import {
  UiSkeletonBlock,
  UiSkeletonButton,
  UiSkeletonInput,
  UiSkeletonText,
} from '../../src/components';
import websiteColorTheme from '../../src/components/ui-color-theme';
import getBlockSkeletonStyles from '../../src/components/ui-skeleton-block/styles';
import skeletonButtonStyles from '../../src/components/ui-skeleton-button/styles';
import skeletonInputStyles, {
  BASE_INPUT_HEIGHT,
  MD_INPUT_HEIGHT,
  XL_INPUT_HEIGHT,
} from '../../src/components/ui-skeleton-input/styles';
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
import getTextSkeletonStyles from '../../src/components/ui-skeleton-text/styles';

function getById(container: HTMLElement, id: string): HTMLElement {
  // Skeleton primitives are decorative (no role/label); they expose a stable id only.
  // eslint-disable-next-line testing-library/no-node-access
  const el: HTMLElement | null = container.querySelector<HTMLElement>(`#${id}`);
  if (el === null) {
    throw new Error(`Expected element #${id} to be present in the rendered skeleton`);
  }
  return el;
}

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

describe('UiSkeletonBlock sx merging', () => {
  it('renders within a ThemeProvider when given an object (non-array) sx prop', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonBlock id="block-obj-sx" sx={{ marginTop: '4px' }} />
      </ThemeProvider>
    );

    const block: HTMLElement = getById(container, 'block-obj-sx');
    expect(block).toBeInTheDocument();
    expect(block).toHaveStyle({ marginTop: '4px' });
  });

  it('renders with an array sx prop merged after the base styles', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonBlock id="block-arr-sx" sx={[{ marginBottom: '8px' }]} />
      </ThemeProvider>
    );

    expect(getById(container, 'block-arr-sx')).toHaveStyle({ marginBottom: '8px' });
  });
});

describe('UiSkeletonButton sx merging', () => {
  it('renders with an object (non-array) sx prop merged onto the button base style', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonButton id="button-obj-sx" sx={{ opacity: 0.5 }} />
      </ThemeProvider>
    );

    expect(getById(container, 'button-obj-sx')).toHaveStyle({ opacity: '0.5' });
  });

  it('renders with an array sx prop', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonButton id="button-arr-sx" sx={[{ opacity: 0.25 }]} />
      </ThemeProvider>
    );

    expect(getById(container, 'button-arr-sx')).toHaveStyle({ opacity: '0.25' });
  });
});

describe('UiSkeletonText sx merging and sizes', () => {
  it('renders with an object (non-array) sx prop', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonText id="text-obj-sx" sx={{ marginLeft: '2px' }} />
      </ThemeProvider>
    );

    expect(getById(container, 'text-obj-sx')).toHaveStyle({ marginLeft: '2px' });
  });

  it('renders with an array sx prop and a custom width', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonText id="text-arr-sx" width="50%" sx={[{ marginRight: '2px' }]} />
      </ThemeProvider>
    );

    expect(getById(container, 'text-arr-sx')).toHaveStyle({ marginRight: '2px' });
  });
});

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

describe('UiSkeletonBlock styles helper', () => {
  it('merges base styles with the provided dimensions', () => {
    const result: ReturnType<typeof getBlockSkeletonStyles> = getBlockSkeletonStyles(
      '120px',
      '40px',
      '4px'
    );

    expect(result).toMatchObject({
      ...baseSkeletonStyle,
      width: '120px',
      height: '40px',
      borderRadius: '4px',
    });
  });

  it('passes through numeric dimension values unchanged', () => {
    expect(getBlockSkeletonStyles(200, 60, 10)).toMatchObject({
      width: 200,
      height: 60,
      borderRadius: 10,
    });
  });
});

describe('UiSkeletonText styles helper', () => {
  it.each([
    ['s', '8px'],
    ['m', '12px'],
    ['l', '18px'],
  ] as const)('returns the %s size height (%s)', (size, expectedHeight) => {
    const result: ReturnType<typeof getTextSkeletonStyles> = getTextSkeletonStyles(size, '100%');

    expect(result.height).toBe(expectedHeight);
    expect(result.width).toBe('100%');
    expect(result.borderRadius).toBe(SKELETON_BORDER_RADIUS);
    expect(result).toMatchObject(baseSkeletonStyle);
  });

  it('passes a numeric width through unchanged', () => {
    expect(getTextSkeletonStyles('m', 240).width).toBe(240);
  });
});

describe('UiSkeletonButton styles object', () => {
  it('uses the shared border colour, radius and base skeleton style', () => {
    expect(skeletonButtonStyles.buttonSkeleton).toMatchObject({
      ...baseSkeletonStyle,
      border: `1px solid ${SKELETON_BORDER_COLOR}`,
      borderRadius: SKELETON_BORDER_RADIUS,
    });
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

describe('UiSkeletons reduced-motion', () => {
  it('suppresses the shimmer animation under prefers-reduced-motion', () => {
    expect(baseSkeletonStyle['@media (prefers-reduced-motion: reduce)']).toEqual({
      animation: 'none',
    });
  });
});
