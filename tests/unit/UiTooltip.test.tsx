import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiTooltip } from '../../src/components';
import theme from '../../src/components/UiTooltip/theme';

import { testText } from './constants';

const title: string = testText;
const placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
const sx: object = { color: 'red' };
const children: React.ReactNode = <div>{testText}</div>;

describe('UiTooltip', () => {
  it('renders the tooltip with the correct props', () => {
    render(
      <ThemeProvider theme={theme}>
        <UiTooltip title={title} placement={placement} arrow sx={sx}>
          {children}
        </UiTooltip>
      </ThemeProvider>
    );

    const trigger: HTMLElement = screen.getByText(testText);

    expect(trigger).toBeInTheDocument();
  });
});
