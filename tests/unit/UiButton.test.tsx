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

  it('forwards the to target to a custom link component instead of flattening to href', () => {
    type RouterLinkProps = { to: unknown; href?: string; children?: React.ReactNode };
    // Mirrors react-router's Link: it owns navigation via `to` and renders its own
    // accessible href. The test asserts UiButton forwards the raw `to` and does not
    // inject a flattened `href` of its own.
    const RouterLink: React.ForwardRefExoticComponent<
      RouterLinkProps & React.RefAttributes<HTMLAnchorElement>
    > = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(function RouterLink(
      { to, href, children },
      ref
    ) {
      return (
        <a
          ref={ref}
          href="/resolved-by-router"
          data-to={JSON.stringify(to)}
          data-href={String(href)}
        >
          {children}
        </a>
      );
    });

    const to: { pathname: string; search: string } = { pathname: '/auth', search: '?mode=signup' };
    const { getByRole } = render(
      <UiButton component={RouterLink} to={to}>
        {testText}
      </UiButton>
    );

    const link: HTMLElement = getByRole('link', { name: testText });
    expect(link).toHaveAttribute('data-to', JSON.stringify(to));
    expect(link).toHaveAttribute('data-href', 'undefined');
  });
});
