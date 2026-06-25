import { render, screen } from '@testing-library/react';
import React from 'react';

import PrivacyPolicy from '../../src/components/ui-footer/privacy-policy';

const defaultPrivacyPolicyUrl: string =
  'https://github.com/VilnaCRM-Org/website/blob/main/README.md#privacy-policy';
const defaultUsagePolicyUrl: string =
  'https://github.com/VilnaCRM-Org/website/blob/main/README.md#usage-policy';

describe('PrivacyPolicy', () => {
  const originalPrivacyPolicyUrl: string | undefined =
    process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL;
  const originalUsagePolicyUrl: string | undefined =
    process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL;

  afterEach(() => {
    if (originalPrivacyPolicyUrl === undefined) {
      delete process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL;
    } else {
      process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL = originalPrivacyPolicyUrl;
    }

    if (originalUsagePolicyUrl === undefined) {
      delete process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL;
    } else {
      process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL = originalUsagePolicyUrl;
    }
  });

  it('uses separate default links for privacy and usage policy', () => {
    delete process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL;
    delete process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL;

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

    process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL = configuredPrivacyPolicyUrl;
    process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL = configuredUsagePolicyUrl;

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

describe('PrivacyPolicy URL normalization', () => {
  const originalPrivacyUrl: string | undefined = process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL;
  const originalUsageUrl: string | undefined = process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL;

  afterEach((): void => {
    if (originalPrivacyUrl === undefined) {
      delete process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL;
    } else {
      process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL = originalPrivacyUrl;
    }

    if (originalUsageUrl === undefined) {
      delete process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL;
    } else {
      process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL = originalUsageUrl;
    }
  });

  it('trims whitespace-only env URLs and falls back to defaults', (): void => {
    // A whitespace-only value is "truthy" but blank: only `.trim()` collapses it
    // to an empty string so the `|| fallbackUrl` branch runs. Without `.trim()`
    // the raw spaces would survive as the href.
    process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL = '   ';
    process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL = '\t\n ';

    render(<PrivacyPolicy />);

    const privacyPolicyLink: HTMLElement = screen.getByRole('link', {
      name: 'Privacy policy',
    });
    const usagePolicyLink: HTMLElement = screen.getByRole('link', {
      name: 'Usage policy',
    });

    expect(privacyPolicyLink).toHaveAttribute('href', defaultPrivacyPolicyUrl);
    expect(usagePolicyLink).toHaveAttribute('href', defaultUsagePolicyUrl);
    expect(privacyPolicyLink).not.toHaveAttribute('href', '   ');
    expect(usagePolicyLink).not.toHaveAttribute('href', '\t\n ');
  });

  it('keeps a non-blank configured URL after trimming surrounding whitespace', (): void => {
    process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL = 'https://example.com/privacy';

    render(<PrivacyPolicy />);

    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute(
      'href',
      'https://example.com/privacy'
    );
  });
});

describe('PrivacyPolicy wrapper layout', () => {
  const originalPrivacyUrl: string | undefined = process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL;
  const originalUsageUrl: string | undefined = process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL;

  afterEach((): void => {
    if (originalPrivacyUrl === undefined) {
      delete process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL;
    } else {
      process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL = originalPrivacyUrl;
    }

    if (originalUsageUrl === undefined) {
      delete process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL;
    } else {
      process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL = originalUsageUrl;
    }
  });

  it('applies the wrapper styles and centered cross-axis alignment', (): void => {
    delete process.env.REACT_APP_VILNACRM_PRIVACY_POLICY_URL;
    delete process.env.REACT_APP_VILNACRM_USAGE_POLICY_URL;

    render(<PrivacyPolicy />);

    const privacyPolicyLink: HTMLElement = screen.getByRole('link', {
      name: 'Privacy policy',
    });
    // The Stack wrapper carries no role, so reach it via the link's parent.
    // eslint-disable-next-line testing-library/no-node-access
    const wrapper: HTMLElement = privacyPolicyLink.parentElement as HTMLElement;

    // `alignItems: 'center'` from the literal; collapses to empty if the string
    // is mutated to '' or the whole sx object is replaced with {}.
    expect(wrapper).toHaveStyle({ alignItems: 'center' });
    // `gap` and `flexDirection` come from the spread `...styles.wrapper`; they
    // disappear if the sx object literal is mutated to {}.
    expect(wrapper).toHaveStyle({ gap: '0.5rem' });
    expect(wrapper).toHaveStyle({ flexDirection: 'row' });
  });
});
