import { createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import AuthSkeleton from '../../src/components/auth-skeleton';
import UiForm from '../../src/components/ui-form';
import UiThemeProvider from '../../src/components/ui-theme-provider';
import { smUpQuery } from '../../src/utils/ui-breakpoint-queries';
import { createUiTheme } from '../../src/utils/ui-theme';

import { emotionCssFor } from './utils/emotion-css';

describe('smUpQuery', () => {
  it('uses the website sm breakpoint for a theme without the kit tokens', () => {
    expect(smUpQuery(createTheme())).toBe('@media (min-width:640px)');
  });

  it('uses the crm sm breakpoint for a crm kit theme', () => {
    expect(smUpQuery(createUiTheme({ variant: 'crm' }))).toBe('@media (min-width:480px)');
  });
});

describe('sm-bound styles under the crm theme', () => {
  it('moves the form subtitle switch to the crm breakpoint', () => {
    render(
      <UiThemeProvider variant="crm">
        <UiForm
          onSubmit={jest.fn()}
          defaultValues={{}}
          title="Sign in"
          subtitle="Welcome"
          submitLabel="Go"
        >
          <span>fields</span>
        </UiForm>
      </UiThemeProvider>
    );
    expect(emotionCssFor(screen.getByText('Welcome'))).toMatch(/min-width:\s*480px/);
  });

  it('moves the skeleton subtitle and field gaps to the crm breakpoint', () => {
    const { container } = render(
      <UiThemeProvider variant="crm">
        <AuthSkeleton idPrefix="" />
      </UiThemeProvider>
    );
    /* eslint-disable testing-library/no-node-access, testing-library/no-container */
    const subtitle: HTMLElement = container.querySelector('#auth-skeleton-subtitle') as HTMLElement;
    const fieldRow: HTMLElement = container.querySelector('#auth-skeleton-field-label-1')
      ?.parentElement as HTMLElement;
    /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    expect(emotionCssFor(subtitle)).toMatch(/min-width:\s*480px/);
    expect(emotionCssFor(fieldRow)).toMatch(/min-width:\s*480px/);
  });
});
