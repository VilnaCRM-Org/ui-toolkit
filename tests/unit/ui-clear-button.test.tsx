import { render, renderHook, screen } from '@testing-library/react';
import React from 'react';

import clearButtonWarning from '../../src/components/ui-clear-button/clear-button-warnings';
import { CLOSE_PATH, ClearGlyph } from '../../src/components/ui-clear-button/clear-glyph';
import UiClearButton, {
  DEFAULT_LABEL,
  useClearButtonModel,
  type ClearButtonModel,
} from '../../src/components/ui-clear-button/index';
import {
  clearButtonGlyphSx,
  clearButtonLabelSx,
  clearButtonSx,
  FOCUS_RING,
  GLYPH_CLASS,
} from '../../src/components/ui-clear-button/styles';
import type { UiClearButtonProps } from '../../src/components/ui-clear-button/types';

import {
  describeActivationRequests,
  describeAriaDisabledFocusable,
  describeButtonRoot,
  describeConsumerSx,
  describeFocusRingOrder,
  describeGlyphDecoration,
  describeNoAriaState,
  describeNoOpsWhileDisabled,
  describeRetainsFocusAcrossDisabledFlip,
  describeSilentInProduction,
  describeStaticBranch,
  describeStaticRefIsNull,
  describeSxLayerMerge,
  describeTabOrderAndRefs,
  describeWarnSequence,
  type ActivationOverrides,
  type SxLayers,
} from './utils/activation-control-contract';
import { expectNoLiveRegion, nodesMatching } from './utils/dom-queries';
import firstOf from './utils/first-of';
import mockConsoleWarn from './utils/mock-console-warn';
import { keysMatching, type StyleObject } from './utils/style-layers';

// UiClearButton emits its one dev-only accessible-name warning via console.warn.
// Silence it for the suite and keep a handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// Palette literals, pinned rather than imported: a mutation that swaps a token
// for its neighbour must fail here, which it cannot do if the expectation reads
// the same token as the implementation.
const GREY250: string = '#57595B';
const GREY300: string = '#969B9D';
const DARK_PRIMARY: string = '#1A1C1E';
const DARK_SECONDARY: string = '#1B2327';

interface ClearButtonOverrides {
  label?: string | undefined;
  onActivate?: (() => void) | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  sx?: UiClearButtonProps['sx'];
}

// Props are applied one by one (the repo forbids JSX spreading). The `in` check
// keeps "runtime data violates the prop type" fixtures — an absent label —
// expressible as an explicit `undefined`.
function buttonWith(extra: Readonly<ClearButtonOverrides>): React.ReactElement {
  const label: string = ('label' in extra ? extra.label : undefined) as string;
  return (
    <UiClearButton
      label={label}
      onActivate={extra.onActivate}
      disabled={extra.disabled}
      id={extra.id}
      lang={extra.lang}
      sx={extra.sx}
    />
  );
}

// The activation-control contract only ever varies `disabled`/`id`/`lang`/`sx`;
// `label` and `onActivate` stay this suite's own concern (see `buttonWith`).
function wiredWith(extra: Readonly<ActivationOverrides>): React.ReactElement {
  return buttonWith({
    onActivate: noop,
    disabled: extra.disabled,
    id: extra.id,
    lang: extra.lang,
    sx: extra.sx,
  });
}

function staticWith(extra: Readonly<ActivationOverrides>): React.ReactElement {
  return buttonWith({ disabled: extra.disabled, id: extra.id, lang: extra.lang, sx: extra.sx });
}

function withActivation(
  onActivate: (() => void) | undefined,
  extra: Readonly<ActivationOverrides>
): React.ReactElement {
  return buttonWith({ onActivate, disabled: extra.disabled, id: extra.id, sx: extra.sx });
}

function clearButton(): HTMLElement {
  return screen.getByRole('button');
}

function glyphBox(): Element {
  return firstOf(nodesMatching(`.${GLYPH_CLASS}`));
}

function layersOf(interactive: boolean, sx: UiClearButtonProps['sx']): SxLayers {
  return clearButtonSx({ interactive, sx }) as SxLayers;
}

function baseOf(interactive: boolean): StyleObject {
  return firstOf(layersOf(interactive, undefined));
}

// The behaviour every plain activation control in the toolkit shares — native
// button semantics, the aria-disabled boundary, tab-order/ref plumbing, the
// `sx` merge and the dev-warning shape — is asserted once in
// `activation-control-contract.tsx`. What follows below is what is TRUE OF
// THIS BUTTON ALONE: its content tree, its glyph geometry, its own palette.
const contract = {
  wiredWith,
  staticWith,
  withActivation,
  root: clearButton,
  accessibleName: DEFAULT_LABEL,
  component: UiClearButton,
  expectedDisplayName: 'UiClearButton',
  hasLang: true,
  warn,
  glyphBox,
  contentText: DEFAULT_LABEL,
  baseOf,
};

describe('UiClearButton — root semantics', () => {
  describeButtonRoot(contract);
  describeNoAriaState(contract, ['aria-checked']);
  describeGlyphDecoration(contract, { glyphBox, checkTabindex: true });

  it('renders a custom label as the accessible name', () => {
    render(buttonWith({ label: 'Скинути все', onActivate: noop }));
    expect(clearButton()).toHaveAccessibleName('Скинути все');
  });
});

describe('UiClearButton — static (unwired) button', () => {
  describeStaticBranch(contract);
});

describe('UiClearButton — activation requests', () => {
  describeActivationRequests(contract);
});

describe('UiClearButton — disabled (aria-disabled boundary)', () => {
  describeAriaDisabledFocusable(contract);
  describeNoOpsWhileDisabled(contract);
  describeRetainsFocusAcrossDisabledFlip(contract);
});

describe('UiClearButton — focus and ref forwarding', () => {
  describeTabOrderAndRefs({
    ...contract,
    tabOrderSiblings: (): React.ReactElement => (
      <div>
        <UiClearButton label="Перший" onActivate={noop} />
        <UiClearButton label="Статичний" />
        <UiClearButton label="Другий" onActivate={noop} />
      </div>
    ),
    firstName: 'Перший',
    secondName: 'Другий',
    withRef: (ref: React.Ref<HTMLButtonElement>): React.ReactElement => (
      <UiClearButton ref={ref} onActivate={noop} />
    ),
  });

  describeStaticRefIsNull(
    (ref: React.Ref<HTMLButtonElement>): React.ReactElement => <UiClearButton ref={ref} />
  );
});

describe('UiClearButton — live-region prohibition', () => {
  it('exposes none across rest, disabled and static', () => {
    const { rerender } = render(buttonWith({ onActivate: noop }));
    expectNoLiveRegion();

    rerender(buttonWith({ disabled: true, onActivate: noop }));
    expectNoLiveRegion();

    rerender(buttonWith({}));
    expectNoLiveRegion();
  });
});

describe('UiClearButton — dev warnings', () => {
  describeWarnSequence(warn, 'stays silent for a healthy wired button and a healthy static one', [
    { render: (): React.ReactElement => wiredWith({}), expectedCallCount: 0 },
    { render: (): React.ReactElement => staticWith({}), expectedCallCount: 0 },
  ]);

  it('warns when the label is explicitly blank', () => {
    render(buttonWith({ label: '   ', onActivate: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('treats an omitted label as a default, never as an override', () => {
    render(buttonWith({ label: undefined, onActivate: noop }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  describeWarnSequence(warn, 'warns once per warning state, not once per render', [
    {
      render: (): React.ReactElement => buttonWith({ label: '', onActivate: noop }),
      expectedCallCount: 1,
    },
    {
      render: (): React.ReactElement => buttonWith({ label: '  ', onActivate: noop }),
      expectedCallCount: 1,
    },
    {
      render: (): React.ReactElement => buttonWith({ label: undefined, onActivate: noop }),
      expectedCallCount: 1,
    },
    {
      render: (): React.ReactElement => buttonWith({ label: '', onActivate: noop }),
      expectedCallCount: 2,
    },
  ]);

  it('warns on the static branch too — a nameless button is nameless either way', () => {
    render(buttonWith({ label: '' }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  describeSilentInProduction(warn, [
    (): React.ReactElement => buttonWith({ label: '', onActivate: noop }),
  ]);
});

describe('clearButtonWarning — first-applicable selector (pure)', () => {
  function warningFor(props: Readonly<Partial<UiClearButtonProps>>): string | null {
    return clearButtonWarning(props as UiClearButtonProps);
  }

  it('returns null for a healthy or omitted label', () => {
    expect(warningFor({ label: 'Скинути' })).toBeNull();
    expect(warningFor({})).toBeNull();
    expect(warningFor({ label: undefined })).toBeNull();
  });

  it('reports the blank label for every blank and whitespace form', () => {
    expect(warningFor({ label: '' })).toContain('blank `label`');
    expect(warningFor({ label: '   ' })).toContain('blank `label`');
    expect(warningFor({ label: '\t' })).toContain('blank `label`');
  });
});

describe('UiClearButton — consumer sx', () => {
  describeConsumerSx(contract, {
    render: (sx): React.ReactElement => staticWith({ id: 'styled', sx }),
    target: (): Element => firstOf(nodesMatching('#styled')),
  });
});

describe('useClearButtonModel — view model (pure)', () => {
  function modelFor(props: Readonly<Partial<UiClearButtonProps>>): ClearButtonModel {
    return renderHook((): ClearButtonModel => useClearButtonModel(props as UiClearButtonProps))
      .result.current;
  }

  it('marks an unwired button non-interactive with no aria-disabled', () => {
    const model: ClearButtonModel = modelFor({});

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
    expect(model.label).toBe(DEFAULT_LABEL);
  });

  it('does not throw when an unwired button is activated (no onActivate to call)', () => {
    const model: ClearButtonModel = modelFor({});
    expect(() => model.onActivate()).not.toThrow();
  });

  it('leaves aria-disabled off a disabled but UNWIRED button', () => {
    const model: ClearButtonModel = modelFor({ disabled: true });

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('swallows activation while disabled, before any DOM concern', () => {
    const onActivate: jest.Mock = jest.fn();
    const model: ClearButtonModel = modelFor({ disabled: true, onActivate });

    model.onActivate();

    expect(onActivate).not.toHaveBeenCalled();
    expect(model.ariaDisabled).toBe(true);
    expect(model.interactive).toBe(true);
  });

  it('reports activation once, payload-free, for a wired enabled button', () => {
    const onActivate: jest.Mock = jest.fn();
    const model: ClearButtonModel = modelFor({ onActivate });

    model.onActivate();

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith();
    expect(model.interactive).toBe(true);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('treats an explicit `disabled: false` exactly like an absent one', () => {
    const onActivate: jest.Mock = jest.fn();
    const model: ClearButtonModel = modelFor({ disabled: false, onActivate });

    model.onActivate();

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('adopts a custom label instead of the default copy', () => {
    const model: ClearButtonModel = modelFor({ label: 'Скинути' });
    expect(model.label).toBe('Скинути');
  });
});

describe('clearButtonSx — style assembly (pure, mutation-killing)', () => {
  it('paints no fill, border, radius, shadow or padding, in either branch', () => {
    [true, false].forEach((interactive: boolean): void => {
      const base: StyleObject = baseOf(interactive);
      expect(base.padding).toBe(0);
      expect(base.border).toBe('none');
      expect(base.background).toBe('none');
      expect(base.borderRadius).toBeUndefined();
      expect(base.boxShadow).toBeUndefined();
    });
  });

  it('pins the flex row: 3px gap, center-aligned, hugging its content', () => {
    const base: StyleObject = baseOf(true);

    expect(base.boxSizing).toBe('border-box');
    expect(base.display).toBe('inline-flex');
    expect(base.alignItems).toBe('center');
    expect(base.gap).toBe('0.1875rem');
    expect(base.margin).toBe(0);
    expect(base.width).toBeUndefined();
    expect(base.height).toBeUndefined();
    expect(base.textAlign).toBe('left');
    expect(base.font).toBe('inherit');
  });

  it('sets the rest ink (grey250) on the root, for both branches', () => {
    expect(baseOf(true).color).toBe(GREY250);
    expect(baseOf(false).color).toBe(GREY250);
  });

  it('gates hover on the aria-disabled boundary and paints darkPrimary on label + glyph', () => {
    const base: StyleObject = baseOf(true);
    const hoverKeys: string[] = keysMatching(base, ':hover');

    expect(hoverKeys).toEqual(['&:hover:not([aria-disabled="true"])']);
    expect(base['&:hover']).toBeUndefined();
    expect(base[hoverKeys[0] as string]).toEqual({
      color: DARK_PRIMARY,
      [`& .${GLYPH_CLASS}`]: { color: DARK_PRIMARY },
    });
  });

  it('gates :active on the same boundary and paints darkSecondary', () => {
    const base: StyleObject = baseOf(true);
    const activeKeys: string[] = keysMatching(base, ':active');

    expect(activeKeys).toEqual(['&:active:not([aria-disabled="true"])']);
    expect(base[activeKeys[0] as string]).toEqual({
      color: DARK_SECONDARY,
      [`& .${GLYPH_CLASS}`]: { color: DARK_SECONDARY },
    });
  });

  it('paints the disabled column on both label and glyph, with no opacity dimming', () => {
    const disabled: StyleObject = baseOf(true)['&[aria-disabled="true"]'] as StyleObject;

    expect(disabled).toEqual({
      cursor: 'default',
      color: GREY300,
      [`& .${GLYPH_CLASS}`]: { color: GREY300 },
    });
    expect(disabled.opacity).toBeUndefined();
  });

  it('ships the shared inset focus ring, verbatim, at a single selector', () => {
    const base: StyleObject = baseOf(true);
    const ringKeys: string[] = keysMatching(base, ':focus-visible');

    expect(ringKeys).toEqual(['&:focus-visible']);
    expect(base['&:focus-visible']).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
    expect(FOCUS_RING).toBe(`inset 0 0 0 2px ${DARK_PRIMARY}`);
  });

  describeFocusRingOrder(
    () => baseOf(true),
    (keys: string[]): number => keys.findIndex((key: string) => key.includes(':focus-visible'))
  );

  it('adds cursor and appearance only to the wired branch', () => {
    expect(baseOf(true).cursor).toBe('pointer');
    expect(baseOf(true).appearance).toBe('none');
    expect(baseOf(false).cursor).toBeUndefined();
    expect(baseOf(false).appearance).toBeUndefined();
  });

  it('omits every button-only rule from the static branch, keeping the layout half', () => {
    const base: StyleObject = baseOf(false);

    expect(base['&[aria-disabled="true"]']).toBeUndefined();
    expect(keysMatching(base, ':hover')).toEqual([]);
    expect(keysMatching(base, ':active')).toEqual([]);
    expect(keysMatching(base, ':focus-visible')).toEqual([]);
    expect(base.border).toBe('none');
    expect(base.padding).toBe(0);
  });

  it('ships no transition and no animation, so nothing can move between states', () => {
    const serialised: string = JSON.stringify([
      baseOf(true),
      baseOf(false),
      clearButtonLabelSx,
      clearButtonGlyphSx,
    ]);

    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
  });

  describeSxLayerMerge(layersOf);
});

describe('clear-button styles — content recipes (pure, mutation-killing)', () => {
  it('pins the label to Inter Medium 14/18 with tracking killed and no wrap', () => {
    const label: StyleObject = clearButtonLabelSx as StyleObject;

    expect(label.fontFamily).toBe('Inter');
    expect(label.fontWeight).toBe(500);
    expect(label.fontSize).toBe('0.875rem');
    expect(label.lineHeight).toBe('1.125rem');
    expect(label.letterSpacing).toBe(0);
    expect(label.color).toBe('inherit');
    expect(label.whiteSpace).toBe('nowrap');
  });

  it('pins the 18px glyph box to the rest-only explicit grey300', () => {
    const box: StyleObject = clearButtonGlyphSx as StyleObject;

    expect(box.flexShrink).toBe(0);
    expect(box.display).toBe('flex');
    expect(box.width).toBe('1.125rem');
    expect(box.height).toBe('1.125rem');
    expect(box.color).toBe(GREY300);
  });

  it('pins the class hook the root drives the glyph swap through', () => {
    expect(GLYPH_CLASS).toBe('ui-clear-button__glyph');
  });
});

describe('ClearGlyph — the leading × (pure recipe)', () => {
  it('pins the Figma path, distinct from the other two × glyphs in the repo', () => {
    expect(CLOSE_PATH).toBe('M12.75 5.25L5.25 12.75M5.25 5.25L12.75 12.75');
    const FILTER_CHIP_PATH: string =
      'M14.16667 5.83333L5.83333 14.16667M5.83333 5.83333L14.16667 14.16667';
    expect(CLOSE_PATH).not.toBe(FILTER_CHIP_PATH);
    expect(CLOSE_PATH).not.toBe('M18 6L6 18M6 6L18 18');
  });

  it('renders one decorative 18px svg whose stroke follows currentColor', () => {
    render(<ClearGlyph />);

    const svg: Element = firstOf(nodesMatching('svg'));
    const path: Element = firstOf(nodesMatching('svg path'));
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('width', '18');
    expect(svg).toHaveAttribute('height', '18');
    expect(svg).toHaveAttribute('viewBox', '0 0 18 18');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(nodesMatching('svg path')).toHaveLength(1);
    expect(path).toHaveAttribute('d', CLOSE_PATH);
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('stroke-width', '1.5');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
  });
});
