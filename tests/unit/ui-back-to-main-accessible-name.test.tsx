import { render, screen } from '@testing-library/react';
import React from 'react';

import UiBackToMain from '../../src/components/ui-back-to-main';

describe('UiBackToMain accessible name', () => {
  it('names the link from its visible string label without an aria-label attribute', () => {
    render(<UiBackToMain label="Back" />);

    const link: HTMLElement = screen.getByRole('link', { name: 'Back' });
    expect(link).not.toHaveAttribute('aria-label');
    expect(link).toHaveTextContent('Back');
  });

  it('renders no aria-label attribute with the default label', () => {
    render(<UiBackToMain />);

    expect(screen.getByRole('link', { name: 'Back to main' })).not.toHaveAttribute('aria-label');
  });

  it('forwards an explicit aria-label to the link', () => {
    render(<UiBackToMain label="Back" aria-label="Return to dashboard" />);

    const link: HTMLElement = screen.getByRole('link', { name: 'Return to dashboard' });
    expect(link).toHaveAttribute('aria-label', 'Return to dashboard');
    expect(link).toHaveTextContent('Back');
  });
});
