import type { SxProps, Theme } from '@mui/material';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { ARIA_SELECTOR, expectNoLiveRegion, focusables, nodesMatching } from './dom-queries';
import firstOf from './first-of';
import type { StyleObject } from './style-layers';

/**
 * The behavioural contract every "whole card is one `role="radio"` button"
 * component in this toolkit signs: `UiIntegrationCard` and
 * `UiPaymentOptionCard` today, and anything that joins them tomorrow.
 *
 * The two suites used to carry byte-identical copies of these blocks, which
 * meant a contract change had to be remembered twice. Here it is asserted once
 * against whatever the caller renders, so a component that opts in cannot
 * quietly hold a weaker version of the contract. Everything a card does on its
 * OWN — its content tree, its chrome, its own dev-warnings — stays in that
 * component's suite, where it belongs.
 */
export interface RadioCardOverrides {
  name?: string | undefined;
  selected?: boolean | undefined;
  onSelect?: (() => void) | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  sx?: SxProps<Theme> | undefined;
}

export interface RadioCardContract {
  /** Component name, used to title the shared describes. */
  name: string;
  /** Renders the card with `extra` merged over the suite's healthy defaults. */
  cardWith: (extra: Readonly<RadioCardOverrides>) => React.ReactElement;
  /** Wraps a node in the consumer's `role="radiogroup"`. */
  inGroup: (node: React.ReactElement) => React.ReactElement;
  /** The `console.warn` handle the calling suite installed. */
  warn: { readonly spy: jest.SpyInstance };
  /** Accessible name of the default card. */
  primaryName: string;
  /** A second brand's name, reached by the tab-order sweep. */
  secondaryName: string;
  /** Wired card, static card, wired + selected card — inside one radiogroup. */
  tabOrderGroup: () => React.ReactElement;
  /** One wired card carrying the consumer's forwarded ref. */
  withRef: (ref: React.Ref<HTMLButtonElement>) => React.ReactElement;
  /** The `id` the remount / focus-return test re-resolves the card by. */
  remountId: string;
  /** Overrides producing an unusable mark bundle, for the warning assertions. */
  unusableLogo: Readonly<RadioCardOverrides>;
  /** The STATIC branch's base style layer. */
  staticBase: () => StyleObject;
}

const noop: () => void = () => undefined;

function card(): HTMLElement {
  return screen.getByRole('radio');
}

// Records every node the forwarded callback ref is handed, attach and detach.
export function collectorInto(
  seen: (HTMLButtonElement | null)[]
): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    seen.push(node);
  };
}

function describeWiredSemantics(contract: RadioCardContract): void {
  const { cardWith, primaryName } = contract;

  it('renders the whole card as one native type="button" with role="radio"', () => {
    render(cardWith({ onSelect: noop }));

    const root: HTMLElement = card();
    expect(root.tagName).toBe('BUTTON');
    expect(root).toHaveAttribute('type', 'button');
    expect(root).toHaveAttribute('role', 'radio');
    expect(root).toHaveAccessibleName(primaryName);
  });

  it('carries a permanent aria-checked that mirrors `selected` across re-renders', () => {
    const { rerender } = render(cardWith({ onSelect: noop }));

    expect(card()).toHaveAttribute('aria-checked', 'false');
    expect(card()).not.toBeChecked();

    rerender(cardWith({ selected: true, onSelect: noop }));
    expect(card()).toHaveAttribute('aria-checked', 'true');
    expect(card()).toBeChecked();

    rerender(cardWith({ selected: false, onSelect: noop }));
    expect(card()).toHaveAttribute('aria-checked', 'false');

    // Nullish coerces to `false` rather than dropping the attribute: an absent
    // aria-checked would leave the radio's state unexposed.
    rerender(cardWith({ selected: undefined, onSelect: noop }));
    expect(card()).toHaveAttribute('aria-checked', 'false');
  });

  it('never ships aria-pressed, and never a self-rendered group or set metadata', () => {
    render(cardWith({ selected: true, onSelect: noop }));

    const root: HTMLElement = card();
    // A toggle button carries no mutual exclusivity, so `aria-pressed` would
    // misdescribe the choice; the group and its set metadata are the consumer's.
    expect(root).not.toHaveAttribute('aria-pressed');
    expect(root).not.toHaveAttribute('aria-setsize');
    expect(root).not.toHaveAttribute('aria-posinset');
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root).not.toHaveAttribute('aria-haspopup');
    expect(root).not.toHaveAttribute('aria-selected');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('keeps exactly one focusable element in the tree (no nested interactive)', () => {
    render(cardWith({ onSelect: noop }));

    expect(focusables()).toHaveLength(1);
    expect(firstOf(focusables())).toBe(card());
    expect(screen.getAllByRole('radio')).toHaveLength(1);
    // No `<input type="radio">` and no MUI Radio: the glyph is paint.
    expect(nodesMatching('input')).toHaveLength(0);
  });
}

function describeStaticBranch(contract: RadioCardContract): void {
  const { cardWith, staticBase, warn } = contract;

  it('exposes zero focusable elements and zero ARIA hooks', () => {
    render(cardWith({}));

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(focusables()).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });

  it('never paints the selected state, so no checked chrome outlives aria-checked', () => {
    render(cardWith({ selected: true }));

    // The selected chrome is keyed off `[aria-checked="true"]`, an attribute this
    // branch never has — the rest presentation is structural, not conditional.
    expect(nodesMatching('[aria-checked]')).toHaveLength(0);
    expect(staticBase()['&[aria-checked="true"]']).toBeUndefined();
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('static content'));
  });

  it('shows no aria-disabled on a disabled static card', () => {
    render(cardWith({ disabled: true }));

    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });
}

function describeSelectionRequests(contract: RadioCardContract): void {
  const { cardWith } = contract;

  it('requests selection exactly once per click', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    await user.click(card());

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith();
  });

  it('requests selection exactly once on Enter (no manual key handler double-fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    card().focus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('requests selection exactly once on Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    card().focus();
    await user.keyboard(' ');

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('ignores arrow, Home/End and printable keys — no roving model lives here', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    card().focus();
    await user.keyboard('{ArrowDown}{ArrowUp}{ArrowRight}{ArrowLeft}{Home}{End}{Escape}a');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('fires nothing when an already-selected card is activated by any gesture', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ selected: true, onSelect }));

    await user.click(card());
    card().focus();
    await user.keyboard('{Enter} ');

    // Native radio `change` semantics: a radio cannot unselect itself, and a
    // repeat selection must not re-run the consumer's side effects.
    expect(onSelect).not.toHaveBeenCalled();
    expect(card()).toBeChecked();
  });

  it('stays eligible after the consumer DECLINES the selection', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    await user.click(card());
    await user.click(card());
    card().focus();
    await user.keyboard('{Enter}');

    // `selected` stayed false (the consumer declined), so every later activation
    // is reported again — the gate is state, never a latch.
    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(card()).toHaveAttribute('aria-checked', 'false');
  });

  it('never self-flips the checked state (always controlled)', async () => {
    const user: UserEvent = userEvent.setup();
    render(cardWith({ onSelect: noop }));

    await user.click(card());

    expect(card()).toHaveAttribute('aria-checked', 'false');
  });

  it('never submits an enclosing form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    const onSelect: jest.Mock = jest.fn();
    render(<form onSubmit={onSubmit}>{cardWith({ onSelect })}</form>);

    card().focus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
}

function describeDisabledBoundary(contract: RadioCardContract): void {
  const { cardWith, warn } = contract;

  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    render(cardWith({ disabled: true, onSelect: noop }));

    const root: HTMLElement = card();
    expect(root).toHaveAttribute('aria-disabled', 'true');
    // The native `disabled` attribute is NEVER set — that is what keeps the card
    // focusable while disabled (SC 2.4.3).
    expect(root.getAttributeNames()).not.toContain('disabled');
    expect(root).toBeEnabled();
    expect(root).toHaveAttribute('role', 'radio');
    expect(root).toHaveAttribute('aria-checked', 'false');
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(cardWith({ disabled: true, onSelect: noop }));

    await user.tab();
    expect(card()).toHaveFocus();
  });

  it('no-ops every activation path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ disabled: true, onSelect }));

    await user.click(card());
    card().focus();
    await user.keyboard('{Enter} ');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('retains focus when a focused card flips disabled, then restores selection', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    const { rerender } = render(cardWith({ onSelect }));

    const root: HTMLElement = card();
    root.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);

    rerender(cardWith({ disabled: true, onSelect }));
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).toHaveFocus();
    expect(document.body).not.toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);

    rerender(cardWith({ onSelect }));
    expect(root).not.toHaveAttribute('aria-disabled');
    expect(root).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('keeps the full selected chrome on a selected + disabled card', () => {
    render(cardWith({ selected: true, disabled: true, onSelect: noop }));

    // Figma ships no disabled master, so disabled invents zero visual changes:
    // both attributes are present and the selected recipe still applies.
    expect(card()).toHaveAttribute('aria-checked', 'true');
    expect(card()).toHaveAttribute('aria-disabled', 'true');
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('disabled'));
  });
}

function describeFocusAndTabOrder(contract: RadioCardContract): void {
  const { cardWith, primaryName, secondaryName, tabOrderGroup, withRef, remountId } = contract;

  it('adds no explicit tabindex, so every wired card is one native tab stop', async () => {
    const user: UserEvent = userEvent.setup();
    render(tabOrderGroup());

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('radio', { name: primaryName })).toHaveFocus();
    // No roving tabindex: the SELECTED sibling is an ordinary next stop, and the
    // static card is skipped because it is not focusable at all.
    await user.tab();
    expect(screen.getByRole('radio', { name: secondaryName })).toHaveFocus();
  });

  it('keeps focus on the card after activation (the card never moves focus)', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    const root: HTMLElement = card();
    root.focus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(root).toHaveFocus();
  });

  it('forwards an object ref to the card button itself, never a wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(withRef(ref));

    expect(ref.current).toBe(card());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node and releases it on unmount', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const { unmount } = render(withRef(collectorInto(seen)));

    expect(firstOf(seen)).toBe(card());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });

  it('re-resolves the card by id after a remount, the documented focus-return API', () => {
    const { unmount } = render(cardWith({ id: remountId, onSelect: noop }));
    expect(card()).toHaveAttribute('id', remountId);

    unmount();
    expect(nodesMatching(`#${remountId}`)).toHaveLength(0);

    render(cardWith({ id: remountId, onSelect: noop }));
    const remounted: Element = firstOf(nodesMatching(`#${remountId}`));
    expect(remounted).toBe(card());
    (remounted as HTMLElement).focus();
    expect(remounted).toHaveFocus();
  });
}

function describeLiveRegionProhibition(contract: RadioCardContract): void {
  const { cardWith } = contract;

  it('exposes none across rest, selected, disabled and selected + disabled', () => {
    const { rerender } = render(cardWith({ onSelect: noop }));
    expectNoLiveRegion();

    rerender(cardWith({ selected: true, onSelect: noop }));
    expectNoLiveRegion();

    rerender(cardWith({ disabled: true, onSelect: noop }));
    expectNoLiveRegion();

    rerender(cardWith({ selected: true, disabled: true, onSelect: noop }));
    expectNoLiveRegion();
  });

  it('exposes none on a static card, or after a real activation', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    const { rerender } = render(cardWith({}));
    expectNoLiveRegion();

    rerender(cardWith({ onSelect }));
    await user.click(card());

    expect(onSelect).toHaveBeenCalledTimes(1);
    expectNoLiveRegion();
  });
}

function describeSharedDevWarnings(contract: RadioCardContract): void {
  const { cardWith, inGroup, warn, unusableLogo } = contract;

  it('stays silent for a healthy wired card inside a radiogroup', () => {
    render(inGroup(cardWith({ onSelect: noop })));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('stays silent for a healthy static card', () => {
    render(cardWith({}));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns when `selected` arrives without `onSelect`', () => {
    render(cardWith({ selected: true }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('static content'));
  });

  it('stays silent for an explicitly unselected static card', () => {
    render(cardWith({ selected: false }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns for a whitespace-only name', () => {
    render(inGroup(cardWith({ name: '   ', onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `name`'));
  });

  it('warns for a name missing entirely', () => {
    render(inGroup(cardWith({ name: undefined, onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `name`'));
  });

  it('warns for an unusable logo bundle', () => {
    render(inGroup(cardWith({ ...unusableLogo, onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('usable `src`'));
  });

  it('warns once per warning state, not once per render', () => {
    const { rerender } = render(inGroup(cardWith({ name: '   ', onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // `useDevWarning` is keyed on the message, so a prop change that lands in the
    // SAME warning state stays quiet — a blank name and an absent one are one
    // state, and the console is not a render log.
    rerender(inGroup(cardWith({ name: undefined, onSelect: noop })));
    rerender(inGroup(cardWith({ name: '', selected: false, onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // A change INTO a different warning state does re-report.
    rerender(inGroup(cardWith({ ...unusableLogo, onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledTimes(2);
    expect(warn.spy).toHaveBeenLastCalledWith(expect.stringContaining('usable `src`'));
  });

  it('reports the unwired-selected misconfiguration ahead of the content ones', () => {
    render(cardWith({ name: '', selected: true }));

    // One warning per render, most structural first: fixing the wiring is what
    // makes the state representable at all.
    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('static content'));
  });

  it('emits nothing in production, for any of the warnings', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { rerender } = render(cardWith({ name: '', selected: true }));
      rerender(cardWith({ name: '', ...unusableLogo, onSelect: noop }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
}

function describeRadiogroupContextWarning(contract: RadioCardContract): void {
  const { cardWith, inGroup, warn } = contract;

  it('warns once for a standalone wired card', () => {
    render(cardWith({ onSelect: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('[role="radiogroup"]'));
  });

  it('does not warn for a wired card wrapped in a radiogroup', () => {
    render(inGroup(cardWith({ onSelect: noop })));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('never warns for a static card, wrapped or not', () => {
    const { rerender } = render(cardWith({}));
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(inGroup(cardWith({})));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('does not re-warn on an ordinary re-render', () => {
    const { rerender } = render(cardWith({ onSelect: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(cardWith({ selected: true, onSelect: noop }));
    rerender(cardWith({ selected: true, disabled: true, onSelect: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
  });

  it('stays silent in production', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(cardWith({ onSelect: noop }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
}

function describeConsumerSx(contract: RadioCardContract): void {
  const { cardWith } = contract;

  it('applies an object sx to the wired root, merged last', () => {
    render(cardWith({ sx: { marginTop: '1rem' }, onSelect: noop }));
    expect(card()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the static root', () => {
    render(cardWith({ id: 'styled', sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }] }));

    const root: Element = firstOf(nodesMatching('#styled'));
    expect(root).toHaveStyle({ marginTop: '1rem' });
    expect(root).toHaveStyle({ paddingTop: '2rem' });
  });
}

/** Runs every shared radio-card describe against one component's suite. */
export function describeRadioCardContract(contract: RadioCardContract): void {
  const { name } = contract;

  describe(`${name} — wired radio semantics`, () => describeWiredSemantics(contract));
  describe(`${name} — static (unwired) card`, () => describeStaticBranch(contract));
  describe(`${name} — selection requests`, () => describeSelectionRequests(contract));
  describe(`${name} — the aria-disabled boundary`, () => describeDisabledBoundary(contract));
  describe(`${name} — focus and tab order`, () => describeFocusAndTabOrder(contract));
  describe(`${name} — live-region prohibition`, () => describeLiveRegionProhibition(contract));
  describe(`${name} — shared dev warnings`, () => describeSharedDevWarnings(contract));
  describe(`${name} — radiogroup context warning`, () =>
    describeRadiogroupContextWarning(contract));
  describe(`${name} — consumer sx`, () => describeConsumerSx(contract));
}

/** The card's callback-ref hook: both cards plumb refs and mount-check alike. */
export interface RadioCardRefHookContract {
  name: string;
  useRef: (
    forwarded: React.ForwardedRef<HTMLButtonElement>,
    wired: boolean
  ) => React.RefCallback<HTMLButtonElement>;
  warn: { readonly spy: jest.SpyInstance };
}

export function describeRadioCardRefHook(contract: RadioCardRefHookContract): void {
  const { name, useRef, warn } = contract;

  describe(`${name} — ref plumbing and the radiogroup mount check`, () => {
    it('feeds a forwarded callback ref', () => {
      const seen: (HTMLButtonElement | null)[] = [];
      const node: HTMLButtonElement = document.createElement('button');
      const { result } = renderHook(() => useRef(collectorInto(seen), false));

      result.current(node);
      result.current(null);

      expect(seen).toEqual([node, null]);
    });

    it('feeds a forwarded ref object', () => {
      const node: HTMLButtonElement = document.createElement('button');
      const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
      const { result } = renderHook(() => useRef(ref, false));

      result.current(node);
      expect(ref.current).toBe(node);

      result.current(null);
      expect(ref.current).toBeNull();
    });

    it('keeps its private handle when the consumer forwards nothing', () => {
      // The common case: no consumer ref at all. The handle is still kept,
      // because the radiogroup-ancestor mount check is what reads it.
      const node: HTMLButtonElement = document.createElement('button');
      const { result } = renderHook(() => useRef(null, false));

      expect(() => result.current(node)).not.toThrow();
    });

    it('keeps the callback identity stable while the forwarded ref does not change', () => {
      const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
      const { result, rerender } = renderHook(() => useRef(ref, true));
      const first: React.RefCallback<HTMLButtonElement> = result.current;

      rerender();

      expect(result.current).toBe(first);
    });

    it('warns when a wired card has no node to check against, and stays quiet unwired', () => {
      // The card button always mounts in the real component, so this exercises
      // the hook's own guard: with no node the ancestor cannot be proven, and
      // the warning teaches rather than gates.
      renderHook(() => useRef(null, true));
      expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('[role="radiogroup"]'));

      warn.spy.mockClear();
      renderHook(() => useRef(null, false));
      expect(warn.spy).not.toHaveBeenCalled();
    });
  });
}
