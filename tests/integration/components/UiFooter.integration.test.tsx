import { render, screen, within } from '@testing-library/react';
import i18next from 'i18next';
import React from 'react';

import UiFooter from '../../../src/components/UiFooter';

// Integration tier: render the public, propless UiFooter with its REAL composed
// children — DefaultFooter + Mobile, each containing SocialMediaItem links,
// VilnaCRMEmail and PrivacyPolicy/copyright. Nothing here is mocked: we assert
// that the whole tree wires together (landmark, accessible social links, the
// mailto email and the localised copyright + live year) as one rendered unit.
//
// UiFooter mounts BOTH DefaultFooter and Mobile at once; the desktop/mobile
// split is purely CSS (`display` media queries in styles.ts). In jsdom the
// DefaultFooter branch is visible and the Mobile branch is `display: none`.
// That distinction drives the assertions below:
//   - accessibility-aware queries (getByRole) only see the VISIBLE branch, so
//     interactive links resolve to exactly one element (what an AT user gets);
//   - DOM-text queries (getByText/getByLabelText/getByAltText) ignore CSS
//     visibility, so they see BOTH branches and resolve to two elements.

// Resolved English strings (i18n is initialised globally in jest.setup).
const t: (key: string) => string = (key: string): string => i18next.t(key);

const copyrightText: string = t('footer.copyright');
const privacyText: string = t('footer.privacy');
const usagePolicyText: string = t('footer.usage_policy');
const logoAlt: string = t('footer.logo_alt');
const currentYear: string = new Date().getFullYear().toString();

// VilnaCRMEmail falls back to this default when REACT_APP_VILNACRM_GMAIL is
// unset (it is, in the jest environment), so the mailto target is deterministic.
const defaultEmail: string = 'info@vilnacrm.com';

const privacyPolicyHref: string =
  'https://github.com/VilnaCRM-Org/website/blob/main/README.md#privacy-policy';
const usagePolicyHref: string =
  'https://github.com/VilnaCRM-Org/website/blob/main/README.md#usage-policy';

// Both branches mount in the DOM; only one (DefaultFooter) is visible.
const RENDERED_BRANCHES: number = 2;
const VISIBLE_BRANCHES: number = 1;

const socialLinks: ReadonlyArray<{ accessibleName: string; href: string }> = [
  { accessibleName: t('footer.aria_labels.instagram'), href: 'https://www.instagram.com/' },
  { accessibleName: t('footer.aria_labels.github'), href: 'https://github.com/VilnaCRM-Org' },
  { accessibleName: t('footer.aria_labels.facebook'), href: 'https://www.facebook.com/' },
  { accessibleName: t('footer.aria_labels.linkedin'), href: 'https://www.linkedin.com/' },
];

describe('UiFooter (integration)', () => {
  it('renders the footer landmark wrapping the composed children', () => {
    render(<UiFooter />);

    const footer: HTMLElement = screen.getByRole('contentinfo');

    expect(footer).toBeInTheDocument();
    expect(footer.id).toBe('Contacts');
  });

  it('mounts both the desktop (DefaultFooter) and mobile branches', () => {
    render(<UiFooter />);

    const footer: HTMLElement = screen.getByRole('contentinfo');

    // The logo image is emitted by DefaultFooter AND Mobile; getAllByAltText
    // ignores CSS visibility, so both real children prove they mounted.
    expect(within(footer).getAllByAltText(logoAlt)).toHaveLength(RENDERED_BRANCHES);
    // The Mobile branch carries the only MUI Container wrapper.
    expect(footer.querySelectorAll('.MuiContainer-root')).toHaveLength(VISIBLE_BRANCHES);
  });

  it('renders every social media link with its accessible name, href and safe rel', () => {
    render(<UiFooter />);

    const footer: HTMLElement = screen.getByRole('contentinfo');

    socialLinks.forEach(({ accessibleName, href }) => {
      // getByRole respects visibility, so the visible DefaultFooter branch wins.
      const link: HTMLElement = within(footer).getByRole('link', { name: accessibleName });

      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('exposes social icons as decorative so links derive their name from aria-label', () => {
    render(<UiFooter />);

    const footer: HTMLElement = screen.getByRole('contentinfo');

    // Social icons carry alt="" (decorative) and are NOT exposed by the img
    // role; the only role=img is the (visible) logo, named by its alt text.
    const images: HTMLElement[] = within(footer).getAllByRole('img');
    expect(images).toHaveLength(VISIBLE_BRANCHES);
    expect(images[0]).toHaveAccessibleName(logoAlt);

    // The accessible name for each social link comes solely from its aria-label,
    // which getByLabelText (visibility-agnostic) finds in both mounted branches.
    socialLinks.forEach(({ accessibleName }) => {
      expect(within(footer).getAllByLabelText(accessibleName)).toHaveLength(RENDERED_BRANCHES);
    });
  });

  it('renders the VilnaCRM mailto email link from the real VilnaCRMEmail child', () => {
    render(<UiFooter />);

    const footer: HTMLElement = screen.getByRole('contentinfo');

    const emailLink: HTMLElement = within(footer).getByRole('link', { name: defaultEmail });

    expect(emailLink).toHaveAttribute('href', `mailto:${defaultEmail}`);
    expect(emailLink).toHaveTextContent(defaultEmail);
  });

  it('renders the privacy and usage policy links from the real PrivacyPolicy child', () => {
    render(<UiFooter />);

    const footer: HTMLElement = screen.getByRole('contentinfo');

    const privacyLink: HTMLElement = within(footer).getByRole('link', { name: privacyText });
    const usageLink: HTMLElement = within(footer).getByRole('link', { name: usagePolicyText });

    expect(privacyLink).toHaveAttribute('href', privacyPolicyHref);
    expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(privacyLink).toHaveAttribute('target', '_blank');

    expect(usageLink).toHaveAttribute('href', usagePolicyHref);
    expect(usageLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(usageLink).toHaveAttribute('target', '_blank');
  });

  it('renders the localised copyright text alongside the current year', () => {
    render(<UiFooter />);

    const footer: HTMLElement = screen.getByRole('contentinfo');

    // Copyright label + year render once per mounted branch (text queries are
    // visibility-agnostic) and sit inside the same copyright paragraph.
    const yearNodes: HTMLElement[] = within(footer).getAllByText(currentYear);
    expect(yearNodes).toHaveLength(RENDERED_BRANCHES);

    yearNodes.forEach(yearNode => {
      const paragraph: HTMLElement | null = yearNode.closest('p');
      expect(paragraph).not.toBeNull();
      expect(paragraph).toHaveTextContent(copyrightText);
      expect(paragraph).toHaveTextContent(currentYear);
    });
  });

  it('renders the whole footer composition together in a single mount', () => {
    render(<UiFooter />);

    const footer: HTMLElement = screen.getByRole('contentinfo');

    // Visible, interactive surface (one branch): 4 social + email + privacy +
    // usage = 7 reachable links.
    const expectedReachableLinks: number = socialLinks.length + 1 + 1 + 1;
    expect(within(footer).getAllByRole('link')).toHaveLength(expectedReachableLinks);

    // And the localised copyright + year are part of the same rendered tree.
    expect(within(footer).getAllByText(copyrightText, { exact: false })).toHaveLength(
      RENDERED_BRANCHES
    );
    expect(within(footer).getAllByText(currentYear)).toHaveLength(RENDERED_BRANCHES);
  });
});
