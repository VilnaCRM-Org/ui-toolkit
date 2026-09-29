import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import React from 'react';

import UiFooter from '../../src/components/ui-footer';

const privacyText: string = i18next.t('footer.privacy');
const usagePolicyText: string = i18next.t('footer.usage_policy');

describe('UiFooter crm variant', () => {
  it('renders the logo and the same-tab policy links', () => {
    render(<UiFooter variant="crm" />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByAltText(i18next.t('footer.logo_alt'))).toBeInTheDocument();
    const privacy: HTMLElement = screen.getByRole('link', { name: privacyText });
    expect(privacy).toHaveAttribute('href', '/privacy-policy');
    expect(privacy).not.toHaveAttribute('target');
    expect(screen.getByRole('link', { name: usagePolicyText })).toHaveAttribute(
      'href',
      '/terms-of-use'
    );
  });

  it('takes custom link targets', () => {
    render(<UiFooter variant="crm" privacyHref="/privacy" usagePolicyHref="/terms" />);
    expect(screen.getByRole('link', { name: privacyText })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: usagePolicyText })).toHaveAttribute('href', '/terms');
  });

  it('renders no social links', () => {
    render(<UiFooter variant="crm" />);
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('sets the link labels in the app theme typography', () => {
    render(
      <ThemeProvider theme={createTheme({ typography: { fontFamily: 'AppFace' } })}>
        <UiFooter variant="crm" />
      </ThemeProvider>
    );
    expect(screen.getByText(privacyText)).toHaveStyle({
      fontFamily: 'AppFace',
      fontWeight: '500',
      fontSize: '1rem',
    });
  });

  it('keeps the website footer as the default', () => {
    render(<UiFooter />);
    expect(screen.getAllByRole('link').length).toBeGreaterThan(2);
  });
});
