import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiTypography } from '../../src/components';

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
