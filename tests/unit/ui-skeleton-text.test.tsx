import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';

import websiteColorTheme from '../../src/components/ui-color-theme';
import UiSkeletonText from '../../src/components/ui-skeleton-text';
import getTextSkeletonStyles, {
  FIRST_LINE_WIDTH,
  getTextLines,
  getTextLinesContainerStyles,
  LAST_LINE_WIDTH,
  MANY_LINES_GAP,
  MANY_LINES_SIZE,
  MIDDLE_LINE_WIDTH,
  resolveTextSize,
  SINGLE_LINE_SIZE,
} from '../../src/components/ui-skeleton-text/styles';
import { baseSkeletonStyle, SKELETON_BORDER_RADIUS } from '../../src/components/ui-skeletons/base';

import { countBars, getById } from './utils/skeleton-dom';

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

describe('UiSkeletonText many-lines taper', () => {
  it('exposes the taper fractions measured from the 197/157/96 design rows', () => {
    expect(FIRST_LINE_WIDTH).toBe('100%');
    expect(MIDDLE_LINE_WIDTH).toBe('80%');
    expect(LAST_LINE_WIDTH).toBe('50%');
    expect(MANY_LINES_GAP).toBe('6px');
    expect(MANY_LINES_SIZE).toBe('s');
    expect(SINGLE_LINE_SIZE).toBe('m');
  });

  it('tapers a three-line stack full, four-fifths, half', () => {
    expect(getTextLines(3)).toEqual([
      { key: 'line-1', width: '100%' },
      { key: 'line-2', width: '80%' },
      { key: 'line-3', width: '50%' },
    ]);
  });

  it('keeps every line between the first and the last at the middle width', () => {
    expect(getTextLines(5).map(line => line.width)).toEqual(['100%', '80%', '80%', '80%', '50%']);
  });

  it('drops a two-line stack straight from the first width to the last', () => {
    expect(getTextLines(2).map(line => line.width)).toEqual(['100%', '50%']);
  });

  it('builds the stacked column container at the design gap', () => {
    expect(getTextLinesContainerStyles('197px')).toEqual({
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: '197px',
    });
  });

  it('resolves the bar height preset from the line count unless size is explicit', () => {
    expect(resolveTextSize(undefined, 1)).toBe('m');
    expect(resolveTextSize(undefined, 3)).toBe('s');
    expect(resolveTextSize('l', 3)).toBe('l');
    expect(resolveTextSize('s', 1)).toBe('s');
  });

  it('renders the many-lines bars at the 8px Board D row height', () => {
    expect(getTextSkeletonStyles(resolveTextSize(undefined, 3), LAST_LINE_WIDTH).height).toBe(
      '8px'
    );
  });
});

describe('UiSkeletonText many-lines rendering', () => {
  it('stacks one bar per line inside a 6px-gapped column', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonText id="text-many" lines={3} width="197px" />
      </ThemeProvider>
    );

    const stack: HTMLElement = getById(container, 'text-many');
    expect(stack).toHaveStyle({ display: 'flex' });
    expect(stack).toHaveStyle({ flexDirection: 'column' });
    expect(stack).toHaveStyle({ gap: '6px' });
    expect(stack).toHaveStyle({ width: '197px' });
    expect(countBars(stack)).toBe(3);
  });

  it('defaults the stacked column to full width', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonText id="text-many-default-width" lines={2} />
      </ThemeProvider>
    );

    const stack: HTMLElement = getById(container, 'text-many-default-width');
    expect(stack).toHaveStyle({ width: '100%' });
    expect(countBars(stack)).toBe(2);
  });

  it('merges an object (non-array) sx prop onto the stacked column', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonText id="text-many-obj-sx" lines={3} sx={{ marginTop: '10px' }} />
      </ThemeProvider>
    );

    expect(getById(container, 'text-many-obj-sx')).toHaveStyle({ marginTop: '10px' });
  });

  it('merges an array sx prop onto the stacked column', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonText id="text-many-arr-sx" lines={3} sx={[{ marginBottom: '10px' }]} />
      </ThemeProvider>
    );

    expect(getById(container, 'text-many-arr-sx')).toHaveStyle({ marginBottom: '10px' });
  });

  it('keeps the single-bar markup byte-identical when lines is 1', () => {
    const implicit: string = render(<UiSkeletonText id="text-lines-regression" />).container
      .innerHTML;
    const explicit: string = render(<UiSkeletonText id="text-lines-regression" lines={1} />)
      .container.innerHTML;

    expect(explicit).toBe(implicit);
    expect(explicit).not.toContain('flex-direction');
  });

  it('inherits the shared reduced-motion guard on every stacked bar', () => {
    expect(getTextSkeletonStyles(MANY_LINES_SIZE, MIDDLE_LINE_WIDTH)).toMatchObject(
      baseSkeletonStyle
    );
  });
});

describe('UiSkeletonText invalid line counts', () => {
  it('floors a fractional count so the taper still reaches the last width', () => {
    expect(getTextLines(2.5)).toEqual([
      { key: 'line-1', width: FIRST_LINE_WIDTH },
      { key: 'line-2', width: LAST_LINE_WIDTH },
    ]);
  });

  it('resolves every single-bar input to one full-width line, like the component', () => {
    const singleFullLine: { key: string; width: string }[] = [
      { key: 'line-1', width: FIRST_LINE_WIDTH },
    ];

    expect(getTextLines(Number.POSITIVE_INFINITY)).toEqual(singleFullLine);
    expect(getTextLines(Number.NaN)).toEqual(singleFullLine);
    expect(getTextLines(0)).toEqual(singleFullLine);
    expect(getTextLines(-3)).toEqual(singleFullLine);
    expect(getTextLines(1)).toEqual(singleFullLine);
  });

  it('renders the stack a fractional count asks for', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonText id="text-fractional" lines={2.5} />
      </ThemeProvider>
    );

    expect(countBars(getById(container, 'text-fractional'))).toBe(2);
  });

  it.each([
    ['infinite', Number.POSITIVE_INFINITY],
    ['not a number', Number.NaN],
    ['zero', 0],
    ['negative', -3],
  ])('keeps the single-bar markup when lines is %s', (_label, lines) => {
    const expected: string = render(<UiSkeletonText id="text-lines-invalid" />).container.innerHTML;
    const actual: string = render(<UiSkeletonText id="text-lines-invalid" lines={lines} />)
      .container.innerHTML;

    expect(actual).toBe(expected);
    expect(actual).not.toContain('flex-direction');
  });
});
