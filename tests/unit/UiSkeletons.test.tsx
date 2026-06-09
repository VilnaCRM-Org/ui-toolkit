import { render, screen } from '@testing-library/react';
import React from 'react';

import {
  UiSkeletonBlock,
  UiSkeletonButton,
  UiSkeletonInput,
  UiSkeletonText,
} from '../../src/components';

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
