import { render, screen } from '@testing-library/react';
import React from 'react';

import DefaultFooter from '../../src/components/ui-footer/default-footer';

import { mockedSocialLinks, mockEmail, testTitle } from './constants';

const mockedDate: number = new Date().getFullYear();
const defaultFooterClass: string = 'MuiStack-root';
const logoAlt: string = 'Vilna logo';
const copyright: RegExp = /Copyright/;

describe('DefaultFooter', () => {
  it('should render the component correctly', () => {
    render(<DefaultFooter socialLinks={mockedSocialLinks} />);

    const footerWrapper: HTMLElement | undefined = screen
      .getAllByRole('generic')
      .find(element => element.classList.contains(defaultFooterClass));

    expect(footerWrapper).toBeInTheDocument();
    expect(screen.getByAltText(logoAlt)).toBeInTheDocument();
    expect(screen.getByText(copyright)).toBeInTheDocument();
    expect(screen.getByText(mockedDate.toString())).toBeInTheDocument();
  });
});

const STACK_SELECTOR: string = '.MuiStack-root';

function nearestStack(start: HTMLElement | null): HTMLElement {
  // The footer's layout wrappers are MUI <Stack> elements that carry no ARIA
  // role of their own, so we anchor on a semantic node (logo / link) and walk
  // up to the nearest Stack to assert its resolved inline sx styles.
  // eslint-disable-next-line testing-library/no-node-access
  const found: Element | null | undefined = start?.closest(STACK_SELECTOR);

  if (!(found instanceof HTMLElement)) {
    throw new Error('Expected an ancestor MuiStack-root element');
  }

  return found;
}

describe('DefaultFooter inline sx defaults', () => {
  it('renders the top row Stack with its default height and alignItems', (): void => {
    render(<DefaultFooter socialLinks={mockedSocialLinks} />);

    const logo: HTMLElement = screen.getByAltText(logoAlt);
    const topContentStack: HTMLElement = nearestStack(logo);
    // eslint-disable-next-line testing-library/no-node-access
    const topRowStack: HTMLElement = nearestStack(topContentStack.parentElement);

    expect(topRowStack).toHaveStyle({ height: '4.188rem' });
    expect(topRowStack).toHaveStyle({ alignItems: 'center' });
  });

  it('renders the top content Stack with spread padding and justify/align defaults', (): void => {
    render(<DefaultFooter socialLinks={mockedSocialLinks} />);

    const logo: HTMLElement = screen.getByAltText(logoAlt);
    const topContentStack: HTMLElement = nearestStack(logo);

    expect(topContentStack).toHaveStyle({ paddingLeft: '1rem' });
    expect(topContentStack).toHaveStyle({ justifyContent: 'space-between' });
    expect(topContentStack).toHaveStyle({ alignItems: 'center' });
  });

  it('renders the email-and-links row Stack with its default gap and alignItems', (): void => {
    render(<DefaultFooter socialLinks={mockedSocialLinks} />);

    const emailLink: HTMLElement = screen.getByRole('link', { name: mockEmail });
    const rowStack: HTMLElement = nearestStack(emailLink);

    expect(rowStack).toHaveStyle({ gap: '0.875rem' });
    expect(rowStack).toHaveStyle({ alignItems: 'center' });
  });

  it('renders the social list wrapper Stack with spread gap and alignItems default', (): void => {
    render(<DefaultFooter socialLinks={mockedSocialLinks} />);

    const socialLink: HTMLElement = screen.getByLabelText(testTitle);
    const listWrapperStack: HTMLElement = nearestStack(socialLink);

    expect(listWrapperStack).toHaveStyle({ gap: '0.5rem' });
    expect(listWrapperStack).toHaveStyle({ alignItems: 'center' });
  });
});
