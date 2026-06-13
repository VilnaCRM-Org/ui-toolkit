import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { UiButton } from '../../src/components';
import { containedStyles, outlinedStyles } from '../../src/components/UiButton/theme';

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

  it('resolves a string to prop directly into an anchor href', () => {
    const { getByRole } = render(<UiButton to="/dashboard">{testText}</UiButton>);

    const link: HTMLElement = getByRole('link', { name: testText });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('fills in empty segments when the to object only provides a pathname', () => {
    const { getByRole } = render(<UiButton to={{ pathname: '/profile' }}>{testText}</UiButton>);

    const link: HTMLElement = getByRole('link', { name: testText });
    expect(link).toHaveAttribute('href', '/profile');
  });

  it('fills in empty segments when the to object only provides a hash', () => {
    const { getByRole } = render(<UiButton to={{ hash: '#top' }}>{testText}</UiButton>);

    const link: HTMLElement = getByRole('link', { name: testText });
    expect(link).toHaveAttribute('href', '#top');
  });

  it('renders a plain button when the to object resolves to an empty string', () => {
    const { getByRole, queryByRole } = render(<UiButton to={{}}>{testText}</UiButton>);

    expect(queryByRole('link')).not.toBeInTheDocument();
    const button: HTMLElement = getByRole('button', { name: testText });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('href');
  });

  it('honours an explicit non-button component, dropping type but keeping the href', () => {
    const { getByText } = render(
      <UiButton component="span" href="/external">
        {testText}
      </UiButton>
    );

    const element: HTMLElement = getByText(testText).closest('span') as HTMLElement;
    expect(element.tagName).toBe('SPAN');
    expect(element).not.toHaveAttribute('type');
    expect(element).toHaveAttribute('href', '/external');
  });

  it('keeps the type attribute when component is explicitly "button"', () => {
    const { getByRole } = render(
      <UiButton component="button" type="submit">
        {testText}
      </UiButton>
    );

    const button: HTMLElement = getByRole('button', { name: testText });
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
});
