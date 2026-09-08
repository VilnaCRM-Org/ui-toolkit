import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiCopyField from '../../src/components/ui-copy-field';
import copyFieldWarning from '../../src/components/ui-copy-field/copy-field-warnings';
import { CopyGlyph, COPY_ICON_PATH } from '../../src/components/ui-copy-field/copy-glyph';
import {
  COPY_FIELD_COPIED_ATTR,
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
  COPIED_RESET_MS,
  useCopiedLatch,
} from '../../src/components/ui-copy-field/use-copied-latch';
import {
  DEFAULT_COPY_LABEL,
  useCopyField,
  type CopyFieldModel,
} from '../../src/components/ui-copy-field/use-copy-field';

import {
  describeAriaDisabledFocusable,
  describeButtonRoot,
  describeConsumerSx,
  describeFocusRingOrder,
  describeGlyphDecoration,
  describeNoAriaState,
  describeSilentInProduction,
  describeTabOrderAndRefs,
  describeWarnSequence,
  ruleAt,
  type ActivationOverrides,
  type SxLayers,
} from './utils/activation-control-contract';
import { expectNoLiveRegion, nodesMatching } from './utils/dom-queries';
import firstOf from './utils/first-of';
import mockConsoleWarn from './utils/mock-console-warn';
import { keysMatching, type StyleObject } from './utils/style-layers';

// UiCopyField emits the two dev-only accessible-name warnings via console.warn.
// Silence them for the suite and keep a handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

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
  value?: string | undefined;
  copyLabel?: string | undefined;
  onCopy?: ((value: string) => void) | undefined;
  onCopyError?: ((error: unknown) => void) | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  lang?: string | undefined;
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

// The chip is always wired — there is no unwired branch — so the shared
// activation-control contract only ever varies `disabled`/`id`/`lang`/`sx`.
function wiredWith(extra: Readonly<ActivationOverrides>): React.ReactElement {
  return fieldWith({ disabled: extra.disabled, id: extra.id, lang: extra.lang, sx: extra.sx });
}

function field(): HTMLElement {
  return screen.getByRole('button');
}

function glyphBox(): Element {
  return firstOf(nodesMatching(`.${COPY_FIELD_GLYPH_CLASS}`));
}

function layersOf(sx: UiCopyFieldProps['sx']): SxLayers {
  return copyFieldSx(sx) as SxLayers;
}

function baseOf(): StyleObject {
  return firstOf(layersOf(undefined));
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

// The behaviour every plain activation control in the toolkit shares — native
// button semantics, the aria-disabled boundary, tab-order/ref plumbing, the
// `sx` merge and the dev-warning shape — is asserted once in
// `activation-control-contract.tsx`. What follows below is what is TRUE OF
// THIS CHIP ALONE: its clipboard-driven activation, its copy latch, its
// two-part accessible name.
const contract = {
  wiredWith,
  root: field,
  accessibleName: FIELD_NAME,
  component: UiCopyField,
  expectedDisplayName: 'UiCopyField',
  hasLang: true,
  warn,
};

describe('UiCopyField — button semantics', () => {
  afterEach(() => stubClipboard(undefined));

  describeButtonRoot(contract);
  describeNoAriaState(contract, ['aria-checked']);
  describeGlyphDecoration(contract, { glyphBox });

  it('paints the value as a plain span carrying the class hook', () => {
    render(fieldWith({}));

    const value: Element = firstOf(nodesMatching(`.${COPY_FIELD_VALUE_CLASS}`));
    expect(value.tagName).toBe('SPAN');
    expect(screen.getByText(VALUE)).toBe(value);
    expect(nodesMatching(`.${COPY_FIELD_VALUE_CLASS}`)).toHaveLength(1);
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

describe('UiCopyField — copy confirmation latch', () => {
  afterEach(() => stubClipboard(undefined));

  it('latches data-copied only after the clipboard write RESOLVES', async () => {
    const user: UserEvent = userEvent.setup();
    stubClipboard(jest.fn().mockResolvedValue(undefined));
    const onCopy: jest.Mock = jest.fn();
    render(fieldWith({ onCopy }));

    expect(field()).not.toHaveAttribute(COPY_FIELD_COPIED_ATTR);

    await user.click(field());
    await waitForCall(onCopy);

    expect(field()).toHaveAttribute(COPY_FIELD_COPIED_ATTR, 'true');
  });

  it('releases the latch once COPIED_RESET_MS has elapsed', async () => {
    jest.useFakeTimers();
    try {
      stubClipboard(jest.fn().mockResolvedValue(undefined));
      const onCopy: jest.Mock = jest.fn();
      render(fieldWith({ onCopy }));

      // `fireEvent`, not `userEvent`: user-event drives the fake clock forward
      // for its own inter-event delays, which would burn the whole reset window
      // before the assertion below ever runs. `waitFor` polls on timers too, so
      // the clipboard promise is flushed through `act` instead.
      fireEvent.click(field());
      await act(async () => {
        await Promise.resolve();
      });
      expect(onCopy).toHaveBeenCalled();
      expect(field()).toHaveAttribute(COPY_FIELD_COPIED_ATTR, 'true');

      act(() => {
        jest.advanceTimersByTime(COPIED_RESET_MS);
      });

      expect(field()).not.toHaveAttribute(COPY_FIELD_COPIED_ATTR);
    } finally {
      jest.useRealTimers();
    }
  });

  // A failed copy must never claim success -- the latch hangs off the resolve
  // path only, so a rejection leaves the chip in its rest paint.
  it('never latches when the clipboard write rejects', async () => {
    const user: UserEvent = userEvent.setup();
    stubClipboard(jest.fn().mockRejectedValue(new Error('denied')));
    const onCopyError: jest.Mock = jest.fn();
    render(fieldWith({ onCopyError }));

    await user.click(field());
    await waitForCall(onCopyError);

    expect(field()).not.toHaveAttribute(COPY_FIELD_COPIED_ATTR);
  });

  // The disabled boundary swallows activation before the clipboard is touched,
  // so a disabled chip can never end up wearing the confirmation paint.
  it('never latches while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const writeText: jest.Mock = jest.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(fieldWith({ disabled: true }));

    await user.click(field());

    expect(writeText).not.toHaveBeenCalled();
    expect(field()).not.toHaveAttribute(COPY_FIELD_COPIED_ATTR);
  });

  it('paints the latch with the chip own active recipe, gated on the disabled boundary', () => {
    const base: StyleObject = baseOf();
    const latched: StyleObject = ruleAt(base, COPY_FIELD_COPIED_ATTR);
    const active: StyleObject = ruleAt(base, ':active');

    expect(latched).toEqual(active);
    expect(latched.boxShadow).toBeUndefined();
    expect(keysMatching(base, COPY_FIELD_COPIED_ATTR)[0]).toContain(':not([aria-disabled="true"])');
  });
});

describe('UiCopyField — disabled (aria-disabled boundary)', () => {
  afterEach(() => stubClipboard(undefined));

  describeAriaDisabledFocusable(contract);

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
  describeTabOrderAndRefs({
    ...contract,
    tabOrderSiblings: (): React.ReactElement => (
      <div>
        <UiCopyField value="AAA" />
        <UiCopyField value="BBB" />
      </div>
    ),
    firstName: /AAA/,
    secondName: /BBB/,
    withRef: (ref: React.Ref<HTMLButtonElement>): React.ReactElement => (
      <UiCopyField ref={ref} value={VALUE} />
    ),
  });

  it('re-resolves the chip by id after a remount', () => {
    const { unmount } = render(fieldWith({ id: 'copy-3' }));
    expect(field()).toHaveAttribute('id', 'copy-3');

    unmount();
    expect(nodesMatching('#copy-3')).toHaveLength(0);

    render(fieldWith({ id: 'copy-3' }));
    const remounted: Element = firstOf(nodesMatching('#copy-3'));
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
  describeWarnSequence(warn, 'stays silent for a healthy field', [
    { render: (): React.ReactElement => fieldWith({}), expectedCallCount: 0 },
  ]);

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

  describeWarnSequence(warn, 'warns once per warning state, not once per render', [
    { render: (): React.ReactElement => fieldWith({ value: '' }), expectedCallCount: 1 },
    { render: (): React.ReactElement => fieldWith({ value: '   ' }), expectedCallCount: 1 },
    {
      render: (): React.ReactElement => fieldWith({ copyLabel: '' }),
      expectedCallCount: 2,
      expectedMessageFragment: 'blank `copyLabel`',
    },
  ]);

  describeSilentInProduction(warn, [
    (): React.ReactElement => fieldWith({ value: '' }),
    (): React.ReactElement => fieldWith({ copyLabel: '' }),
  ]);
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
  describeConsumerSx(contract, {
    render: (sx): React.ReactElement => wiredWith({ sx }),
    target: (): Element => field(),
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
    expect(base.padding).toBe('0.4375rem 0.8125rem');
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
    expect(base[hoverKeys[0] as string]).toEqual({
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
    expect(base[activeKeys[0] as string]).toEqual({
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
    expect(base[ringKeys[0] as string]).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
    expect(FOCUS_RING).toBe(`inset 0 0 0 2px ${DARK_PRIMARY}`);
  });

  describeFocusRingOrder(baseOf, (keys: string[]): number =>
    keys.findIndex((key: string) => key.includes(':focus-visible'))
  );

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

    const svg: Element = firstOf(nodesMatching('svg'));
    const path: Element = firstOf(nodesMatching('svg path'));
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

describe('useCopiedLatch — a latch that lands after unmount is dropped', () => {
  it('ignores a latch call once the hook has unmounted', () => {
    jest.useFakeTimers();
    try {
      const { result, unmount } = renderHook(() => useCopiedLatch());

      unmount();
      // The clipboard write is async, so its `.then` can run after the chip is
      // gone. Without the mounted guard this would set state on a dead hook and
      // arm a timer the cleanup has already run past.
      expect(() => act(() => result.current.latch())).not.toThrow();

      act(() => jest.runOnlyPendingTimers());
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it('still latches and clears while mounted', () => {
    jest.useFakeTimers();
    try {
      const { result } = renderHook(() => useCopiedLatch());

      act(() => result.current.latch());
      expect(result.current.copied).toBe(true);

      act(() => jest.advanceTimersByTime(COPIED_RESET_MS));
      expect(result.current.copied).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('UiCopyField — a consumer error is not a clipboard error', () => {
  afterEach(() => stubClipboard(undefined));

  it('does not call onCopyError when onCopy itself throws', async () => {
    const onCopyError: jest.Mock = jest.fn();
    const onCopy: jest.Mock = jest.fn(() => {
      throw new Error('consumer blew up');
    });
    // The write has to succeed: the point of the case is that a consumer
    // exception AFTER a successful copy is not a clipboard failure.
    stubClipboard((): Promise<void> => Promise.resolve());
    render(<UiCopyField value="5POLGOPWQZFCCFEI" onCopy={onCopy} onCopyError={onCopyError} />);

    jest.useFakeTimers();
    try {
      fireEvent.click(screen.getByRole('button'));
      await act(async () => {
        await Promise.resolve();
      });

      // The rejection handler is bound to the clipboard promise alone, so a
      // consumer exception cannot be reported back as a failed copy.
      expect(onCopy).toHaveBeenCalledTimes(1);
      expect(onCopyError).not.toHaveBeenCalled();

      // It is not swallowed either: it is rethrown clear of the promise chain,
      // so the page's own error reporting still sees it.
      expect(() => jest.runAllTimers()).toThrow('consumer blew up');
    } finally {
      jest.useRealTimers();
    }
  });
});
