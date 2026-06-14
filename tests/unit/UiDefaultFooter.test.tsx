import { render, screen } from '@testing-library/react';
import React from 'react';

import DefaultFooter from '../../src/components/UiFooter/DefaultFooter';

import { mockedSocialLinks } from './constants';

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
