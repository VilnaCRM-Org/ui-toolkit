import { render, screen } from '@testing-library/react';
import React from 'react';

import Mobile from '../../src/components/UiFooter/Mobile';

import { mockedSocialLinks } from './constants';

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
