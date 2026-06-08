import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { UiButton } from '../../src/components';

import { testText } from './constants';

describe('UiButton', () => {
  it('renders the button with the correct props', () => {
    const onClick: () => void = jest.fn();
    const { getByRole } = render(
      <UiButton
        variant="contained"
        size="medium"
        disabled={false}
        fullWidth={false}
        type="button"
        onClick={onClick}
        sx={{ color: 'red' }}
        name="my-button"
      >
        {testText}
      </UiButton>
    );

    const button: HTMLElement = getByRole('button', { name: testText });
    expect(button).toBeEnabled();
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('name', 'my-button');
  });

  it('calls the onClick handler when the button is clicked', () => {
    const onClick: () => void = jest.fn();
    const { getByRole } = render(<UiButton onClick={onClick}>{testText}</UiButton>);

    const button: HTMLElement = getByRole('button', { name: testText });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when disabled prop is true', () => {
    const { getByRole } = render(<UiButton disabled>{testText}</UiButton>);
    expect(getByRole('button', { name: testText })).toBeDisabled();
  });

  it('renders an anchor when href is provided', () => {
    const { getByRole } = render(
      <UiButton href={testText} aria-label="Go to sample">
        {testText}
      </UiButton>
    );

    const link: HTMLElement = getByRole('link', { name: 'Go to sample' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', testText);
  });

  it('resolves CRM-style to props into an anchor href', () => {
    const { getByRole } = render(
      <UiButton to={{ pathname: '/auth', search: '?mode=signup', hash: '#step-1' }}>
        {testText}
      </UiButton>
    );

    const link: HTMLElement = getByRole('link', { name: testText });
    expect(link).toHaveAttribute('href', '/auth?mode=signup#step-1');
  });
});
