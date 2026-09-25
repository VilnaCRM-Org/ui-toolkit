import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';

import websiteColorTheme from '../../src/components/ui-color-theme';
import UiSkeletonBlock from '../../src/components/ui-skeleton-block';
import getBlockSkeletonStyles from '../../src/components/ui-skeleton-block/styles';
import { baseSkeletonStyle } from '../../src/components/ui-skeletons/base';

import { getById } from './utils/skeleton-dom';

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
