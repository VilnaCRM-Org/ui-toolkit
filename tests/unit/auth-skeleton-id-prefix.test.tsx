import { render } from '@testing-library/react';
import React from 'react';

import AuthSkeleton from '../../src/components/auth-skeleton';

const BARE_IDS: readonly string[] = [
  'auth-skeleton-title',
  'auth-skeleton-subtitle',
  'auth-skeleton-subtitle-line2',
  'auth-skeleton-field-label-1',
  'auth-skeleton-input-1',
  'auth-skeleton-submit',
  'auth-skeleton-divider',
  'auth-skeleton-divider-text',
  'auth-skeleton-social-google',
  'auth-skeleton-switcher',
];

describe('AuthSkeleton idPrefix', () => {
  it('renders the bare ids with an empty prefix', () => {
    const { container } = render(<AuthSkeleton idPrefix="" />);
    BARE_IDS.forEach(id => {
      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      expect(container.querySelector(`[id="${id}"]`)).not.toBeNull();
    });
  });

  it('prepends a custom prefix', () => {
    const { container } = render(<AuthSkeleton idPrefix="login-" />);
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    expect(container.querySelector('[id="login-auth-skeleton-divider"]')).not.toBeNull();
  });

  it('keeps generated prefixes unique by default', () => {
    const { container } = render(
      <>
        <AuthSkeleton />
        <AuthSkeleton />
      </>
    );
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const titles: Element[] = [...container.querySelectorAll('[id$="auth-skeleton-title"]')];
    expect(titles).toHaveLength(2);
    expect(titles[0]?.id).not.toBe(titles[1]?.id);
    expect(titles[0]?.id).not.toBe('auth-skeleton-title');
  });
});
