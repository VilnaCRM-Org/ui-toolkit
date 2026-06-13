import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiBackToMain } from '../../src/components';

describe('UiBackToMain', () => {
  it('renders a default back-to-main link', () => {
    render(<UiBackToMain />);

    const link: HTMLElement = screen.getByRole('link', { name: 'Back to main' });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toBeInTheDocument();
  });

  it('supports custom label and destination', () => {
    render(<UiBackToMain label="Return home" to="/dashboard" />);

    const link: HTMLElement = screen.getByRole('link', { name: 'Return home' });
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders a custom icon when provided', () => {
    render(<UiBackToMain icon={<span data-testid="custom-back-icon">icon</span>} />);

    expect(screen.getByTestId('custom-back-icon')).toBeInTheDocument();
  });
});
