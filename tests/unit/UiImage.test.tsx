import { render } from '@testing-library/react';
import React from 'react';

import { UiImage } from '../../src/components';

import { testImg, testText } from './constants';

describe('UiImage', () => {
  it('renders the image with the correct props', () => {
    const { getByAltText } = render(
      <UiImage alt={testText} src={testImg} sx={{ borderRadius: '8px' }} />
    );

    const image: HTMLElement = getByAltText(testText);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', testImg);
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveStyle({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    });
    expect(image.parentElement).toHaveStyle({ borderRadius: '8px' });
  });

  it('accepts object-based image sources', () => {
    const { getByAltText } = render(<UiImage alt={testText} src={{ src: testImg }} />);

    expect(getByAltText(testText)).toHaveAttribute('src', testImg);
  });
});
