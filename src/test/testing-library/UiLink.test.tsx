import { render } from '@testing-library/react';
import React from 'react';

import { UiLink } from '../../components';

import { testText, testUrl } from './constants';

describe('UiLink', () => {
  it('renders the Link with the provided children and href', () => {
    const testHref: string = testUrl;
    const { getByText } = render(<UiLink href={testHref}>{testText}</UiLink>);
    const linkElement: HTMLElement = getByText(testText);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', testHref);
  });
});
