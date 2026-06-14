import { SxProps, Theme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiImage } from '../../src/components';

import { testImg, testText } from './constants';

function getWrapper(image: HTMLElement): HTMLElement {
  // The MUI Box wrapper renders a non-semantic <div> (role "generic") that
  // carries the merged sx styles and exposes no accessible query, so we reach
  // it through the image's parent to assert the wrapper styling.
  // eslint-disable-next-line testing-library/no-node-access
  const wrapper: HTMLElement | null = image.parentElement;

  if (!wrapper) {
    throw new Error('UiImage wrapper element was not found');
  }

  return wrapper;
}

describe('UiImage', () => {
  it('renders the image with the correct props', () => {
    render(<UiImage alt={testText} src={testImg} sx={{ borderRadius: '8px' }} />);

    const image: HTMLElement = screen.getByAltText(testText);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', testImg);
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveStyle({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    });
    expect(getWrapper(image)).toHaveStyle({ borderRadius: '8px' });
  });

  it('accepts object-based image sources', () => {
    render(<UiImage alt={testText} src={{ src: testImg }} />);

    expect(screen.getByAltText(testText)).toHaveAttribute('src', testImg);
  });

  it('merges array-based sx with the wrapper styles', () => {
    const sx: SxProps<Theme> = [{ borderRadius: '12px' }, { opacity: 0.5 }];
    render(<UiImage alt={testText} src={testImg} sx={sx} />);

    const image: HTMLElement = screen.getByAltText(testText);
    expect(image).toHaveStyle({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    });
    expect(getWrapper(image)).toHaveStyle({
      borderRadius: '12px',
      opacity: '0.5',
    });
  });

  it('applies only the wrapper styles when sx is omitted', () => {
    render(<UiImage alt={testText} src={testImg} />);

    const image: HTMLElement = screen.getByAltText(testText);
    expect(image).toHaveStyle({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    });
  });
});
