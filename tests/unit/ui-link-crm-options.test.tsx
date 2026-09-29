import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { sharedPalette } from '../../src/components/ui-color-theme';
import UiLink from '../../src/components/ui-link';
import { accessibleLinkPalette } from '../../src/components/ui-link/styles';

import { emotionCssFor } from './utils/emotion-css';

const NAME: string = 'Forgot password';

function link(): HTMLElement {
  return screen.getByRole('link', { name: NAME });
}

describe('UiLink tone', () => {
  it('keeps the brand ink by default', () => {
    render(<UiLink href="/reset">{NAME}</UiLink>);

    expect(link()).toHaveStyle({ color: sharedPalette.primary.main });
  });

  it('paints the accessible ink and darkens it on hover and press', () => {
    render(
      <UiLink href="/reset" tone="accessible">
        {NAME}
      </UiLink>
    );

    expect(link()).toHaveStyle({ color: accessibleLinkPalette.rest });
    const css: string = emotionCssFor(link());
    expect(css).toMatch(new RegExp(`:hover\\s*\\{[^}]*color:\\s*${accessibleLinkPalette.hover}`));
    expect(css).toMatch(new RegExp(`:active\\s*\\{[^}]*color:\\s*${accessibleLinkPalette.hover}`));
  });

  it('keeps the disabled ink on an accessible link', () => {
    render(
      <UiLink href="/reset" tone="accessible" disabled>
        {NAME}
      </UiLink>
    );

    expect(link()).toHaveStyle({ color: sharedPalette.brandGray.main });
  });
});

describe('UiLink underline', () => {
  it('underlines always by default', () => {
    render(<UiLink href="/reset">{NAME}</UiLink>);

    expect(link()).toHaveStyle({ textDecoration: 'underline' });
  });

  it('drops the underline with underline="none"', () => {
    render(
      <UiLink href="/reset" underline="none">
        {NAME}
      </UiLink>
    );

    expect(link()).toHaveStyle({ textDecoration: 'none' });
  });

  it('underlines only on hover with underline="hover"', () => {
    render(
      <UiLink href="/reset" underline="hover">
        {NAME}
      </UiLink>
    );

    expect(link()).toHaveStyle({ textDecoration: 'none' });
    expect(emotionCssFor(link())).toMatch(/:hover\s*\{[^}]*text-decoration:\s*underline/);
  });
});

describe('UiLink forwarded props', () => {
  it('forwards id, aria attributes and onClick to the anchor', () => {
    const onClick: jest.Mock = jest.fn();
    render(
      <>
        <span id="hint">Opens the reset flow</span>
        <UiLink href="/reset" id="reset-link" aria-describedby="hint" onClick={onClick}>
          {NAME}
        </UiLink>
      </>
    );

    expect(link()).toHaveAttribute('id', 'reset-link');
    expect(link()).toHaveAccessibleDescription('Opens the reset flow');
    fireEvent.click(link());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards onAuxClick while enabled', () => {
    const onAuxClick: jest.Mock = jest.fn();
    render(
      <UiLink href="/reset" onAuxClick={onAuxClick}>
        {NAME}
      </UiLink>
    );

    fireEvent(link(), new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(onAuxClick).toHaveBeenCalledTimes(1);
  });

  it('forwards a consumer tabIndex and aria-disabled while enabled', () => {
    render(
      <UiLink href="/reset" tabIndex={0} aria-disabled="false">
        {NAME}
      </UiLink>
    );

    expect(link()).toHaveAttribute('tabindex', '0');
    expect(link()).toHaveAttribute('aria-disabled', 'false');
  });

  it('suppresses the consumer handlers and overrides tabIndex while disabled', () => {
    const onClick: jest.Mock = jest.fn();
    const onAuxClick: jest.Mock = jest.fn();
    render(
      <UiLink href="/reset" disabled tabIndex={0} onClick={onClick} onAuxClick={onAuxClick}>
        {NAME}
      </UiLink>
    );

    const clicked: boolean = fireEvent.click(link());
    fireEvent(link(), new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(clicked).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    expect(onAuxClick).not.toHaveBeenCalled();
    expect(link()).toHaveAttribute('tabindex', '-1');
    expect(link()).toHaveAttribute('aria-disabled', 'true');
  });
});
