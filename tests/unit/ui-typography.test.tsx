import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiTypography from '../../src/components/ui-typography';
import { fontFamilies } from '../../src/utils/font-tokens';
import { createUiTheme } from '../../src/utils/ui-theme';

import { testText } from './constants';

describe('UiTypography', () => {
  it('should render the Typography component with the correct props', () => {
    render(
      <UiTypography component="a" variant="h1">
        {testText}
      </UiTypography>
    );

    const typography: HTMLElement = screen.getByText(testText);
    expect(typography).toBeInTheDocument();
    expect(typography.tagName).toBe('A');
    expect(typography.className).toMatch(/MuiTypography-h1/);
  });

  it('should render the Typography component with the default props', () => {
    render(<UiTypography>{testText}</UiTypography>);

    const typography: HTMLElement = screen.getByText(testText);
    expect(typography.tagName).toBe('P');
  });

  it('renders with default component "p" when component prop is not provided', () => {
    render(<UiTypography>Test Text</UiTypography>);
    const element: HTMLElement = screen.getByText('Test Text');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('P');
    expect(element).toHaveTextContent('Test Text');
  });

  it('renders with specified component when component prop is provided', () => {
    render(<UiTypography component="h1">Test Text</UiTypography>);
    const element: HTMLElement = screen.getByRole('heading', { name: 'Test Text' });
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('H1');
    expect(element).toHaveTextContent('Test Text');
  });

  it('forwards htmlFor when rendered as a label', () => {
    render(
      <UiTypography component="label" htmlFor="email-field">
        {testText}
      </UiTypography>
    );

    const label: HTMLElement = screen.getByText(testText);
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'email-field');
  });
});

describe('UiTypography default component vs variant mapping', () => {
  it('forces the default "p" element even when a non-"p" variant is set', (): void => {
    render(<UiTypography variant="h1">{testText}</UiTypography>);

    expect(screen.getByText(testText).tagName).toBe('P');
  });
});

describe('UiTypography htmlFor branch', () => {
  it('does not forward htmlFor on a non-label component', (): void => {
    render(
      <UiTypography component="span" htmlFor="email-field">
        {testText}
      </UiTypography>
    );

    const element: HTMLElement = screen.getByText(testText);
    expect(element.tagName).toBe('SPAN');
    expect(element).not.toHaveAttribute('for');
  });

  it('does not forward htmlFor on the default component', (): void => {
    render(<UiTypography htmlFor="email-field">{testText}</UiTypography>);

    const element: HTMLElement = screen.getByText(testText);
    expect(element.tagName).toBe('P');
    expect(element).not.toHaveAttribute('for');
  });

  it('does not add a for attribute on a label without htmlFor', (): void => {
    render(<UiTypography component="label">{testText}</UiTypography>);

    const element: HTMLElement = screen.getByText(testText);
    expect(element.tagName).toBe('LABEL');
    expect(element).not.toHaveAttribute('for');
  });
});

describe('UiTypography theming', () => {
  it('paints the toolkit variant with no provider', (): void => {
    render(<UiTypography variant="bodyText16">{testText}</UiTypography>);

    expect(screen.getByText(testText)).toHaveStyle({
      color: 'rgb(26, 28, 30)',
      fontSize: '1rem',
      lineHeight: '1.625rem',
    });
  });

  it('paints the golos body1 style when no variant is given', (): void => {
    render(<UiTypography>{testText}</UiTypography>);

    expect(screen.getByText(testText)).toHaveStyle({ fontFamily: fontFamilies.golos });
  });

  it('keeps consumer sx after the variant style', (): void => {
    render(
      <UiTypography variant="bodyText16" sx={[{ color: '#00ff00' }]}>
        {testText}
      </UiTypography>
    );

    expect(screen.getByText(testText)).toHaveStyle({ color: 'rgb(0, 255, 0)' });
  });

  it('follows a consumer theme palette override', (): void => {
    render(
      <ThemeProvider theme={createUiTheme({ palette: { darkPrimary: { main: '#ff0000' } } })}>
        <UiTypography variant="bodyText16">{testText}</UiTypography>
      </ThemeProvider>
    );

    expect(screen.getByText(testText)).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
