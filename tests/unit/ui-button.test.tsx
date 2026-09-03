import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { UiButton } from '../../src/components';
import {
  containedStyles,
  dangerStyles,
  outlinedStyles,
} from '../../src/components/ui-button/theme';

import { testText } from './constants';

// Board A y=1354 (rest 439:19822 / hover 439:19824 / active 439:19826 / disabled
// 439:19828). Local consts so a palette-token swap fails this test.
const dangerRestFill: string = 'rgba(220, 57, 57, 0.1)';
const dangerBorderColor: string = '#DF7878';
const dangerRestInk: string = '#DC3939';
const dangerHoverFill: string = '#DC3939';
const dangerActiveFill: string = '#DF7878';
const dangerDisabledFill: string = '#E1E7EA';
const dangerPressedInk: string = '#FFF';

describe('UiButton', () => {
  it('renders the button with the correct props', () => {
    const onClick: () => void = jest.fn();
    render(
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

    const button: HTMLElement = screen.getByRole('button', { name: testText });
    expect(button).toBeEnabled();
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('name', 'my-button');
  });

  it('calls the onClick handler when the button is clicked', () => {
    const onClick: () => void = jest.fn();
    render(<UiButton onClick={onClick}>{testText}</UiButton>);

    const button: HTMLElement = screen.getByRole('button', { name: testText });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when disabled prop is true', () => {
    render(<UiButton disabled>{testText}</UiButton>);
    expect(screen.getByRole('button', { name: testText })).toBeDisabled();
  });

  it('renders an anchor when href is provided', () => {
    render(
      <UiButton href={testText} aria-label="Go to sample">
        {testText}
      </UiButton>
    );

    const link: HTMLElement = screen.getByRole('link', { name: 'Go to sample' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', testText);
  });

  it('resolves CRM-style to props into an anchor href', () => {
    render(
      <UiButton to={{ pathname: '/auth', search: '?mode=signup', hash: '#step-1' }}>
        {testText}
      </UiButton>
    );

    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link).toHaveAttribute('href', '/auth?mode=signup#step-1');
  });

  it('forwards the to target to a custom link component instead of flattening to href', () => {
    type RouterLinkProps = { to: unknown; href?: string; children?: React.ReactNode };
    // Mirrors react-router's Link: it owns navigation via `to` and renders its own
    // accessible href. Asserts UiButton forwards the raw `to` and injects no href.
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
    render(
      <UiButton component={RouterLink} to={to}>
        {testText}
      </UiButton>
    );

    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link).toHaveAttribute('data-to', JSON.stringify(to));
    expect(link).toHaveAttribute('data-href', 'undefined');
  });

  it('resolves a string to prop directly into an anchor href', () => {
    render(<UiButton to="/dashboard">{testText}</UiButton>);

    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('fills in empty segments when the to object only provides a pathname', () => {
    render(<UiButton to={{ pathname: '/profile' }}>{testText}</UiButton>);

    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link).toHaveAttribute('href', '/profile');
  });

  it('fills in empty segments when the to object only provides a hash', () => {
    render(<UiButton to={{ hash: '#top' }}>{testText}</UiButton>);

    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link).toHaveAttribute('href', '#top');
  });

  it('renders a plain button when the to object resolves to an empty string', () => {
    render(<UiButton to={{}}>{testText}</UiButton>);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const button: HTMLElement = screen.getByRole('button', { name: testText });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('href');
  });

  it('honours an explicit non-button component, dropping type but keeping the href', () => {
    render(
      <UiButton component="span" href="/external">
        {testText}
      </UiButton>
    );

    const element: HTMLElement = screen.getByText(testText);
    expect(element.tagName).toBe('SPAN');
    expect(element).not.toHaveAttribute('type');
    expect(element).toHaveAttribute('href', '/external');
  });

  it('keeps the type attribute when component is explicitly "button"', () => {
    render(
      <UiButton component="button" type="submit">
        {testText}
      </UiButton>
    );

    const button: HTMLElement = screen.getByRole('button', { name: testText });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('exposes the contained and outlined style presets shared by the theme variants', () => {
    expect(containedStyles).toMatchObject({
      textTransform: 'none',
      borderRadius: '3.563rem',
    });
    expect(containedStyles).toHaveProperty('backgroundColor');
    expect(outlinedStyles).toMatchObject({
      textTransform: 'none',
      borderRadius: '3.563rem',
    });
    expect(outlinedStyles).toHaveProperty('border');
  });

  it('renders the danger variant with its own name so the theme can match it', () => {
    render(
      <UiButton variant="contained" size="small" name="danger">
        {testText}
      </UiButton>
    );

    const button: HTMLElement = screen.getByRole('button', { name: testText });
    expect(button).toHaveAttribute('name', 'danger');
    expect(button).toBeEnabled();
  });

  it('disables the danger variant natively, like every other UiButton variant', () => {
    render(
      <UiButton variant="contained" size="small" name="danger" disabled>
        {testText}
      </UiButton>
    );

    expect(screen.getByRole('button', { name: testText })).toBeDisabled();
  });
});

describe('UiButton danger variant style assembly (Board A y=1354)', () => {
  it('declares the shared typography and radius the base pill uses', () => {
    expect(dangerStyles).toMatchObject({
      textTransform: 'none',
      fontFamily: 'Golos Text',
      fontWeight: '500',
      fontSize: '0.938rem',
      lineHeight: '1.125rem',
      letterSpacing: '0',
      borderRadius: '3.563rem',
      padding: '0.75rem 1.5rem',
    });
  });

  it('paints the rest fill from the error token at 10% alpha, not a new hex', () => {
    expect(dangerStyles).toMatchObject({
      backgroundColor: dangerRestFill,
      border: `1px solid ${dangerBorderColor}`,
      color: dangerRestInk,
    });
  });

  it('paints hover: solid error fill, transparent border, white ink', () => {
    expect(dangerStyles).toHaveProperty('&:hover', {
      backgroundColor: dangerHoverFill,
      border: '1px solid transparent',
      color: dangerPressedInk,
    });
  });

  it('paints active LIGHTER than hover (strokeDanger fill), transparent border, white ink', () => {
    expect(dangerStyles).toHaveProperty('&:active', {
      backgroundColor: dangerActiveFill,
      border: '1px solid transparent',
      color: dangerPressedInk,
    });
  });

  it('paints disabled: brandGray fill, transparent border (no box jitter), white ink', () => {
    expect(dangerStyles).toHaveProperty('&:disabled', {
      backgroundColor: dangerDisabledFill,
      border: '1px solid transparent',
      color: dangerPressedInk,
    });
  });
});

describe('UiButton href guard (line 34: linkTarget && !isButtonElement)', () => {
  it('omits href when component is "button" even though an href is supplied', () => {
    // linkTarget is truthy ("/external") but isButtonElement is true, so the real
    // expression (linkTarget && !isButtonElement) is false and NO href is applied.
    // Both the ConditionalExpression mutant (true ? {href} : {}) and the
    // LogicalOperator mutant (linkTarget || !isButtonElement) would force the href on,
    // which makes MUI render an <a> (role "link") instead of a <button>.
    render(
      <UiButton component="button" href="/external">
        {testText}
      </UiButton>
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const button: HTMLElement = screen.getByRole('button', { name: testText });
    expect(button.tagName).toBe('BUTTON');
    expect(button).not.toHaveAttribute('href');
  });

  it('still applies href on the default anchor when no overriding component is set', () => {
    // Inverse case: linkTarget truthy AND isButtonElement false -> href IS applied.
    // Guards the truthy branch of the same expression against future regressions.
    render(<UiButton href="/external">{testText}</UiButton>);

    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/external');
  });
});
