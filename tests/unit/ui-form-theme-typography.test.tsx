import { ThemeProvider, createTheme, type Theme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { sharedPalette } from '../../src/components/ui-color-theme';
import UiForm from '../../src/components/ui-form';

import { emotionCssFor } from './utils/emotion-css';

const APP_FACE: string = 'AppFace';
const appTheme: Theme = createTheme({ typography: { fontFamily: APP_FACE } });

type FormOptions = { inheritTheme?: boolean; submitFocusOutline?: boolean };

function renderForm({ inheritTheme, submitFocusOutline }: FormOptions = {}): void {
  render(
    <ThemeProvider theme={appTheme}>
      <UiForm
        onSubmit={jest.fn()}
        defaultValues={{}}
        title="Sign in"
        subtitle="Welcome back"
        error="Sign-in failed"
        submitLabel="Submit"
        inheritTheme={inheritTheme}
        submitFocusOutline={submitFocusOutline}
      >
        <span />
      </UiForm>
    </ThemeProvider>
  );
}

describe('UiForm inheritTheme', () => {
  it('renders the error banner in the app theme typography', () => {
    renderForm({ inheritTheme: true });

    expect(screen.getByRole('alert')).toHaveStyle({ fontFamily: APP_FACE });
  });

  it('keeps the error banner on the kit typography by default', () => {
    renderForm();

    expect(screen.getByRole('alert')).not.toHaveStyle({ fontFamily: APP_FACE });
  });

  it('keeps the title and subtitle styling while taking the app variants', () => {
    renderForm({ inheritTheme: true });

    expect(screen.getByText('Sign in')).toHaveStyle({ fontWeight: '700', fontSize: '1.375rem' });
    expect(screen.getByText('Welcome back')).toHaveStyle({ fontSize: '0.9375rem' });
  });
});

describe('UiForm submitFocusOutline', () => {
  const ring: RegExp = new RegExp(
    `:focus-visible\\s*\\{[^}]*outline:\\s*2px solid ${sharedPalette.grey200.main}`
  );

  it('forwards the focus ring to the submit button', () => {
    renderForm({ submitFocusOutline: true });

    expect(emotionCssFor(screen.getByRole('button', { name: 'Submit' }))).toMatch(ring);
  });

  it('leaves the submit button without the ring by default', () => {
    renderForm();

    expect(emotionCssFor(screen.getByRole('button', { name: 'Submit' }))).not.toMatch(ring);
  });
});
