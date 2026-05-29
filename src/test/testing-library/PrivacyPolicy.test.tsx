import { render, screen } from '@testing-library/react';
import React from 'react';

import PrivacyPolicy from '../../components/UiFooter/PrivacyPolicy';

const defaultPrivacyPolicyUrl: string =
  'https://github.com/VilnaCRM-Org/website/blob/main/README.md#privacy-policy';
const defaultUsagePolicyUrl: string =
  'https://github.com/VilnaCRM-Org/website/blob/main/README.md#usage-policy';

describe('PrivacyPolicy', () => {
  const originalPrivacyPolicyUrl: string | undefined =
    process.env.NEXT_PUBLIC_VILNACRM_PRIVACY_POLICY_URL;
  const originalUsagePolicyUrl: string | undefined =
    process.env.NEXT_PUBLIC_VILNACRM_USAGE_POLICY_URL;

  afterEach(() => {
    if (originalPrivacyPolicyUrl === undefined) {
      delete process.env.NEXT_PUBLIC_VILNACRM_PRIVACY_POLICY_URL;
    } else {
      process.env.NEXT_PUBLIC_VILNACRM_PRIVACY_POLICY_URL = originalPrivacyPolicyUrl;
    }

    if (originalUsagePolicyUrl === undefined) {
      delete process.env.NEXT_PUBLIC_VILNACRM_USAGE_POLICY_URL;
    } else {
      process.env.NEXT_PUBLIC_VILNACRM_USAGE_POLICY_URL = originalUsagePolicyUrl;
    }
  });

  it('uses separate default links for privacy and usage policy', () => {
    delete process.env.NEXT_PUBLIC_VILNACRM_PRIVACY_POLICY_URL;
    delete process.env.NEXT_PUBLIC_VILNACRM_USAGE_POLICY_URL;

    render(<PrivacyPolicy />);

    const privacyPolicyLink: HTMLElement = screen.getByRole('link', {
      name: 'Privacy policy',
    });
    const usagePolicyLink: HTMLElement = screen.getByRole('link', {
      name: 'Usage policy',
    });

    expect(privacyPolicyLink).toHaveAttribute('href', defaultPrivacyPolicyUrl);
    expect(usagePolicyLink).toHaveAttribute('href', defaultUsagePolicyUrl);
  });

  it('uses configured URLs when they are provided', () => {
    const configuredPrivacyPolicyUrl: string = 'https://example.com/privacy-policy';
    const configuredUsagePolicyUrl: string = 'https://example.com/usage-policy';

    process.env.NEXT_PUBLIC_VILNACRM_PRIVACY_POLICY_URL = configuredPrivacyPolicyUrl;
    process.env.NEXT_PUBLIC_VILNACRM_USAGE_POLICY_URL = configuredUsagePolicyUrl;

    render(<PrivacyPolicy />);

    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute(
      'href',
      configuredPrivacyPolicyUrl
    );
    expect(screen.getByRole('link', { name: 'Usage policy' })).toHaveAttribute(
      'href',
      configuredUsagePolicyUrl
    );
  });
});
