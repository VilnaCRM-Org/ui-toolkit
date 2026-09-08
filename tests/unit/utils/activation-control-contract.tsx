import type { SxProps, Theme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { ARIA_SELECTOR, focusables, nodesMatching } from './dom-queries';
import firstOf from './first-of';
import { keysMatching, type StyleObject } from './style-layers';

/** The `[base, ...consumerSx]` array every `*Sx` factory produces. */
export type SxLayers = StyleObject[];

/** The first selector key of `base` containing `fragment`, as its rule object. */
export function ruleAt(base: StyleObject, fragment: string): StyleObject {
  const [key] = keysMatching(base, fragment);
  expect(key).toBeDefined();
  return base[key as string] as StyleObject;
}

/**
 * The behavioural contract every plain "button-shaped activation control" in
 * this toolkit signs: `UiAddButton`, `UiChevronButton` and `UiClearButton` in
 * full, and `UiCopyField` for the structural pieces its clipboard-driven
 * activation still shares. The four suites used to carry byte-identical
 * copies of these blocks, which meant a contract change had to be remembered
 * four times. Here it is asserted once against whatever the caller renders,
 * so a control that opts in cannot quietly hold a weaker version. Everything
 * a control does on its OWN — its glyph geometry, its palette, its own
 * warning triggers — stays in that component's suite, where it belongs.
 */

/** The `disabled`/`id`/`lang`/`sx` subset every activation control shares. */
export interface ActivationOverrides {
  disabled?: boolean | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  sx?: SxProps<Theme> | undefined;
}

export interface ActivationControlContract {
  /** Renders the control WIRED (interactive), `extra` merged over defaults. */
  wiredWith: (extra: Readonly<ActivationOverrides>) => React.ReactElement;
  /** Resolves the one native control node the suite asserts against. */
  root: () => HTMLElement;
  /** The accessible name a default (no-overrides) wired render carries. */
  accessibleName: string;
  /** The component whose `displayName` the root-semantics test checks. */
  component: { displayName?: string | undefined };
  expectedDisplayName: string;
  /** Whether this control forwards a `lang` prop at all (chevron does not). */
  hasLang: boolean;
  warn: { readonly spy: jest.SpyInstance };
}

export interface StaticBranchContract extends ActivationControlContract {
  /** Renders the control's STATIC (unwired) branch, `extra` merged in. */
  staticWith: (extra: Readonly<ActivationOverrides>) => React.ReactElement;
  /** The decorative glyph's own class-hooked wrapper, when the control has one. */
  glyphBox?: (() => Element) | undefined;
  /** Visible label text the static branch still renders, when there is one. */
  contentText?: string | undefined;
  /** The control's own `*Sx` base-layer resolver, `interactive` gated. */
  baseOf: (interactive: boolean) => StyleObject;
}

export interface DirectActivationContract extends ActivationControlContract {
  /** Renders the control WIRED, forwarding `onActivate` and `extra`. */
  withActivation: (
    onActivate: (() => void) | undefined,
    extra: Readonly<ActivationOverrides>
  ) => React.ReactElement;
}

export interface RefForwardingContract extends ActivationControlContract {
  withRef: (ref: React.Ref<HTMLButtonElement>) => React.ReactElement;
  /** Renders two named, wired siblings the tab-order sweep walks in order. */
  tabOrderSiblings: () => React.ReactElement;
  firstName: string | RegExp;
  secondName: string | RegExp;
}

/** Records every node a forwarded callback ref is handed, attach and detach. */
export function collectorInto(
  seen: (HTMLButtonElement | null)[]
): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    seen.push(node);
  };
}

/** Native button shape, accessible name, single tab stop, id/lang, display name. */
export function describeButtonRoot(contract: ActivationControlContract): void {
  const { wiredWith, root, accessibleName, hasLang, component, expectedDisplayName } = contract;

  it('renders as one native type="button" with no implicit role hack', () => {
    render(wiredWith({}));

    const node: HTMLElement = root();
    expect(node.tagName).toBe('BUTTON');
    expect(node).toHaveAttribute('type', 'button');
    expect(node).not.toHaveAttribute('role');
    expect(node).toHaveAccessibleName(accessibleName);
  });

  it('keeps exactly one focusable element', () => {
    render(wiredWith({}));

    expect(focusables()).toHaveLength(1);
    expect(firstOf(focusables())).toBe(root());
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('applies id and lang only when the consumer supplies them', () => {
    const { rerender } = render(wiredWith({}));

    expect(root()).not.toHaveAttribute('id');
    if (hasLang) {
      expect(root()).not.toHaveAttribute('lang');
    }

    rerender(wiredWith({ id: 'activation-control', lang: hasLang ? 'ru' : undefined }));
    expect(root()).toHaveAttribute('id', 'activation-control');
    if (hasLang) {
      expect(root()).toHaveAttribute('lang', 'ru');
    }
  });

  it('exposes its display name', () => {
    expect(component.displayName).toBe(expectedDisplayName);
  });
}

/** The forbidden-attribute sweep every plain action control repeats. */
export function describeNoAriaState(
  contract: ActivationControlContract,
  extraForbidden: readonly string[] = []
): void {
  it('ships no ARIA state beyond the aria-disabled boundary', () => {
    render(contract.wiredWith({}));

    const node: HTMLElement = contract.root();
    const forbidden: readonly string[] = [
      'aria-pressed',
      'aria-expanded',
      'aria-haspopup',
      'aria-disabled',
      ...extraForbidden,
    ];
    forbidden.forEach((attr: string): void => {
      expect(node).not.toHaveAttribute(attr);
    });
  });
}

/** The decorative-glyph sweep: aria-hidden, unfocusable, never a control. */
export function describeGlyphDecoration(
  contract: ActivationControlContract,
  options: Readonly<{ glyphBox?: (() => Element) | undefined; checkTabindex?: boolean }> = {}
): void {
  const { glyphBox, checkTabindex = false } = options;

  it('renders the glyph as an aria-hidden decoration that is never a control', () => {
    render(contract.wiredWith({}));

    const svg: Element = firstOf(nodesMatching('svg'));
    if (glyphBox) {
      const box: Element = glyphBox();
      expect(box.tagName).toBe('SPAN');
      expect(box).not.toHaveAttribute('role');
      if (checkTabindex) {
        expect(box).not.toHaveAttribute('tabindex');
      }
    }
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(nodesMatching('title')).toHaveLength(0);
    expect(nodesMatching('svg')).toHaveLength(1);
  });
}

/** The unwired branch: no interactivity hooks, no disabled paint, inert. */
export function describeStaticBranch(contract: StaticBranchContract): void {
  const { staticWith, hasLang, glyphBox, contentText, baseOf } = contract;

  it('exposes zero buttons, zero focusable elements and zero ARIA hooks', () => {
    render(staticWith({}));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(focusables()).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });

  it('keeps the identical content tree, with the consumer id (and lang)', () => {
    render(staticWith({ id: 'static-control', lang: hasLang ? 'ru' : undefined }));

    const node: Element = firstOf(nodesMatching('#static-control'));
    expect(node.tagName).toBe('SPAN');
    if (hasLang) {
      expect(node).toHaveAttribute('lang', 'ru');
    }
    if (glyphBox) {
      expect(node.contains(glyphBox())).toBe(true);
    }
    if (contentText) {
      expect(screen.getByText(contentText)).toBeInTheDocument();
    }
    expect(nodesMatching('svg')).toHaveLength(1);
  });

  it('never paints the disabled state, so no grey outlives aria-disabled', () => {
    render(staticWith({ disabled: true }));

    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
    expect(baseOf(false)['&[aria-disabled="true"]']).toBeUndefined();
  });

  it('never fires anything, because there is nothing to activate', async () => {
    const user: UserEvent = userEvent.setup();
    render(staticWith({ id: 'static-control' }));

    const node: HTMLElement = firstOf(nodesMatching('#static-control')) as HTMLElement;
    await user.click(node);
    await user.tab();

    expect(node).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });
}

/** Click/Enter/Space activation, exactly once, and no accidental form submit. */
export function describeActivationRequests(contract: DirectActivationContract): void {
  const { withActivation, root } = contract;

  it('requests activation exactly once per click, with no payload', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(withActivation(onActivate, {}));

    await user.click(root());

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith();
  });

  it('requests activation exactly once on Enter (no manual key handler double-fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(withActivation(onActivate, {}));

    root().focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('requests activation exactly once on Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(withActivation(onActivate, {}));

    root().focus();
    await user.keyboard(' ');

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('never submits an enclosing form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    const onActivate: jest.Mock = jest.fn();
    render(<form onSubmit={onSubmit}>{withActivation(onActivate, {})}</form>);

    root().focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
}

/** The aria-disabled boundary's baseline: still focusable, still reachable. */
export function describeAriaDisabledFocusable(contract: ActivationControlContract): void {
  const { wiredWith, root } = contract;

  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    render(wiredWith({ disabled: true }));

    const node: HTMLElement = root();
    expect(node).toHaveAttribute('aria-disabled', 'true');
    expect(node.getAttributeNames()).not.toContain('disabled');
    expect(node).toBeEnabled();
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(wiredWith({ disabled: true }));

    await user.tab();
    expect(root()).toHaveFocus();
  });
}

/** Every activation path (click, Enter, Space) no-ops while disabled. */
export function describeNoOpsWhileDisabled(contract: DirectActivationContract): void {
  const { withActivation, root } = contract;

  it('no-ops every activation path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(withActivation(onActivate, { disabled: true }));

    await user.click(root());
    root().focus();
    await user.keyboard('{Enter} ');

    expect(onActivate).not.toHaveBeenCalled();
  });
}

/** Focus survives a disabled flip in either direction, and re-activates. */
export function describeRetainsFocusAcrossDisabledFlip(contract: DirectActivationContract): void {
  const { withActivation, root } = contract;

  it('retains focus across a disabled flip, and re-activates once re-enabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    const { rerender } = render(withActivation(onActivate, {}));

    const node: HTMLElement = root();
    node.focus();
    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);

    rerender(withActivation(onActivate, { disabled: true }));
    expect(node).toHaveAttribute('aria-disabled', 'true');
    expect(node).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);

    rerender(withActivation(onActivate, {}));
    expect(node).not.toHaveAttribute('aria-disabled');
    expect(node).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(2);
  });
}

/** Native tab order (no explicit tabindex) plus object/callback ref forwarding. */
export function describeTabOrderAndRefs(contract: RefForwardingContract): void {
  const { tabOrderSiblings, firstName, secondName, withRef, root } = contract;

  it('adds no explicit tabindex, so every wired control is one native tab stop', async () => {
    const user: UserEvent = userEvent.setup();
    render(tabOrderSiblings());

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('button', { name: firstName })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: secondName })).toHaveFocus();
  });

  it('forwards an object ref to the control itself, never a wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(withRef(ref));

    expect(ref.current).toBe(root());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node and releases it on unmount', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const { unmount } = render(withRef(collectorInto(seen)));

    expect(firstOf(seen)).toBe(root());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });
}

/** A static (unwired) control hands back no ref — there is no node to give. */
export function describeStaticRefIsNull(
  staticWithRef: (ref: React.Ref<HTMLButtonElement>) => React.ReactElement
): void {
  it('hands back nothing on a static control — there is no focusable node to return', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(staticWithRef(ref));

    expect(ref.current).toBeNull();
  });
}

/** Consumer `sx`: an object layer on the wired root, array layers merged in order. */
export function describeConsumerSx(
  contract: ActivationControlContract,
  arraySx: Readonly<{ render: (sx: SxProps<Theme>) => React.ReactElement; target: () => Element }>
): void {
  it('applies an object sx to the wired root, merged last', () => {
    render(contract.wiredWith({ sx: { marginTop: '1rem' } }));
    expect(contract.root()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the root', () => {
    render(arraySx.render([{ marginTop: '1rem' }, { paddingTop: '2rem' }]));

    const node: Element = arraySx.target();
    expect(node).toHaveStyle({ marginTop: '1rem' });
    expect(node).toHaveStyle({ paddingTop: '2rem' });
  });
}

/** The focus-ring z-order every `*Sx` recipe repeats: after hover/active/disabled. */
export function describeFocusRingOrder(
  baseOf: () => StyleObject,
  ringKeyOf: (keys: string[]) => number
): void {
  it('declares the ring AFTER hover, active and disabled', () => {
    const keys: string[] = Object.keys(baseOf());
    const hover: number = keys.findIndex((key: string) => key.includes(':hover'));
    const active: number = keys.findIndex((key: string) => key.includes(':active'));
    const disabled: number = keys.indexOf('&[aria-disabled="true"]');
    const ring: number = ringKeyOf(keys);

    expect(hover).toBeGreaterThanOrEqual(0);
    expect(active).toBeGreaterThan(hover);
    expect(disabled).toBeGreaterThan(active);
    expect(ring).toBeGreaterThan(disabled);
  });
}

export interface WarnRenderStep {
  render: () => React.ReactElement;
  expectedCallCount: number;
  expectedMessageFragment?: string | undefined;
}

/**
 * Runs a chain of renders/rerenders, asserting `warn`'s call count after each
 * — the "silent when healthy" and "warns once per state, not once per
 * render" shapes every control's dev-warning suite repeats with its own
 * trigger props and messages.
 */
export function describeWarnSequence(
  warn: { readonly spy: jest.SpyInstance },
  title: string,
  steps: readonly WarnRenderStep[]
): void {
  it(title, () => {
    const [first, ...rest] = steps;
    if (!first) {
      throw new Error('describeWarnSequence requires at least one step');
    }

    const { rerender } = render(first.render());
    expect(warn.spy).toHaveBeenCalledTimes(first.expectedCallCount);
    if (first.expectedMessageFragment) {
      expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining(first.expectedMessageFragment));
    }

    rest.forEach((step: WarnRenderStep): void => {
      rerender(step.render());
      expect(warn.spy).toHaveBeenCalledTimes(step.expectedCallCount);
      if (step.expectedMessageFragment) {
        expect(warn.spy).toHaveBeenLastCalledWith(
          expect.stringContaining(step.expectedMessageFragment)
        );
      }
    });
  });
}

/** The "emits nothing in production" shape every warning suite repeats. */
export function describeSilentInProduction(
  warn: { readonly spy: jest.SpyInstance },
  steps: readonly (() => React.ReactElement)[]
): void {
  it('emits nothing in production', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const [first, ...rest] = steps;
      if (!first) {
        throw new Error('describeSilentInProduction requires at least one step');
      }

      const { rerender } = render(first());
      rest.forEach((step: () => React.ReactElement): void => {
        rerender(step());
      });
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
}
