import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import React from 'react';

import UiForm from '../../src/components/ui-form';

import { emotionCssFor } from './utils/emotion-css';

type Options = {
  submitLoadingMode?: 'aria-disabled' | 'native';
  isSubmitting?: boolean;
  submittingLabel?: string;
  submittingAnnouncement?: boolean;
  submitKitInk?: boolean;
  submitResponsiveLabel?: boolean;
  submitLoadingIndicator?: React.ReactNode;
};

function mountForm(options: Options = {}): void {
  render(
    <ThemeProvider theme={createTheme({ palette: { primary: { main: '#1EAEFF' } } })}>
      <UiForm
        onSubmit={jest.fn()}
        defaultValues={{}}
        title="Sign in"
        submitLabel="Submit"
        submitLoadingMode={options.submitLoadingMode}
        isSubmitting={options.isSubmitting}
        submittingLabel={options.submittingLabel}
        submittingAnnouncement={options.submittingAnnouncement}
        submitKitInk={options.submitKitInk}
        submitResponsiveLabel={options.submitResponsiveLabel}
        submitLoadingIndicator={options.submitLoadingIndicator}
      >
        <span>fields</span>
      </UiForm>
    </ThemeProvider>
  );
}

function submit(): HTMLElement {
  return screen.getByRole('button', { name: /Submit/ });
}

describe('UiForm submit kit ink', () => {
  it('paints the submit label white under an ambient blue primary', () => {
    mountForm({ submitKitInk: true });
    expect(getComputedStyle(submit()).color).toBe('rgb(255, 255, 255)');
  });

  it('clears the hover and active elevation', () => {
    mountForm({ submitKitInk: true });
    const css: string = emotionCssFor(submit());
    expect(css).toMatch(/:hover\s*\{[^}]*box-shadow:\s*none/);
    expect(css).toMatch(/:active\s*\{[^}]*box-shadow:\s*none/);
  });

  it('leaves the ink and elevation alone without the opt-in', () => {
    mountForm();
    expect(getComputedStyle(submit()).color).toBe('var(--variant-containedColor)');
    expect(emotionCssFor(submit())).toMatch(/--variant-containedColor:\s*rgba\(0, 0, 0, 0\.87\)/);
    expect(emotionCssFor(submit())).not.toMatch(/:active\s*\{[^}]*box-shadow:\s*none/);
  });
});

describe('UiForm submit responsive label', () => {
  it('drops the small-screen weight rule when false', () => {
    mountForm({ submitResponsiveLabel: false });
    expect(emotionCssFor(submit())).not.toContain('max-width');
  });

  it('keeps the small-screen weight rule by default', () => {
    mountForm();
    expect(emotionCssFor(submit())).toMatch(/max-width[^{]*\{[^}]*font-weight:\s*400/);
  });
});

describe('UiForm submit loading indicator', () => {
  it('draws the consumer indicator inside the busy native submit', () => {
    mountForm({
      submitLoadingMode: 'native',
      isSubmitting: true,
      submitLoadingIndicator: <span>X</span>,
    });
    expect(within(submit()).getByText('X')).toBeInTheDocument();
  });
});

describe('UiForm native submit announcement', () => {
  it('carries the submitting label while submitting', () => {
    mountForm({
      submitLoadingMode: 'native',
      isSubmitting: true,
      submittingLabel: 'Sending',
    });
    expect(screen.getByRole('status')).toHaveTextContent('Sending');
  });

  it('is mounted and empty while idle', () => {
    mountForm({ submitLoadingMode: 'native', isSubmitting: false });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('falls back to the shared loading copy', () => {
    mountForm({ submitLoadingMode: 'native', isSubmitting: true });
    expect(screen.getByRole('status')).toHaveTextContent('Завантаження');
  });

  it('follows submittingAnnouncement over isSubmitting', () => {
    mountForm({
      submitLoadingMode: 'native',
      isSubmitting: false,
      submittingAnnouncement: true,
      submittingLabel: 'Sending',
    });
    expect(screen.getByRole('status')).toHaveTextContent('Sending');
  });

  it('can silence a submitting form', () => {
    mountForm({
      submitLoadingMode: 'native',
      isSubmitting: true,
      submittingAnnouncement: false,
      submittingLabel: 'Sending',
    });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('keeps only the button status region in the default mode', () => {
    mountForm({ isSubmitting: false });
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });
});
