import { render, screen } from '@testing-library/react';
import React from 'react';

import UiButton from '../../src/components/ui-button';
import { buttonSx } from '../../src/components/ui-button/styles';
import { uiTheme } from '../../src/components/ui-theme-provider';

import { emotionCssFor } from './utils/emotion-css';

describe('UiButton native loading mode', () => {
  it('goes natively disabled while loading', () => {
    render(
      <UiButton variant="contained" loadingMode="native" loading>
        Save
      </UiButton>
    );
    const button: HTMLElement = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('stays enabled when idle and honours an explicit disabled', () => {
    const { rerender } = render(
      <UiButton loadingMode="native" loading={false}>
        Save
      </UiButton>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    rerender(
      <UiButton loadingMode="native" loading={false} disabled>
        Save
      </UiButton>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('renders no status region of its own', () => {
    render(
      <UiButton loadingMode="native" loading>
        Save
      </UiButton>
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('draws the consumer loading indicator', () => {
    render(
      <UiButton loadingMode="native" loading loadingIndicator={<span>custom arc</span>}>
        Save
      </UiButton>
    );
    expect(screen.getByText('custom arc')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
  });

  it('falls back to the shared spinner without an indicator', () => {
    render(
      <UiButton loadingMode="native" loading>
        Save
      </UiButton>
    );
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('ignores the consumer indicator in the default mode', () => {
    render(
      <UiButton loading loadingIndicator={<span>custom arc</span>}>
        Save
      </UiButton>
    );
    expect(screen.queryByText('custom arc')).not.toBeInTheDocument();
  });

  it('hides the label ink over the disabled fill', () => {
    render(
      <UiButton variant="contained" loadingMode="native" loading>
        Save
      </UiButton>
    );
    const css: string = emotionCssFor(screen.getByRole('button', { name: 'Save' }));
    expect(css).toMatch(/:disabled\s*\{[^}]*color:\s*transparent/);
  });

  it('adds the disabled-ink rule only when native and busy', () => {
    const nativeBusy: unknown[] = buttonSx(
      uiTheme,
      { busy: true, native: true },
      undefined
    ) as unknown[];
    const ariaBusy: unknown[] = buttonSx(uiTheme, { busy: true }, undefined) as unknown[];
    const nativeIdle: unknown[] = buttonSx(
      uiTheme,
      { busy: false, native: true },
      undefined
    ) as unknown[];
    expect(nativeBusy).toContainEqual({ '&:disabled': { color: 'transparent' } });
    expect(ariaBusy).not.toContainEqual({ '&:disabled': { color: 'transparent' } });
    expect(nativeIdle).not.toContainEqual({ '&:disabled': { color: 'transparent' } });
  });
});

describe('UiButton status region', () => {
  it('is absent when the button never loads', () => {
    render(<UiButton>Save</UiButton>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('is mounted as soon as loading is defined', () => {
    render(<UiButton loading={false}>Save</UiButton>);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
