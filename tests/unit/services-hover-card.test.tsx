import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

import ServicesHoverCard from '../../src/components/ui-card-item/services-hover-card';

const hoverCardtitle: string = 'Services';
const hoverCardtext: string = 'Integrate in a few clicks';

describe('ServicesHoverCard component', () => {
  it('renders title and text correctly', () => {
    render(<ServicesHoverCard />);

    expect(screen.getByText(hoverCardtitle)).toBeInTheDocument();
    expect(screen.getByText(hoverCardtext)).toBeInTheDocument();
  });

  it('renders images correctly', () => {
    render(<ServicesHoverCard />);

    const images: HTMLElement[] = screen.getAllByAltText(/.+/);
    expect(images.length).toBe(8);
  });
});
