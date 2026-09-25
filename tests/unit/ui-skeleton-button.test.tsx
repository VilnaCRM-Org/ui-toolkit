import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';

import websiteColorTheme from '../../src/components/ui-color-theme';
import UiSkeletonButton from '../../src/components/ui-skeleton-button';
import skeletonButtonStyles from '../../src/components/ui-skeleton-button/styles';
import {
  baseSkeletonStyle,
  SKELETON_BORDER_COLOR,
  SKELETON_BORDER_RADIUS,
} from '../../src/components/ui-skeletons/base';

import { getById } from './utils/skeleton-dom';

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

describe('UiSkeletonButton styles object', () => {
  it('uses the shared border colour, radius and base skeleton style', () => {
    expect(skeletonButtonStyles.buttonSkeleton).toMatchObject({
      ...baseSkeletonStyle,
      border: `1px solid ${SKELETON_BORDER_COLOR}`,
      borderRadius: SKELETON_BORDER_RADIUS,
    });
  });
});
