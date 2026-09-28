import { render, screen, within } from '@testing-library/react';
import i18next from 'i18next';
import React from 'react';

import UiFooter from '../../../src/components/ui-footer';

describe('UiFooter crm variant (integration)', () => {
  it('composes the logo and the policy links inside the footer landmark', () => {
    render(<UiFooter variant="crm" usagePolicyHref="/terms" />);
    const footer: HTMLElement = screen.getByRole('contentinfo');
    expect(within(footer).getByAltText(i18next.t('footer.logo_alt'))).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: i18next.t('footer.privacy') })).toHaveAttribute(
      'href',
      '/privacy-policy'
    );
    expect(
      within(footer).getByRole('link', { name: i18next.t('footer.usage_policy') })
    ).toHaveAttribute('href', '/terms');
    expect(within(footer).queryByText(i18next.t('footer.copyright'))).not.toBeInTheDocument();
  });
});
