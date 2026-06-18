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

describe('UiTypography default component vs variant mapping', () => {
  it('forces the default "p" element even when a non-"p" variant is set', (): void => {
    // component defaults to 'p' regardless of variant. Kills StringLiteral
    // `component || 'p'` -> `component || ''`: with '' MUI Typography falls back to
    // its variant mapping (variant="h1" -> <h1>) instead of the forced <p>.
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
