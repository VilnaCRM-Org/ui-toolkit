import { render } from '@testing-library/react';
import React from 'react';

import VilnaCRMEmail from '../../src/components/UiFooter/VilnaCRMEmail';

import { mockEmail } from './constants';

describe('VilnaCRMEmail component', () => {
  const originalEmail: string | undefined = process.env.REACT_APP_VILNACRM_GMAIL;

  afterEach(() => {
    if (originalEmail === undefined) {
      delete process.env.REACT_APP_VILNACRM_GMAIL;
      return;
    }

    process.env.REACT_APP_VILNACRM_GMAIL = originalEmail;
  });

  it('renders email address correctly', () => {
    delete process.env.REACT_APP_VILNACRM_GMAIL;

    const { getByText } = render(<VilnaCRMEmail />);

    const emailLink: HTMLElement = getByText(mockEmail);
    expect(emailLink).toBeInTheDocument();
  });

  it('uses the configured email for both text and mailto href', () => {
    const configuredEmail: string = 'support@example.com';
    process.env.REACT_APP_VILNACRM_GMAIL = configuredEmail;

    const { getByRole } = render(<VilnaCRMEmail />);

    expect(getByRole('link', { name: configuredEmail })).toHaveAttribute(
      'href',
      `mailto:${configuredEmail}`
    );
  });
});
