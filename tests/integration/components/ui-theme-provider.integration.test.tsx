import type { ThemeOptions } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiButton from '../../../src/components/ui-button';
import UiInput from '../../../src/components/ui-input';
import UiLink from '../../../src/components/ui-link';
import UiThemeProvider from '../../../src/components/ui-theme-provider';
import UiToolbar from '../../../src/components/ui-toolbar';
import UiTooltip from '../../../src/components/ui-tooltip';
import UiTypography from '../../../src/components/ui-typography';

const RED: string = 'rgb(255, 0, 0)';

const consumerTheme = {
  palette: {
    primary: { main: '#ff0000' },
    darkPrimary: { main: '#ff0000' },
    grey400: { main: '#ff0000' },
  },
  mixins: { toolbar: { minHeight: 99 } },
} as ThemeOptions;

function renderApp(): void {
  render(
    <UiThemeProvider theme={consumerTheme}>
      <UiToolbar>
        <UiButton variant="contained" size="small">
          Save
        </UiButton>
        <UiLink href="/docs">Docs</UiLink>
        <UiTypography variant="bodyText16">Body copy</UiTypography>
        <UiInput label="Name" />
        <UiTooltip title="Tooltip body" triggerLabel="More info">
          <UiTypography variant="bodyText16" component="span">
            More
          </UiTypography>
        </UiTooltip>
      </UiToolbar>
    </UiThemeProvider>
  );
}

describe('UiThemeProvider reaching the toolkit components', () => {
  it('restyles the button and the link from the consumer primary', () => {
    renderApp();

    expect(screen.getByRole('button', { name: 'Save' })).toHaveStyle({ backgroundColor: RED });
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveStyle({ color: RED });
  });

  it('restyles the typography from the consumer darkPrimary', () => {
    renderApp();

    expect(screen.getByText('Body copy')).toHaveStyle({ color: RED });
  });

  it('restyles the input outline from the consumer grey400', () => {
    renderApp();
    const field: HTMLElement = screen.getByRole('textbox', { name: 'Name' });
    // eslint-disable-next-line testing-library/no-node-access -- the outline fieldset has no role
    const outline: Element | null | undefined = field.parentElement?.querySelector('fieldset');

    expect(outline).toHaveStyle({ borderColor: RED });
  });

  it('restyles the open tooltip from the consumer tokens', async () => {
    const user: UserEvent = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'More info' }));

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access -- tooltip box has no role
    expect(document.querySelector('.MuiTooltip-tooltip')).toHaveStyle({ color: RED });
  });

  it('lets the consumer toolbar mixin reach the toolbar', () => {
    renderApp();
    // eslint-disable-next-line testing-library/no-node-access -- the toolbar root has no role
    const toolbar: Element | null = screen.getByText('Body copy').closest('.MuiToolbar-root');

    expect(toolbar).toHaveStyle({ minHeight: '99px' });
  });
});
