import { render } from '@testing-library/react';
import React from 'react';

import { UiTypography } from '../../components';

import { testText } from './constants';

describe('UiTypography', () => {
  it('should render the Typography component with the correct props', () => {
    const { getByText } = render(
      <UiTypography component="a" variant="h1">
        {testText}
      </UiTypography>
    );

    const typography: HTMLElement = getByText(testText);
    expect(typography).toBeInTheDocument();
  });

  it('should render the Typography component with the default props', () => {
    const { getByText } = render(<UiTypography>{testText}</UiTypography>);

    const typography: HTMLElement = getByText(testText);
    expect(typography.tagName).toBe('P');
  });

  it('renders with default component "p" when component prop is not provided', () => {
    const { container } = render(<UiTypography>Test Text</UiTypography>);
    const element: HTMLElement | null = container.querySelector('p');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Test Text');
  });

  it('renders with specified component when component prop is provided', () => {
    const { container } = render(<UiTypography component="h1">Test Text</UiTypography>);
    const element: HTMLElement | null = container.querySelector('h1');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Test Text');
  });
});
