import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';

import {
  UiSkeletonBlock,
  UiSkeletonButton,
  UiSkeletonInput,
  UiSkeletonText,
} from '../../src/components';
import websiteColorTheme from '../../src/components/UiColorTheme';
import getBlockSkeletonStyles from '../../src/components/UiSkeletonBlock/styles';
import skeletonButtonStyles from '../../src/components/UiSkeletonButton/styles';
import skeletonInputStyles, {
  BASE_INPUT_HEIGHT,
  MD_INPUT_HEIGHT,
  XL_INPUT_HEIGHT,
} from '../../src/components/UiSkeletonInput/styles';
import {
  baseSkeletonStyle,
  shadowPulseAnimation,
  shimmerAnimation,
  shimmerGradient,
  SKELETON_BORDER_COLOR,
  SKELETON_BORDER_RADIUS,
  SMALL_MOBILE_BREAKPOINT,
  SMALL_MOBILE_BREAKPOINT_UPPER,
} from '../../src/components/UiSkeletons/base';
import getTextSkeletonStyles from '../../src/components/UiSkeletonText/styles';

describe('UiSkeleton primitives', () => {
  it('renders UiSkeletonBlock with a custom id', () => {
    render(<UiSkeletonBlock id="block-skeleton" />);
    expect(screen.getByTestId('ui-skeleton-block')).toHaveAttribute('id', 'block-skeleton');
  });

  it('renders UiSkeletonText with a custom id', () => {
    render(<UiSkeletonText id="text-skeleton" />);
    expect(screen.getByTestId('ui-skeleton-text')).toHaveAttribute('id', 'text-skeleton');
  });

  it('renders UiSkeletonButton with a custom id', () => {
    render(<UiSkeletonButton id="button-skeleton" />);
    expect(screen.getByTestId('ui-skeleton-button')).toHaveAttribute('id', 'button-skeleton');
  });

  it('renders UiSkeletonInput with a custom id', () => {
    render(<UiSkeletonInput id="input-skeleton" />);
    expect(screen.getByTestId('ui-skeleton-input')).toHaveAttribute('id', 'input-skeleton');
  });
});

describe('UiSkeletonBlock sx merging', () => {
  it('renders within a ThemeProvider when given an object (non-array) sx prop', () => {
    render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonBlock id="block-obj-sx" sx={{ marginTop: '4px' }} />
      </ThemeProvider>
    );

    const block: HTMLElement = screen.getByTestId('ui-skeleton-block');
    expect(block).toBeInTheDocument();
    expect(block).toHaveStyle({ marginTop: '4px' });
  });

  it('renders with an array sx prop merged after the base styles', () => {
    render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonBlock id="block-arr-sx" sx={[{ marginBottom: '8px' }]} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('ui-skeleton-block')).toHaveStyle({ marginBottom: '8px' });
  });
});

describe('UiSkeletonButton sx merging', () => {
  it('renders with an object (non-array) sx prop merged onto the button base style', () => {
    render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonButton id="button-obj-sx" sx={{ opacity: 0.5 }} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('ui-skeleton-button')).toHaveStyle({ opacity: '0.5' });
  });

  it('renders with an array sx prop', () => {
    render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonButton id="button-arr-sx" sx={[{ opacity: 0.25 }]} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('ui-skeleton-button')).toHaveStyle({ opacity: '0.25' });
  });
});

describe('UiSkeletonText sx merging and sizes', () => {
  it('renders with an object (non-array) sx prop', () => {
    render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonText id="text-obj-sx" sx={{ marginLeft: '2px' }} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('ui-skeleton-text')).toHaveStyle({ marginLeft: '2px' });
  });

  it('renders with an array sx prop and a custom width', () => {
    render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonText id="text-arr-sx" width="50%" sx={[{ marginRight: '2px' }]} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('ui-skeleton-text')).toHaveStyle({ marginRight: '2px' });
  });
});

describe('UiSkeletonInput animation toggling', () => {
  it('applies the static (no-animation) style when disableAnimation is true', () => {
    render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonInput id="input-static" disableAnimation />
      </ThemeProvider>
    );

    const input: HTMLElement = screen.getByTestId('ui-skeleton-input');
    expect(input).toHaveAttribute('id', 'input-static');
    expect(input).toHaveStyle({ animation: 'none' });
  });

  it('keeps the shimmer animation when disableAnimation is false (default)', () => {
    render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonInput id="input-animated" disableAnimation={false} />
      </ThemeProvider>
    );

    const input: HTMLElement = screen.getByTestId('ui-skeleton-input');
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
    const result: ReturnType<typeof getBlockSkeletonStyles> = getBlockSkeletonStyles(200, 60, 10);

    expect(result.width).toBe(200);
    expect(result.height).toBe(60);
    expect(result.borderRadius).toBe(10);
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
    const resolved: ReturnType<typeof skeletonInputStyles.inputContainer> =
      skeletonInputStyles.inputContainer(websiteColorTheme);

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
