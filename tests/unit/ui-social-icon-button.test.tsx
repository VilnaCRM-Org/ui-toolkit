import { createEvent, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiSocialIconButton from '../../src/components/ui-social-icon-button';
import { SocialGlyph } from '../../src/components/ui-social-icon-button/social-glyph';
import warning from '../../src/components/ui-social-icon-button/social-icon-button-warnings';
import { FOCUS_RING, socialIconButtonSx } from '../../src/components/ui-social-icon-button/styles';
import type { UiSocialIconButtonProps } from '../../src/components/ui-social-icon-button/types';
import {
  useSocialIconButton,
  type SocialIconButtonModel,
} from '../../src/components/ui-social-icon-button/use-social-icon-button';

import mockConsoleWarn from './utils/mock-console-warn';

// UiSocialIconButton emits two dev-only warnings via console.warn. Silence
// them for the suite and keep a handle for the assertions that need it.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// Palette literals, pinned rather than imported: a mutation that swaps a token
// for its neighbour must fail here, which it cannot do if the expectation
// reads the same token as the implementation.
const PRIMARY: string = '#1EAEFF';
const HOVER: string = '#00A3FF';
const ACTIVE: string = '#0399ED';
const BRAND_GRAY: string = '#E1E7EA';
const WHITE: string = '#FFF';
const DARK_PRIMARY: string = '#1A1C1E';
const REST_FILL: string = 'rgba(30, 174, 255, 0.1)';

describe('UiSocialIconButton', () => {
  it('renders a button (no href) with the network default accessible name', () => {
    render(<UiSocialIconButton network="instagram" />);
    const button: HTMLElement = screen.getByRole('button', { name: 'Instagram' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it.each([
    ['instagram', 'Instagram'],
    ['github', 'GitHub'],
    ['facebook', 'Facebook'],
    ['linkedin', 'LinkedIn'],
  ] as const)('defaults the %s chip name to %s', (network, name) => {
    render(<UiSocialIconButton network={network} />);
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });

  it('accepts a label override for the accessible name', () => {
    render(<UiSocialIconButton network="github" label="Our GitHub org" />);
    expect(screen.getByRole('button', { name: 'Our GitHub org' })).toBeInTheDocument();
  });

  it('forwards id onto the rendered root', () => {
    render(<UiSocialIconButton network="facebook" id="footer-facebook" />);
    expect(screen.getByRole('button', { name: 'Facebook' })).toHaveAttribute(
      'id',
      'footer-facebook'
    );
  });

  it('fires onActivate on click in button mode', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(<UiSocialIconButton network="linkedin" onActivate={onActivate} />);
    await user.click(screen.getByRole('button', { name: 'LinkedIn' }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('swallows activation and never sets native disabled on a disabled button', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(<UiSocialIconButton network="linkedin" onActivate={onActivate} disabled />);
    const button: HTMLElement = screen.getByRole('button', { name: 'LinkedIn' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled();
    await user.click(button);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('renders an anchor when href is present', () => {
    render(<UiSocialIconButton network="instagram" href="https://instagram.com/vilnacrm" />);
    const link: HTMLElement = screen.getByRole('link', { name: 'Instagram' });
    expect(link).toHaveAttribute('href', 'https://instagram.com/vilnacrm');
  });

  it('applies the UiLink disabled pattern to a disabled anchor', () => {
    render(<UiSocialIconButton network="instagram" href="https://instagram.com/x" disabled />);
    const link: HTMLElement = screen.getByRole('link', { name: 'Instagram' });
    expect(link).toHaveAttribute('href', 'https://instagram.com/x');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabIndex', '-1');
    const clickEvent: Event = createEvent.click(link);
    const preventDefault: jest.SpyInstance = jest.spyOn(clickEvent, 'preventDefault');
    fireEvent(link, clickEvent);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('does not cancel a click on an enabled anchor', () => {
    render(<UiSocialIconButton network="instagram" href="https://instagram.com/x" />);
    const link: HTMLElement = screen.getByRole('link', { name: 'Instagram' });
    expect(link).not.toHaveAttribute('aria-disabled');
    expect(link).not.toHaveAttribute('tabIndex');
    const clickEvent: Event = createEvent.click(link);
    const preventDefault: jest.SpyInstance = jest.spyOn(clickEvent, 'preventDefault');
    fireEvent(link, clickEvent);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('renders the anchor and skips onActivate when both href and onActivate are given', () => {
    const onActivate: jest.Mock = jest.fn();
    render(
      <UiSocialIconButton
        network="facebook"
        href="https://facebook.com/vilnacrm"
        onActivate={onActivate}
      />
    );
    fireEvent.click(screen.getByRole('link', { name: 'Facebook' }));
    expect(onActivate).not.toHaveBeenCalled();
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('both `href` and `onActivate`'));
  });

  it('warns once on an explicitly blank label', () => {
    render(<UiSocialIconButton network="instagram" label="" />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('does not warn when label is simply omitted', () => {
    render(<UiSocialIconButton network="instagram" />);
    expect(warn.spy).not.toHaveBeenCalled();
  });
});

// Inspected as plain React elements (the pure `styles.ts`-builder pattern),
// never rendered to the DOM: the wrapper is decorative and `aria-hidden`, so
// there is no accessible role to query through Testing Library for it.
type SvgElement = React.ReactElement<React.SVGProps<SVGSVGElement>>;
type PathElement = React.ReactElement<React.SVGProps<SVGPathElement>>;

describe('SocialGlyph', () => {
  it('sizes github at 22x22 and the other three at 20x20', () => {
    const github: SvgElement = SocialGlyph({ network: 'github' }) as SvgElement;
    expect(github.props.width).toBe(22);
    expect(github.props.height).toBe(22);
    expect(github.props.viewBox).toBe('0 0 22 22');

    const instagram: SvgElement = SocialGlyph({ network: 'instagram' }) as SvgElement;
    expect(instagram.props.width).toBe(20);
    expect(instagram.props.height).toBe(20);
    expect(instagram.props.viewBox).toBe('0 0 20 20');
  });

  it('is decorative and fills from currentColor', () => {
    const linkedin: SvgElement = SocialGlyph({ network: 'linkedin' }) as SvgElement;
    expect(linkedin.props['aria-hidden']).toBe('true');
    expect(linkedin.props.focusable).toBe('false');
    const path: PathElement = linkedin.props['children'] as PathElement;
    expect(path.props.fill).toBe('currentColor');
  });

  it('renders the facebook mark path verbatim', () => {
    const facebook: SvgElement = SocialGlyph({ network: 'facebook' }) as SvgElement;
    const path: PathElement = facebook.props['children'] as PathElement;
    expect(path.props.d).toMatch(/^M18\.3333 10C/);
  });
});

describe('socialIconButtonWarning', () => {
  const base: UiSocialIconButtonProps = { network: 'instagram' };

  it('returns null when label and href/onActivate are all unremarkable', () => {
    expect(warning(base)).toBeNull();
    expect(warning({ ...base, label: 'Instagram' })).toBeNull();
  });

  it('warns on an explicitly blank label before checking href/onActivate', () => {
    expect(warning({ ...base, label: '' })).toContain('blank `label`');
    expect(
      warning({
        ...base,
        label: '',
        href: 'https://instagram.com/x',
        onActivate: noop,
      })
    ).toContain('blank `label`');
  });

  it('warns when both href and onActivate are supplied', () => {
    expect(warning({ ...base, href: 'https://instagram.com/x', onActivate: noop })).toContain(
      'both `href` and `onActivate`'
    );
  });

  it('does not warn on href alone or onActivate alone', () => {
    expect(warning({ ...base, href: 'https://instagram.com/x' })).toBeNull();
    expect(warning({ ...base, onActivate: noop })).toBeNull();
  });
});

describe('useSocialIconButton', () => {
  it('resolves isAnchor from href presence', () => {
    const { result: withHref } = renderHook(() =>
      useSocialIconButton({ network: 'instagram', href: 'https://instagram.com/x' })
    );
    expect(withHref.current.isAnchor).toBe(true);

    const { result: withoutHref } = renderHook(() => useSocialIconButton({ network: 'github' }));
    expect(withoutHref.current.isAnchor).toBe(false);
  });

  it('resolves ariaDisabled and swallows onActivate while disabled', () => {
    const onActivate: jest.Mock = jest.fn();
    const { result } = renderHook(() =>
      useSocialIconButton({ network: 'facebook', disabled: true, onActivate })
    );
    const model: SocialIconButtonModel = result.current;
    expect(model.ariaDisabled).toBe(true);
    model.onActivate();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('fires onActivate while enabled and leaves ariaDisabled undefined', () => {
    const onActivate: jest.Mock = jest.fn();
    const { result } = renderHook(() => useSocialIconButton({ network: 'linkedin', onActivate }));
    const model: SocialIconButtonModel = result.current;
    expect(model.ariaDisabled).toBeUndefined();
    model.onActivate();
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('falls back to a no-op when onActivate is omitted', () => {
    const { result } = renderHook(() => useSocialIconButton({ network: 'instagram' }));
    expect(() => result.current.onActivate()).not.toThrow();
  });
});

describe('socialIconButtonSx', () => {
  function findRule(sx: object[], selector: string): Record<string, unknown> {
    const base: Record<string, unknown> = sx[0] as Record<string, unknown>;
    return base[selector] as Record<string, unknown>;
  }

  it('paints the rest fill, the three state fills and the shared focus ring', () => {
    const sx: object[] = socialIconButtonSx({ sx: undefined }) as object[];
    const base: Record<string, unknown> = sx[0] as Record<string, unknown>;
    expect(base.backgroundColor).toBe(REST_FILL);
    expect(base.color).toBe(PRIMARY);
    expect(base.borderRadius).toBe('50%');
    expect(base.width).toBe('2.5rem');
    expect(base.height).toBe('2.5rem');

    const hover: Record<string, unknown> = findRule(sx, '&:hover:not([aria-disabled="true"])');
    expect(hover.backgroundColor).toBe(HOVER);
    expect(hover.color).toBe(WHITE);

    const active: Record<string, unknown> = findRule(sx, '&:active:not([aria-disabled="true"])');
    expect(active.backgroundColor).toBe(ACTIVE);
    expect(active.color).toBe(WHITE);

    const disabled: Record<string, unknown> = findRule(sx, '&[aria-disabled="true"]');
    expect(disabled.backgroundColor).toBe(BRAND_GRAY);
    expect(disabled.color).toBe(WHITE);
    expect(disabled.cursor).toBe('default');

    const focus: Record<string, unknown> = findRule(sx, '&:focus-visible');
    expect(focus.boxShadow).toBe(FOCUS_RING);
    expect(FOCUS_RING).toBe(`inset 0 0 0 2px ${DARK_PRIMARY}`);
  });

  it('resets the native button chrome so no UA default border rings the chip', () => {
    const sx: object[] = socialIconButtonSx({ sx: undefined }) as object[];
    const base: Record<string, unknown> = sx[0] as Record<string, unknown>;
    expect(base.border).toBe('none');
    expect(base.appearance).toBe('none');
  });

  it('merges a plain object consumer sx after the base styles', () => {
    const sx: object[] = socialIconButtonSx({ sx: { marginLeft: '4px' } }) as object[];
    expect(sx).toHaveLength(2);
    expect(sx[1]).toEqual({ marginLeft: '4px' });
  });

  it('spreads an array consumer sx after the base styles', () => {
    const sx: object[] = socialIconButtonSx({
      sx: [{ marginLeft: '4px' }, { marginTop: '2px' }],
    }) as object[];
    expect(sx).toHaveLength(3);
    expect(sx[1]).toEqual({ marginLeft: '4px' });
    expect(sx[2]).toEqual({ marginTop: '2px' });
  });
});
