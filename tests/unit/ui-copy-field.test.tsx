import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiCopyField from '../../src/components/ui-copy-field';
import copyFieldWarning from '../../src/components/ui-copy-field/copy-field-warnings';
import { CopyGlyph, COPY_ICON_PATH } from '../../src/components/ui-copy-field/copy-glyph';
import {
  COPY_FIELD_GLYPH_CLASS,
  COPY_FIELD_VALUE_CLASS,
  FOCUS_RING,
  FOCUS_SELECTORS,
  HOVER_SHADOW,
  copyFieldGlyphSx,
  copyFieldSx,
  copyFieldValueSx,
} from '../../src/components/ui-copy-field/styles';
import type { UiCopyFieldProps } from '../../src/components/ui-copy-field/types';
import {
  DEFAULT_COPY_LABEL,
  useCopyField,
  type CopyFieldModel,
} from '../../src/components/ui-copy-field/use-copy-field';

import mockConsoleWarn from './utils/mock-console-warn';

// UiCopyField emits the two dev-only accessible-name warnings via console.warn.
// Silence them for the suite and keep a handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// The Figma Board A sample string, verbatim.
const VALUE: string = '5POLGOPWQZFCCFEI';
const SUFFIX: string = 'Копіювати';

// Name = visible text FIRST, copy semantics appended (SC 2.5.3). The
// accessible name algorithm joins the two text nodes with a single space.
const FIELD_NAME: string = `${VALUE} ${SUFFIX}`;

// Palette literals, pinned rather than imported: a mutation that swaps a token
// for its neighbour must fail here, which it cannot do if the expectation
// reads the same token as the implementation.
const GREY500: string = '#EAECEE';
const GREY400: string = '#D0D4D8';
const GREY300: string = '#969B9D';
const GREY250: string = '#57595B';
const DARK_PRIMARY: string = '#1A1C1E';
const PRIMARY: string = '#1EAEFF';
const WHITE: string = '#FFF';

interface FieldOverrides {
  value?: string;
  copyLabel?: string;
  onCopy?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
  sx?: UiCopyFieldProps['sx'];
}

// Props are applied one by one (the repo forbids JSX spreading). `in` checks
// keep the "runtime data violates the prop type" fixtures — an absent value —
// expressible as an explicit `undefined`.
function fieldWith(extra: Readonly<FieldOverrides>): React.ReactElement {
  const value: string = ('value' in extra ? extra.value : VALUE) as string;
  return (
    <UiCopyField
      value={value}
      copyLabel={extra.copyLabel}
      onCopy={extra.onCopy}
      onCopyError={extra.onCopyError}
      disabled={extra.disabled}
      id={extra.id}
      lang={extra.lang}
      sx={extra.sx}
    />
  );
}

function field(): HTMLElement {
  return screen.getByRole('button');
}

function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

function glyphBox(): Element {
  return nodesMatching(`.${COPY_FIELD_GLYPH_CLASS}`)[0];
}

// Every hook that would make something else in the chip focusable. Exactly
// one match is allowed.
const FOCUSABLE_SELECTOR: string =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable]';

function focusables(): Element[] {
  return nodesMatching(FOCUSABLE_SELECTOR);
}

function liveRegionNodes(): Element[] {
  return Array.from(
    document.querySelectorAll('[aria-live], [aria-atomic], [aria-relevant], output')
  );
}

function expectNoLiveRegion(): void {
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByRole('log')).not.toBeInTheDocument();
  expect(liveRegionNodes()).toHaveLength(0);
}

// `copyFieldSx` is typed as the broad `SxProps` union; in practice it always
// returns the `[base, ...consumerSx]` array. Narrow it once here so the layer
// assertions can index into the produced style objects.
type StyleObject = Record<string, unknown>;
type SxLayers = StyleObject[];

function layersOf(sx: UiCopyFieldProps['sx']): SxLayers {
  return copyFieldSx(sx) as SxLayers;
}

function baseOf(): StyleObject {
  return layersOf(undefined)[0];
}

function keysMatching(base: StyleObject, fragment: string): string[] {
  return Object.keys(base).filter((key: string) => key.includes(fragment));
}

function ruleAt(base: StyleObject, fragment: string): StyleObject {
  return base[keysMatching(base, fragment)[0]] as StyleObject;
}

// Records every node the forwarded callback ref is handed, attach and detach.
function collectorInto(
  seen: (HTMLButtonElement | null)[]
): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    seen.push(node);
  };
}

// Stubs `navigator.clipboard` for the three activation branches the contract
// requires be covered: success, a rejected promise, and the API absent
// entirely. Always restores the original descriptor after each test.
function stubClipboard(writeText: ((value: string) => Promise<void>) | undefined): void {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText ? { writeText } : undefined,
    configurable: true,
    writable: true,
  });
}

describe('UiCopyField — button semantics', () => {
  afterEach(() => stubClipboard(undefined));

  it('renders the whole pill as ONE native type="button" with no implicit role hack', () => {
    render(fieldWith({}));

    const root: HTMLElement = field();
    expect(root.tagName).toBe('BUTTON');
    expect(root).toHaveAttribute('type', 'button');
    expect(root).not.toHaveAttribute('role');
    expect(root).toHaveAccessibleName(FIELD_NAME);
  });

  it('ships no ARIA state beyond the disabled boundary', () => {
    render(fieldWith({}));

    const root: HTMLElement = field();
    expect(root).not.toHaveAttribute('aria-pressed');
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root.getAttributeNames()).not.toContain('aria-checked');
    expect(root).not.toHaveAttribute('aria-disabled');
  });

  it('keeps exactly one focusable element', () => {
    render(fieldWith({}));

    expect(focusables()).toHaveLength(1);
    expect(focusables()[0]).toBe(field());
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('paints the value as a plain span carrying the class hook', () => {
    render(fieldWith({}));

    const value: Element = nodesMatching(`.${COPY_FIELD_VALUE_CLASS}`)[0];
    expect(value.tagName).toBe('SPAN');
    expect(screen.getByText(VALUE)).toBe(value);
    expect(nodesMatching(`.${COPY_FIELD_VALUE_CLASS}`)).toHaveLength(1);
  });

  it('renders the glyph as an aria-hidden decoration that is never a control', () => {
    render(fieldWith({}));

    const box: Element = glyphBox();
    const svg: Element = nodesMatching('svg')[0];
    expect(box.tagName).toBe('SPAN');
    expect(box).not.toHaveAttribute('role');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(nodesMatching('title')).toHaveLength(0);
    expect(nodesMatching('svg')).toHaveLength(1);
  });

  it('applies id and lang only when the consumer supplies them', () => {
    const { rerender } = render(fieldWith({}));

    expect(field()).not.toHaveAttribute('id');
    expect(field()).not.toHaveAttribute('lang');

    rerender(fieldWith({ id: 'copy-token', lang: 'en' }));
    expect(field()).toHaveAttribute('id', 'copy-token');
    expect(field()).toHaveAttribute('lang', 'en');
  });

  it('exposes its display name', () => {
    expect(UiCopyField.displayName).toBe('UiCopyField');
  });
});

describe('UiCopyField — clipboard activation', () => {
  afterEach(() => stubClipboard(undefined));

  it('writes the value and reports onCopy on a successful clipboard write', async () => {
    const user: UserEvent = userEvent.setup();
    const writeText: jest.Mock = jest.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const onCopy: jest.Mock = jest.fn();
    const onCopyError: jest.Mock = jest.fn();
    render(fieldWith({ onCopy, onCopyError }));

    await user.click(field());

    expect(writeText).toHaveBeenCalledWith(VALUE);
    await screen.findByRole('button');
    expect(onCopy).toHaveBeenCalledWith(VALUE);
    expect(onCopyError).not.toHaveBeenCalled();
  });

  it('reports onCopyError, not onCopy, when the clipboard write rejects', async () => {
    const user: UserEvent = userEvent.setup();
    const rejection: Error = new Error('denied');
    stubClipboard(jest.fn().mockRejectedValue(rejection));
    const onCopy: jest.Mock = jest.fn();
    const onCopyError: jest.Mock = jest.fn();
    render(fieldWith({ onCopy, onCopyError }));

    await user.click(field());
    await waitForCall(onCopyError);

    expect(onCopy).not.toHaveBeenCalled();
    expect(onCopyError).toHaveBeenCalledWith(rejection);
  });

  it('reports onCopyError when navigator.clipboard is absent entirely', async () => {
    const user: UserEvent = userEvent.setup();
    stubClipboard(undefined);
    const onCopy: jest.Mock = jest.fn();
    const onCopyError: jest.Mock = jest.fn();
    render(fieldWith({ onCopy, onCopyError }));

    await user.click(field());
    await waitForCall(onCopyError);

    expect(onCopy).not.toHaveBeenCalled();
    expect(onCopyError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('activates on Enter and Space, once per key', async () => {
    const user: UserEvent = userEvent.setup();
    stubClipboard(jest.fn().mockResolvedValue(undefined));
    const onCopy: jest.Mock = jest.fn();
    render(fieldWith({ onCopy }));

    field().focus();
    await user.keyboard('{Enter}');
    await waitForCall(onCopy);
    await user.keyboard(' ');
    await waitForCallCount(onCopy, 2);

    expect(onCopy).toHaveBeenCalledTimes(2);
  });

  it('never submits an enclosing form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    stubClipboard(jest.fn().mockResolvedValue(undefined));
    const onSubmit: jest.Mock = jest.fn();
    render(<form onSubmit={onSubmit}>{fieldWith({})}</form>);

    field().focus();
    await user.keyboard('{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not throw when activated with no callbacks supplied at all', async () => {
    const user: UserEvent = userEvent.setup();
    stubClipboard(jest.fn().mockResolvedValue(undefined));
    render(fieldWith({}));

    await user.click(field());
    expect(field()).toBeInTheDocument();
  });
});

// Small polling helper: the activation click fires an async clipboard promise
// chain, so assertions on its outcome must wait a macrotask rather than assume
// synchronous completion.
function waitForCall(mock: jest.Mock): Promise<void> {
  return waitForCallCount(mock, 1);
}

async function waitForCallCount(mock: jest.Mock, count: number): Promise<void> {
  for (let attempt: number = 0; attempt < 20 && mock.mock.calls.length < count; attempt += 1) {
    await Promise.resolve();
  }
}

describe('UiCopyField — disabled (aria-disabled boundary)', () => {
  afterEach(() => stubClipboard(undefined));

  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    render(fieldWith({ disabled: true }));

    const root: HTMLElement = field();
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root.getAttributeNames()).not.toContain('disabled');
    expect(root).toBeEnabled();
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(fieldWith({ disabled: true }));

    await user.tab();
    expect(field()).toHaveFocus();
  });

  it('no-ops every activation path while disabled, without touching the clipboard', async () => {
    const user: UserEvent = userEvent.setup();
    const writeText: jest.Mock = jest.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const onCopy: jest.Mock = jest.fn();
    render(fieldWith({ disabled: true, onCopy }));

    await user.click(field());
    field().focus();
    await user.keyboard('{Enter} ');

    expect(writeText).not.toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('retains focus when a focused chip flips disabled', async () => {
    const user: UserEvent = userEvent.setup();
    stubClipboard(jest.fn().mockResolvedValue(undefined));
    const { rerender } = render(fieldWith({}));

    const root: HTMLElement = field();
    root.focus();

    rerender(fieldWith({ disabled: true }));
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).toHaveFocus();

    rerender(fieldWith({}));
    expect(root).not.toHaveAttribute('aria-disabled');
    expect(root).toHaveFocus();
    await user.keyboard('{Enter}');
  });

  it('keeps the full accessible name while disabled', () => {
    render(fieldWith({ disabled: true }));

    expect(field()).toHaveAccessibleName(FIELD_NAME);
  });
});

describe('UiCopyField — focus and ref forwarding', () => {
  it('adds no explicit tabindex, so the chip is one native tab stop', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <div>
        <UiCopyField value="AAA" />
        <UiCopyField value="BBB" />
      </div>
    );

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('button', { name: /AAA/ })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: /BBB/ })).toHaveFocus();
  });

  it('forwards an object ref to the chip button itself', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiCopyField ref={ref} value={VALUE} />);

    expect(ref.current).toBe(field());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node and releases it on unmount', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const collect: (node: HTMLButtonElement | null) => void = collectorInto(seen);
    const { unmount } = render(<UiCopyField ref={collect} value={VALUE} />);

    expect(seen[0]).toBe(field());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });

  it('re-resolves the chip by id after a remount', () => {
    const { unmount } = render(fieldWith({ id: 'copy-3' }));
    expect(field()).toHaveAttribute('id', 'copy-3');

    unmount();
    expect(nodesMatching('#copy-3')).toHaveLength(0);

    render(fieldWith({ id: 'copy-3' }));
    const remounted: Element = nodesMatching('#copy-3')[0];
    expect(remounted).toBe(field());
  });
});

describe('UiCopyField — accessible name', () => {
  it('names the field value + hidden suffix, visible text first', () => {
    render(fieldWith({}));

    const name: string = field().textContent ?? '';
    expect(field()).toHaveAccessibleName(FIELD_NAME);
    expect(name.indexOf(VALUE)).toBe(0);
    expect(name.indexOf(SUFFIX)).toBeGreaterThan(name.indexOf(VALUE));
  });

  it('carries no aria-label, aria-labelledby or title anywhere in the tree', () => {
    render(fieldWith({}));

    expect(nodesMatching('[aria-label], [aria-labelledby], [title]')).toHaveLength(0);
    expect(field()).not.toHaveAttribute('aria-label');
  });

  it('honours a copyLabel override in the name', () => {
    render(fieldWith({ copyLabel: 'Скопіювати код' }));

    expect(field()).toHaveAccessibleName(`${VALUE} Скопіювати код`);
    expect(screen.queryByText(SUFFIX)).not.toBeInTheDocument();
  });

  it('hides the suffix visually with the shared srOnly clip recipe', () => {
    render(fieldWith({}));

    const hidden: HTMLElement = screen.getByText(SUFFIX);
    expect(hidden.tagName).toBe('SPAN');
    expect(hidden).toHaveStyle({ position: 'absolute', width: '1px', height: '1px' });
    expect(hidden).not.toHaveAttribute('aria-hidden');
  });
});

describe('UiCopyField — live-region prohibition', () => {
  it('exposes none across rest and disabled', () => {
    const { rerender } = render(fieldWith({}));
    expectNoLiveRegion();

    rerender(fieldWith({ disabled: true }));
    expectNoLiveRegion();
  });

  it('exposes none after a successful copy', async () => {
    const user: UserEvent = userEvent.setup();
    stubClipboard(jest.fn().mockResolvedValue(undefined));
    render(fieldWith({}));

    await user.click(field());
    expectNoLiveRegion();
    stubClipboard(undefined);
  });
});

describe('UiCopyField — dev warnings', () => {
  it('stays silent for a healthy field', () => {
    render(fieldWith({}));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns when value is blank — nothing to copy', () => {
    render(fieldWith({ value: '  ' }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('nothing to copy'));
  });

  it('warns when value is entirely absent', () => {
    render(fieldWith({ value: undefined }));

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('nothing to copy'));
  });

  it('warns for a blank copyLabel override', () => {
    render(fieldWith({ copyLabel: '   ' }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `copyLabel`'));
  });

  it('treats an omitted copyLabel as a default, never as an override', () => {
    render(fieldWith({ copyLabel: undefined }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('reports the blank-value misconfiguration ahead of the blank suffix', () => {
    render(fieldWith({ value: '', copyLabel: '' }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('nothing to copy'));
  });

  it('warns once per warning state, not once per render', () => {
    const { rerender } = render(fieldWith({ value: '' }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(fieldWith({ value: '   ' }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(fieldWith({ copyLabel: '' }));
    expect(warn.spy).toHaveBeenCalledTimes(2);
    expect(warn.spy).toHaveBeenLastCalledWith(expect.stringContaining('blank `copyLabel`'));
  });

  it('emits nothing in production, for either warning', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { rerender } = render(fieldWith({ value: '' }));
      rerender(fieldWith({ copyLabel: '' }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('copyFieldWarning — first-applicable selector (pure)', () => {
  function warningFor(props: Readonly<Partial<UiCopyFieldProps>>): string | null {
    return copyFieldWarning(props as UiCopyFieldProps);
  }

  it('returns null for healthy props', () => {
    expect(warningFor({ value: VALUE })).toBeNull();
    expect(warningFor({ value: VALUE, copyLabel: SUFFIX })).toBeNull();
  });

  it('reports the blank value for every blank, missing and whitespace form', () => {
    expect(warningFor({ value: '' })).toContain('nothing to copy');
    expect(warningFor({ value: '   ' })).toContain('nothing to copy');
    expect(warningFor({})).toContain('nothing to copy');
  });

  it('reports the blank copyLabel only when it is an explicit blank override', () => {
    expect(warningFor({ value: VALUE, copyLabel: '' })).toContain('blank `copyLabel`');
    expect(warningFor({ value: VALUE, copyLabel: '  ' })).toContain('blank `copyLabel`');
    expect(warningFor({ value: VALUE, copyLabel: undefined })).toBeNull();
  });

  it('prefers the blank value when both faults are present', () => {
    expect(warningFor({ value: '', copyLabel: '' })).toContain('nothing to copy');
  });
});

describe('UiCopyField — consumer sx', () => {
  it('applies an object sx to the root, merged last', () => {
    render(fieldWith({ sx: { marginTop: '1rem' } }));
    expect(field()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the root', () => {
    render(fieldWith({ sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }] }));

    expect(field()).toHaveStyle({ marginTop: '1rem' });
    expect(field()).toHaveStyle({ paddingTop: '2rem' });
  });
});

describe('copyFieldSx — style assembly (pure, mutation-killing)', () => {
  it('pins the chip box to the measured 226x36 master geometry', () => {
    const base: StyleObject = baseOf();

    expect(base.boxSizing).toBe('border-box');
    expect(base.display).toBe('inline-flex');
    expect(base.alignItems).toBe('center');
    expect(base.gap).toBe('0.5rem');
    expect(base.minHeight).toBe('2.25rem');
    expect(base.width).toBeUndefined();
    expect(base.margin).toBe(0);
    expect(base.padding).toBe('0.5rem 0.875rem');
    expect(base.borderRadius).toBe('0.25rem');
    expect(base.backgroundColor).toBe(GREY500);
    expect(base.textAlign).toBe('left');
    expect(base.font).toBe('inherit');
    expect(base.cursor).toBe('pointer');
    expect(base.appearance).toBe('none');
  });

  it('keeps the border a constant 1px in every state, swapping only its colour', () => {
    const base: StyleObject = baseOf();
    const hover: StyleObject = ruleAt(base, ':hover');
    const active: StyleObject = ruleAt(base, ':active');

    expect(base.border).toBe('1px solid transparent');
    expect(hover.border).toBeUndefined();
    expect(hover.borderColor).toBe(GREY400);
    expect(active.border).toBeUndefined();
    expect(active.borderColor).toBe(GREY400);
  });

  it('gates hover on the aria-disabled boundary and paints the Figma hover column', () => {
    const base: StyleObject = baseOf();
    const hoverKeys: string[] = keysMatching(base, ':hover');

    expect(hoverKeys).toEqual(['&:hover:not([aria-disabled="true"])']);
    expect(base[hoverKeys[0]]).toEqual({
      backgroundColor: WHITE,
      borderColor: GREY400,
      boxShadow: HOVER_SHADOW,
      [`& .${COPY_FIELD_VALUE_CLASS}`]: { color: DARK_PRIMARY },
      [`& .${COPY_FIELD_GLYPH_CLASS}`]: { color: PRIMARY },
    });
  });

  it('gates :active on the same boundary and drops the shadow — no extra darken step', () => {
    const base: StyleObject = baseOf();
    const activeKeys: string[] = keysMatching(base, ':active');

    expect(activeKeys).toEqual(['&:active:not([aria-disabled="true"])']);
    expect(base[activeKeys[0]]).toEqual({
      backgroundColor: WHITE,
      borderColor: GREY400,
      boxShadow: undefined,
      [`& .${COPY_FIELD_VALUE_CLASS}`]: { color: DARK_PRIMARY },
      [`& .${COPY_FIELD_GLYPH_CLASS}`]: { color: PRIMARY },
    });
  });

  it('pins the off-palette Figma drop shadow exactly, doubled per the conversion rule', () => {
    expect(HOVER_SHADOW).toBe('0 8px 15px rgba(49, 59, 67, 0.14)');
  });

  it('paints the disabled column on both segments, with no opacity dimming', () => {
    const disabled: StyleObject = baseOf()['&[aria-disabled="true"]'] as StyleObject;

    expect(disabled).toEqual({
      cursor: 'default',
      [`& .${COPY_FIELD_VALUE_CLASS}`]: { color: GREY300 },
      [`& .${COPY_FIELD_GLYPH_CLASS}`]: { color: GREY300 },
    });
    expect(disabled.opacity).toBeUndefined();
    expect(disabled.backgroundColor).toBeUndefined();
  });

  it('ships the Amendment-A1 two-selector ring, verbatim, over the hover gate', () => {
    const base: StyleObject = baseOf();
    const ringKeys: string[] = keysMatching(base, ':focus-visible');

    expect(ringKeys).toEqual([FOCUS_SELECTORS]);
    expect(FOCUS_SELECTORS).toBe('&:focus-visible, &:focus-visible:not([aria-disabled="true"])');
    expect(base[ringKeys[0]]).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
    expect(FOCUS_RING).toBe(`inset 0 0 0 2px ${DARK_PRIMARY}`);
  });

  it('declares the ring AFTER hover, active and disabled', () => {
    const keys: string[] = Object.keys(baseOf());
    const hover: number = keys.findIndex((key: string) => key.includes(':hover'));
    const active: number = keys.findIndex((key: string) => key.includes(':active'));
    const disabled: number = keys.indexOf('&[aria-disabled="true"]');
    const ring: number = keys.findIndex((key: string) => key.includes(':focus-visible'));

    expect(hover).toBeGreaterThanOrEqual(0);
    expect(active).toBeGreaterThan(hover);
    expect(disabled).toBeGreaterThan(active);
    expect(ring).toBeGreaterThan(disabled);
  });

  it('re-expresses the ring as an outline under forced colors', () => {
    expect(baseOf()['@media (forced-colors: active)']).toEqual({
      [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
    });
  });

  it('ships no transition and no animation, so nothing can move between states', () => {
    const serialised: string = JSON.stringify([baseOf(), copyFieldValueSx, copyFieldGlyphSx]);

    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
  });

  it('merges the consumer sx last, in object, array and absent forms', () => {
    expect(layersOf(undefined)).toHaveLength(2);
    expect(layersOf(undefined)[1]).toEqual({});
    expect(layersOf({ marginTop: '1rem' })[1]).toEqual({ marginTop: '1rem' });

    const layers: SxLayers = layersOf([{ marginTop: '1rem' }, { paddingTop: '2rem' }]);
    expect(layers).toHaveLength(3);
    expect(layers[1]).toEqual({ marginTop: '1rem' });
    expect(layers[2]).toEqual({ paddingTop: '2rem' });
  });
});

describe('ui-copy-field styles — content recipes (pure, mutation-killing)', () => {
  it('pins the value type to Golos DemiBold 16/normal with tracking killed (rest ink)', () => {
    const value: StyleObject = copyFieldValueSx as StyleObject;

    expect(value.fontFamily).toBe('Golos Text');
    expect(value.fontWeight).toBe(600);
    expect(value.fontSize).toBe('1rem');
    expect(value.lineHeight).toBe('normal');
    expect(value.letterSpacing).toBe(0);
    expect(value.whiteSpace).toBe('nowrap');
    expect(value.color).toBe(GREY250);
  });

  it('pins the 20px glyph box, never shrinking, tinted from its own rest ink', () => {
    const box: StyleObject = copyFieldGlyphSx as StyleObject;

    expect(box.flexShrink).toBe(0);
    expect(box.display).toBe('flex');
    expect(box.width).toBe('1.25rem');
    expect(box.height).toBe('1.25rem');
    expect(box.color).toBe(GREY250);
  });

  it('pins the class hooks the root drives every descendant swap through', () => {
    expect(COPY_FIELD_VALUE_CLASS).toBe('ui-copy-field__value');
    expect(COPY_FIELD_GLYPH_CLASS).toBe('ui-copy-field__glyph');
  });
});

describe('CopyGlyph — the copy-02 icon (pure recipe)', () => {
  it('renders one decorative 20px svg whose stroke follows currentColor', () => {
    render(<CopyGlyph />);

    const svg: Element = nodesMatching('svg')[0];
    const path: Element = nodesMatching('svg path')[0];
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(nodesMatching('svg path')).toHaveLength(1);
    expect(path).toHaveAttribute('d', COPY_ICON_PATH);
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('stroke-width', '1.667');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
  });

  it('pins the Figma path, starting and ending at the exported coordinates', () => {
    expect(COPY_ICON_PATH.startsWith('M13.3333 6.66667V4.33333')).toBe(true);
    expect(COPY_ICON_PATH.endsWith('9.33333 18.3333Z')).toBe(true);
  });
});

describe('useCopyField — field view model', () => {
  function modelFor(props: Readonly<Partial<UiCopyFieldProps>>): CopyFieldModel {
    return renderHook((): CopyFieldModel => useCopyField(props as UiCopyFieldProps)).result.current;
  }

  it('pins the Ukrainian default suffix', () => {
    expect(DEFAULT_COPY_LABEL).toBe('Копіювати');
  });

  it('resolves the default copyLabel and no aria-disabled for a healthy field', () => {
    const model: CopyFieldModel = modelFor({ value: VALUE });

    expect(model.ariaDisabled).toBeUndefined();
    expect(model.copyLabel).toBe(DEFAULT_COPY_LABEL);
  });

  it('adopts a copyLabel override instead of the default suffix', () => {
    const model: CopyFieldModel = modelFor({ value: VALUE, copyLabel: 'Скопіювати' });

    expect(model.copyLabel).toBe('Скопіювати');
  });

  it('sets aria-disabled true when disabled, and treats false like absent', () => {
    expect(modelFor({ value: VALUE, disabled: true }).ariaDisabled).toBe(true);
    expect(modelFor({ value: VALUE, disabled: false }).ariaDisabled).toBeUndefined();
  });

  it('swallows activation while disabled, without calling the clipboard', () => {
    stubClipboard(jest.fn().mockResolvedValue(undefined));
    const onCopy: jest.Mock = jest.fn();
    const model: CopyFieldModel = modelFor({ value: VALUE, disabled: true, onCopy });

    model.onActivate();

    expect(onCopy).not.toHaveBeenCalled();
    stubClipboard(undefined);
  });

  it('does not throw activating with no callbacks and no clipboard at all', () => {
    stubClipboard(undefined);
    const model: CopyFieldModel = modelFor({ value: VALUE });

    expect(() => model.onActivate()).not.toThrow();
  });
});
