import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiFooter } from '../../src/components';

const socialLinks = [
  {
    id: 'github-link',
    href: 'https://github.com/example',
    label: 'GitHub',
  },
  {
    id: 'linkedin-link',
    href: 'https://linkedin.com/company/example',
    label: 'LinkedIn',
  },
];

describe('UiFooter', () => {
  it('renders footer content for desktop and mobile wrappers', () => {
    const { container } = render(
      <UiFooter
        copyrightLabel="Example Company"
        logo={<span>Logo</span>}
        privacyContent={<span>Privacy Policy</span>}
        emailContent={<span>team@example.com</span>}
        socialLinks={socialLinks}
      />
    );

    expect(container.querySelector('footer')).toBeInTheDocument();
    expect(screen.getAllByText('Privacy Policy')).toHaveLength(2);
    expect(screen.getAllByText('team@example.com')).toHaveLength(2);
  });

  it('renders provided social links', () => {
    render(<UiFooter copyrightLabel="Example Company" socialLinks={socialLinks} />);

    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/example'
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://linkedin.com/company/example'
    );
  });

  it('renders the current year with the copyright label', () => {
    render(<UiFooter copyrightLabel="Example Company" socialLinks={socialLinks} />);

    expect(
      screen.getAllByText(new RegExp(`Example Company, ${new Date().getFullYear()}`))
    ).toHaveLength(2);
  });
});
