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
    render(<UiBackToMain icon={<span>icon glyph</span>} />);

    expect(screen.getByText('icon glyph')).toBeInTheDocument();
  });

  it('derives the accessible name from visible text when label is a non-string node', () => {
    render(<UiBackToMain label={<span>Go back home</span>} />);

    // A node label sets no aria-label override; the name comes from visible content.
    const link: HTMLElement = screen.getByRole('link', { name: 'Go back home' });
    expect(link).not.toHaveAttribute('aria-label');
  });

  it('keeps a custom icon outside the accessible name (decorative icon box)', () => {
    render(<UiBackToMain icon={<span>noisy glyph</span>} />);

    // The icon box is aria-hidden, so consumer glyph content never pollutes the name.
    expect(screen.getByRole('link', { name: 'Back to main' })).toBeInTheDocument();
  });
});

describe('UiBackToMain default icon', () => {
  it('renders the CRM chevron SVG when no icon prop is supplied', (): void => {
    render(<UiBackToMain />);

    const link: HTMLElement = screen.getByRole('link', { name: 'Back to main' });
    const chevron: SVGElement | null = link.querySelector('svg');
    expect(chevron).not.toBeNull();
    // The CRM back-arrow export geometry: an 8x14 chevron at stroke 2, round caps.
    expect(chevron).toHaveAttribute('viewBox', '0 0 8 14');
    const path: SVGElement | null = (chevron as SVGElement).querySelector('path');
    expect(path).toHaveAttribute('d', 'M7 13L1 7L7 1');
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('stroke-width', '2');
  });

  it('marks the default chevron decorative for assistive tech', (): void => {
    render(<UiBackToMain />);

    const link: HTMLElement = screen.getByRole('link', { name: 'Back to main' });
    const chevron: SVGElement | null = link.querySelector('svg');
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
    expect(chevron).toHaveAttribute('focusable', 'false');
  });

  it('omits the default chevron when a custom icon replaces it', (): void => {
    render(<UiBackToMain icon={<span>home</span>} />);

    const link: HTMLElement = screen.getByRole('link', { name: 'Back to main' });
    expect(link.querySelector('svg')).toBeNull();
  });
});
