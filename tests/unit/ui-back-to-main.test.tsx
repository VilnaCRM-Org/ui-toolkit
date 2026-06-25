import { createTheme, ThemeProvider } from '@mui/material/styles';
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

  it('derives the accessible name from visible text when label is a non-string node', () => {
    render(<UiBackToMain label={<span>Go back home</span>} />);

    // A node label sets no aria-label override; the name comes from visible content.
    const link: HTMLElement = screen.getByRole('link', { name: 'Go back home' });
    expect(link).not.toHaveAttribute('aria-label');
  });

  it('renders within a parent theme whose primary colour resolves', () => {
    const themed: ReturnType<typeof createTheme> = createTheme({
      palette: { primary: { main: '#1EAEFF' } },
    });

    render(
      <ThemeProvider theme={themed}>
        <UiBackToMain />
      </ThemeProvider>
    );

    expect(screen.getByRole('link', { name: 'Back to main' })).toBeInTheDocument();
  });

  it('falls back to the default outline when the theme primary colour is empty', () => {
    // createTheme rejects an empty `main` during palette augmentation, so build a
    // valid theme then blank out primary.main to exercise the falsy ternary branch
    // in buildBackButton (the hard-coded '#1976d2' outline fallback).
    const themed: ReturnType<typeof createTheme> = createTheme();
    themed.palette.primary.main = '';

    render(
      <ThemeProvider theme={themed}>
        <UiBackToMain />
      </ThemeProvider>
    );

    expect(screen.getByRole('link', { name: 'Back to main' })).toBeInTheDocument();
  });
});

describe('UiBackToMain default icon', () => {
  it('renders the default back arrow when no icon prop is supplied', (): void => {
    render(<UiBackToMain />);

    const arrow: HTMLElement = screen.getByText('←');
    expect(arrow.tagName).toBe('SPAN');
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the default icon inline typography styles', (): void => {
    render(<UiBackToMain />);

    const arrow: HTMLElement = screen.getByText('←');
    expect(arrow).toHaveStyle({ fontSize: '1rem' });
    expect(arrow).toHaveStyle({ lineHeight: '1' });
  });

  it('omits the default arrow when a custom icon replaces it', (): void => {
    render(<UiBackToMain icon={<span>home</span>} />);

    expect(screen.queryByText('←')).not.toBeInTheDocument();
  });
});
