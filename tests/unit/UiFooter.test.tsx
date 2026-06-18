import { render, screen } from '@testing-library/react';
import React from 'react';

import UiFooter from '../../src/components/UiFooter';

// UiFooter renders a single <footer> (role="contentinfo") that contains both
// responsive variants: DefaultFooter (desktop) and Mobile. Each variant renders
// its own "Vilna logo" image, so the two logos are the semantic, role-based
// signal that both variants mounted. The desktop logo is 143px wide and the
// mobile logo is 131px wide, which lets each test assert its own variant.
const LOGO_ALT: string = 'Vilna logo';
const DEFAULT_LOGO_WIDTH: string = '143';
const MOBILE_LOGO_WIDTH: string = '131';

describe('UiFooter Component', () => {
  it('renders DefaultFooter component with provided social links', () => {
    render(<UiFooter />);

    const footerElement: HTMLElement = screen.getByRole('contentinfo');
    const logos: HTMLElement[] = screen.getAllByAltText(LOGO_ALT);
    const defaultFooterLogo: HTMLElement | undefined = logos.find(
      logo => logo.getAttribute('width') === DEFAULT_LOGO_WIDTH
    );

    expect(footerElement).toBeInTheDocument();
    expect(defaultFooterLogo).toBeInTheDocument();
  });

  it('renders Mobile component with provided social links', () => {
    render(<UiFooter />);

    const footerElement: HTMLElement = screen.getByRole('contentinfo');
    const logos: HTMLElement[] = screen.getAllByAltText(LOGO_ALT);
    const mobileLogo: HTMLElement | undefined = logos.find(
      logo => logo.getAttribute('width') === MOBILE_LOGO_WIDTH
    );

    expect(footerElement).toBeInTheDocument();
    expect(mobileLogo).toBeInTheDocument();
  });
});
