import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';

import websiteColorTheme from '../../src/components/ui-color-theme';
import UiSkeletonImage from '../../src/components/ui-skeleton-image';
import getImageSkeletonStyles, {
  BLOCK_IMAGE_HEIGHT,
  BLOCK_IMAGE_RADIUS,
  BLOCK_IMAGE_WIDTH,
  ROUND_IMAGE_RADIUS,
  ROUND_IMAGE_SIZE,
} from '../../src/components/ui-skeleton-image/styles';
import { baseSkeletonStyle } from '../../src/components/ui-skeletons/base';

import { getById } from './utils/skeleton-dom';

describe('UiSkeletonImage rendering', () => {
  it('renders the Board D round geometry when no variant is given', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonImage id="image-round-default" />
      </ThemeProvider>
    );

    const image: HTMLElement = getById(container, 'image-round-default');
    expect(image).toHaveAttribute('id', 'image-round-default');
    expect(image).toHaveStyle({ width: '48px' });
    expect(image).toHaveStyle({ height: '48px' });
    expect(image).toHaveStyle({ borderRadius: '50%' });
  });

  it('renders the Board D block geometry for the block variant', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonImage id="image-block" variant="block" />
      </ThemeProvider>
    );

    const image: HTMLElement = getById(container, 'image-block');
    expect(image).toHaveStyle({ width: '260px' });
    expect(image).toHaveStyle({ height: '195px' });
    expect(image).toHaveStyle({ borderRadius: '8px' });
  });

  it('lets width and height overrides win over the variant defaults', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonImage id="image-sized" variant="block" width="160px" height="120px" />
      </ThemeProvider>
    );

    const image: HTMLElement = getById(container, 'image-sized');
    expect(image).toHaveStyle({ width: '160px' });
    expect(image).toHaveStyle({ height: '120px' });
    expect(image).toHaveStyle({ borderRadius: '8px' });
  });

  it('renders with an object (non-array) sx prop merged onto the base style', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonImage id="image-obj-sx" sx={{ marginTop: '4px' }} />
      </ThemeProvider>
    );

    expect(getById(container, 'image-obj-sx')).toHaveStyle({ marginTop: '4px' });
  });

  it('renders with an array sx prop merged after the base style', () => {
    const { container } = render(
      <ThemeProvider theme={websiteColorTheme}>
        <UiSkeletonImage id="image-arr-sx" sx={[{ marginBottom: '8px' }]} />
      </ThemeProvider>
    );

    expect(getById(container, 'image-arr-sx')).toHaveStyle({ marginBottom: '8px' });
  });
});

describe('UiSkeletonImage styles helper', () => {
  it('exposes the measured Board D geometry constants', () => {
    expect(ROUND_IMAGE_SIZE).toBe(48);
    expect(ROUND_IMAGE_RADIUS).toBe('50%');
    expect(BLOCK_IMAGE_WIDTH).toBe(260);
    expect(BLOCK_IMAGE_HEIGHT).toBe(195);
    expect(BLOCK_IMAGE_RADIUS).toBe('8px');
  });

  it('builds the round variant on the shared base skeleton style', () => {
    expect(getImageSkeletonStyles('round')).toEqual({
      ...baseSkeletonStyle,
      width: 48,
      height: 48,
      borderRadius: '50%',
    });
  });

  it('builds the block variant on the shared base skeleton style', () => {
    expect(getImageSkeletonStyles('block')).toEqual({
      ...baseSkeletonStyle,
      width: 260,
      height: 195,
      borderRadius: '8px',
    });
  });

  it('keeps the variant radius while overriding only the supplied dimension', () => {
    expect(getImageSkeletonStyles('round', 72)).toMatchObject({
      width: 72,
      height: 48,
      borderRadius: '50%',
    });
    expect(getImageSkeletonStyles('block', undefined, 90)).toMatchObject({
      width: 260,
      height: 90,
      borderRadius: '8px',
    });
  });
});
