import { render, screen } from '@testing-library/react';
import React from 'react';

import Mobile from '../../src/components/UiFooter/Mobile';

import { mockedSocialLinks, mockedSocialLinks as socialStackLinks } from './constants';

const mockedDate: number = new Date().getFullYear();
const footerContainerClass: string = 'MuiContainer-root';
const logoAlt: string = 'Vilna logo';
const copyright: RegExp = /Copyright/;

describe('Mobile', () => {
  it('should render the component correctly', () => {
    render(<Mobile socialLinks={mockedSocialLinks} />);

    const footerContainer: HTMLElement | undefined = screen
      .getAllByRole('generic')
      .find(el => el.classList.contains(footerContainerClass));

    expect(footerContainer).toBeInTheDocument();
    expect(screen.getByAltText(logoAlt)).toBeInTheDocument();
    expect(screen.getByText(copyright)).toBeInTheDocument();
    expect(screen.getByText(mockedDate.toString())).toBeInTheDocument();
  });
});

describe('Mobile social links Stack styling', (): void => {
  const socialStackTitle: string = 'sample title';

  const getSocialStack = (): HTMLElement => {
    render(<Mobile socialLinks={socialStackLinks} />);
    const link: HTMLElement = screen.getByRole('link', { name: socialStackTitle });
    // eslint-disable-next-line testing-library/no-node-access
    const stack: HTMLElement | null = link.closest('.MuiStack-root');
    expect(stack).not.toBeNull();
    return stack as HTMLElement;
  };

  // Kills StringLiteral mutant (Mobile.tsx:24:73): alignItems: 'center' -> ''.
  // Also fails when the whole sx object is emptied (ObjectLiteral 24:36).
  it('applies alignItems center to the social links Stack', (): void => {
    const stack: HTMLElement = getSocialStack();

    expect(stack).toHaveStyle({ alignItems: 'center' });
  });

  // Kills ObjectLiteral mutant (Mobile.tsx:24:36): sx={{ ...listWrapper, ... }} -> sx={{}}.
  // justifyContent comes from the spread styles.listWrapper and survives the
  // StringLiteral mutation, so it isolates the object-literal removal.
  it('applies justifyContent center from styles.listWrapper to the Stack', (): void => {
    const stack: HTMLElement = getSocialStack();

    expect(stack).toHaveStyle({ justifyContent: 'center' });
  });

  // Belt-and-suspenders: pins both divergent values together so neither mutant
  // can survive by leaving one property intact.
  it('keeps both center alignment values on the Stack at once', (): void => {
    const stack: HTMLElement = getSocialStack();

    expect(stack).toHaveStyle({ alignItems: 'center', justifyContent: 'center' });
  });
});
