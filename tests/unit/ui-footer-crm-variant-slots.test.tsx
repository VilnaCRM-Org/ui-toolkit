import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import React from 'react';

import UiFooter from '../../src/components/ui-footer';

import { emotionCssFor } from './utils/emotion-css';

const privacyText: string = i18next.t('footer.privacy');
const usagePolicyText: string = i18next.t('footer.usage_policy');

function privacyLink(): HTMLElement {
  return screen.getByRole('link', { name: privacyText });
}

describe('UiFooter crm variant slots and values', () => {
  it('zeroes the link label letter-spacing under an ambient body1 tracking', () => {
    render(
      <ThemeProvider theme={createTheme({ typography: { body1: { letterSpacing: '0.00938em' } } })}>
        <UiFooter variant="crm" />
      </ThemeProvider>
    );
    expect(screen.getByText(privacyText)).toHaveStyle({ letterSpacing: '0' });
    expect(emotionCssFor(screen.getByText(privacyText))).toContain('letter-spacing: 0;');
  });

  it('clamps the footer height at lg and xl', () => {
    render(<UiFooter variant="crm" />);
    const css: string = emotionCssFor(screen.getByRole('contentinfo'));
    expect(css).toContain('padding-top: 0.538125rem; max-height: 4.149375rem;');
    expect(css).toContain('padding-bottom: 0.43375rem; max-height: 4.125rem;');
  });

  it('pins the visited link to the rest colour', () => {
    render(<UiFooter variant="crm" />);
    expect(emotionCssFor(privacyLink())).toContain(':visited {color: #404142;}');
  });

  it('renders the kit logo image by default', () => {
    render(<UiFooter variant="crm" />);
    expect(screen.getByRole('img', { name: i18next.t('footer.logo_alt') })).toHaveAttribute('src');
  });

  it('replaces the logo image with a consumer logo', () => {
    render(
      <UiFooter
        variant="crm"
        logo={
          <svg aria-hidden="true">
            <text>ConsumerLogo</text>
          </svg>
        }
      />
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('ConsumerLogo')).toBeInTheDocument();
  });

  it('renders no logo when logo is null', () => {
    render(<UiFooter variant="crm" logo={null} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(privacyLink()).toBeInTheDocument();
  });

  it('appends slotProps.link.sx object to both links', () => {
    render(<UiFooter variant="crm" slotProps={{ link: { sx: { color: 'rgb(1, 2, 3)' } } }} />);
    expect(privacyLink()).toHaveStyle({ color: 'rgb(1, 2, 3)' });
    expect(screen.getByRole('link', { name: usagePolicyText })).toHaveStyle({
      color: 'rgb(1, 2, 3)',
    });
  });

  it('appends slotProps.link.sx arrays to both links', () => {
    render(
      <UiFooter
        variant="crm"
        slotProps={{ link: { sx: [{ color: 'rgb(4, 5, 6)' }, { outlineColor: 'rgb(7, 8, 9)' }] } }}
      />
    );
    expect(privacyLink()).toHaveStyle({ color: 'rgb(4, 5, 6)', outlineColor: 'rgb(7, 8, 9)' });
  });

  it('keeps the rest colour without slotProps', () => {
    render(<UiFooter variant="crm" slotProps={{}} />);
    expect(privacyLink()).toHaveStyle({ color: '#404142' });
  });
});
