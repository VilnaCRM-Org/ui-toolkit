import { SxProps, Theme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiImage from '../../src/components/ui-image';

import { testImg, testText } from './constants';
import mockConsoleWarn from './utils/mock-console-warn';

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

describe('UiImage missing-src degradation', () => {
  const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

  // The strict `src` type forbids nullish values, but runtime data (a CMS/API
  // URL still loading) can supply one; the component must degrade, not crash.
  const nullishSrc: string = undefined as unknown as string;

  it('renders the styled wrapper with no <img> when src is nullish', () => {
    const { container } = render(<UiImage alt={testText} src={nullishSrc} />);

    // The Box wrapper (a <div>) still renders; only the <img> is dropped.
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByAltText(testText)).not.toBeInTheDocument();
  });

  it('drops the <img> when an object src carries a nullish url', () => {
    render(<UiImage alt={testText} src={{ src: undefined as unknown as string }} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('warns in development when src is nullish', () => {
    render(<UiImage alt={testText} src={nullishSrc} />);

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('nullish'));
  });

  it('stays silent when a valid src is provided', () => {
    render(<UiImage alt={testText} src={testImg} />);

    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('emits no warning in production even when src is nullish', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(<UiImage alt={testText} src={nullishSrc} />);
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('re-warns when a valid src is later cleared to nullish', () => {
    // The warning lives in an effect keyed to the derived state, so a
    // valid→nullish transition must re-log (guards against a mount-only cache).
    const { rerender } = render(<UiImage alt={testText} src={testImg} />);
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(<UiImage alt={testText} src={nullishSrc} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('nullish'));
  });
});
