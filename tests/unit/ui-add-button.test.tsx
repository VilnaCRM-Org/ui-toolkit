import { render, renderHook, screen } from '@testing-library/react';
import React from 'react';

import addButtonWarning from '../../src/components/ui-add-button/add-button-warnings';
import UiAddButton from '../../src/components/ui-add-button/index';
import { PLUS_PATH, PlusGlyph } from '../../src/components/ui-add-button/plus-glyph';
import {
  ADD_BUTTON_GLYPH_CLASS,
  ADD_BUTTON_LABEL_CLASS,
  ADD_BUTTON_SHADOW,
  FOCUS_RING,
  addButtonGlyphSx,
  addButtonLabelSx,
  addButtonSx,
} from '../../src/components/ui-add-button/styles';
import type { UiAddButtonProps } from '../../src/components/ui-add-button/types';
import {
  DEFAULT_LABEL,
  useAddButton,
  type AddButtonModel,
} from '../../src/components/ui-add-button/use-add-button';

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
  describeSxLayerMerge,
  describeWarnSequence,
  ruleAt,
  type ActivationOverrides,
  type SxLayers,
} from './utils/activation-control-contract';
import { nodesMatching } from './utils/dom-queries';
import firstOf from './utils/first-of';
import mockConsoleWarn from './utils/mock-console-warn';
import { keysMatching, type StyleObject } from './utils/style-layers';

// UiAddButton emits one dev-only accessible-name warning via console.warn.
// Silence it for the suite and keep a handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

const LABEL: string = 'Додати рядок';
const WHITE: string = '#FFF';
const BRAND_GRAY: string = '#E1E7EA';
const GREY400: string = '#D0D4D8';
const GREY250: string = '#57595B';
const GREY300: string = '#969B9D';
const PRIMARY: string = '#1EAEFF';
const DARK_PRIMARY: string = '#1A1C1E';

// Props are applied one by one (the repo forbids JSX spreading). `in` checks
// keep the "runtime data violates the prop type" fixture (an absent label)
// expressible as an explicit `undefined`.
function buttonWith(extra: Readonly<Partial<UiAddButtonProps>>): React.ReactElement {
  const label: string | undefined = 'label' in extra ? extra.label : LABEL;
  return (
    <UiAddButton
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

function button(): HTMLElement {
  return screen.getByRole('button');
}

function glyphBox(): Element {
  return firstOf(nodesMatching(`.${ADD_BUTTON_GLYPH_CLASS}`));
}

function layersOf(interactive: boolean, sx: UiAddButtonProps['sx']): SxLayers {
  return addButtonSx({ interactive, sx }) as SxLayers;
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
  root: button,
  accessibleName: LABEL,
  component: UiAddButton,
  expectedDisplayName: 'UiAddButton',
  hasLang: true,
  warn,
  glyphBox,
  contentText: LABEL,
  baseOf,
};

describe('UiAddButton — root semantics', () => {
  describeButtonRoot(contract);
  describeNoAriaState(contract, ['aria-label']);
  describeGlyphDecoration(contract, { glyphBox, checkTabindex: true });
});

describe('UiAddButton — wired button semantics', () => {
  it('paints the label as a plain span carrying the class hook, label first', () => {
    render(buttonWith({ onActivate: noop }));

    const label: Element = firstOf(nodesMatching(`.${ADD_BUTTON_LABEL_CLASS}`));
    expect(label.tagName).toBe('SPAN');
    expect(screen.getByText(LABEL)).toBe(label);
    expect(nodesMatching(`.${ADD_BUTTON_LABEL_CLASS}`)).toHaveLength(1);
    const order: number = label.compareDocumentPosition(glyphBox());
    expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('uses the built-in Ukrainian default label when none is supplied', () => {
    render(<UiAddButton onActivate={noop} />);
    expect(button()).toHaveAccessibleName(DEFAULT_LABEL);
  });
});

describe('UiAddButton — static (unwired) button', () => {
  describeStaticBranch(contract);
});

describe('UiAddButton — activation', () => {
  describeActivationRequests(contract);
});

describe('UiAddButton — disabled (aria-disabled boundary)', () => {
  describeAriaDisabledFocusable(contract);
  describeNoOpsWhileDisabled(contract);
  describeRetainsFocusAcrossDisabledFlip(contract);
});

describe('UiAddButton — dev warnings', () => {
  describeWarnSequence(warn, 'stays silent for a healthy wired button and a healthy static one', [
    { render: (): React.ReactElement => wiredWith({}), expectedCallCount: 0 },
    { render: (): React.ReactElement => staticWith({}), expectedCallCount: 0 },
  ]);

  it('stays silent when label is omitted — the default fills in', () => {
    render(<UiAddButton onActivate={noop} />);
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns when label is explicitly blank', () => {
    render(buttonWith({ label: '  ', onActivate: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('explicitly blank'));
  });

  it('warns on the static branch too — a nameless button is nameless either way', () => {
    render(buttonWith({ label: '' }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('explicitly blank'));
  });

  describeWarnSequence(warn, 'warns once per warning state, not once per render', [
    {
      render: (): React.ReactElement => buttonWith({ label: '', onActivate: noop }),
      expectedCallCount: 1,
    },
    {
      render: (): React.ReactElement => buttonWith({ label: '   ', onActivate: noop }),
      expectedCallCount: 1,
    },
    {
      render: (): React.ReactElement => buttonWith({ label: LABEL, onActivate: noop }),
      expectedCallCount: 1,
    },
  ]);

  describeSilentInProduction(warn, [
    (): React.ReactElement => buttonWith({ label: '', onActivate: noop }),
  ]);
});

describe('addButtonWarning — first-applicable selector (pure)', () => {
  function warningFor(props: Readonly<Partial<UiAddButtonProps>>): string | null {
    return addButtonWarning(props as UiAddButtonProps);
  }

  it('returns null for a healthy or omitted label', () => {
    expect(warningFor({ label: LABEL })).toBeNull();
    expect(warningFor({})).toBeNull();
    expect(warningFor({ label: undefined })).toBeNull();
  });

  it('reports the blank-label warning for every blank and whitespace form', () => {
    expect(warningFor({ label: '' })).toContain('explicitly blank');
    expect(warningFor({ label: '   ' })).toContain('explicitly blank');
    expect(warningFor({ label: '\t' })).toContain('explicitly blank');
  });
});

describe('UiAddButton — consumer sx', () => {
  describeConsumerSx(contract, {
    render: (sx): React.ReactElement => staticWith({ id: 'styled', sx }),
    target: (): Element => firstOf(nodesMatching('#styled')),
  });
});

describe('addButtonSx — style assembly (pure, mutation-killing)', () => {
  it('pins the button box to the measured 178x34 master geometry', () => {
    const base: StyleObject = baseOf(true);

    expect(base.boxSizing).toBe('border-box');
    expect(base.display).toBe('inline-flex');
    expect(base.alignItems).toBe('center');
    // Pins the label left and the glyph right, so a consumer-supplied width
    // cannot float them inward off the master's 12px insets.
    expect(base.justifyContent).toBe('space-between');
    expect(base.gap).toBe('0.5rem');
    expect(base.height).toBeUndefined();
    expect(base.width).toBeUndefined();
    expect(base.margin).toBe(0);
    expect(base.padding).toBe('7px 11px');
    expect(base.borderRadius).toBe('0.25rem');
    expect(base.backgroundColor).toBe(WHITE);
    expect(base.textAlign).toBe('left');
    expect(base.font).toBe('inherit');
  });

  it('keeps the border a constant 1px in every state, swapping only its colour', () => {
    const base: StyleObject = baseOf(true);
    const hover: StyleObject = ruleAt(base, ':hover');
    const active: StyleObject = ruleAt(base, ':active');

    expect(base.border).toBe(`1px solid ${BRAND_GRAY}`);
    expect(hover.border).toBeUndefined();
    expect(hover.borderColor).toBe(GREY400);
    expect(active.border).toBeUndefined();
    expect(active.borderColor).toBe(BRAND_GRAY);
  });

  it('gates hover on the aria-disabled boundary and paints the Figma hover column', () => {
    const base: StyleObject = baseOf(true);
    const hoverKeys: string[] = keysMatching(base, ':hover');

    expect(hoverKeys).toEqual(['&:hover:not([aria-disabled="true"])']);
    expect(base['&:hover']).toBeUndefined();
    expect(base[hoverKeys[0] as string]).toEqual({
      borderColor: GREY400,
      boxShadow: ADD_BUTTON_SHADOW,
    });
  });

  it('gates :active on the same boundary — active border equals rest, LIGHTER than hover', () => {
    const base: StyleObject = baseOf(true);
    const activeKeys: string[] = keysMatching(base, ':active');

    expect(activeKeys).toEqual(['&:active:not([aria-disabled="true"])']);
    expect(base[activeKeys[0] as string]).toEqual({
      borderColor: BRAND_GRAY,
      boxShadow: ADD_BUTTON_SHADOW,
    });
  });

  it('pins the off-palette Figma drop shadow exactly, doubled from the 7.5px filter blur', () => {
    expect(ADD_BUTTON_SHADOW).toBe('0 8px 15px rgba(49, 59, 67, 0.14)');
  });

  it('paints the disabled column on both classes, with no opacity dimming', () => {
    const disabled: StyleObject = baseOf(true)['&[aria-disabled="true"]'] as StyleObject;

    expect(disabled).toEqual({
      cursor: 'default',
      backgroundColor: BRAND_GRAY,
      borderColor: 'transparent',
      [`& .${ADD_BUTTON_LABEL_CLASS}`]: { color: GREY300 },
      [`& .${ADD_BUTTON_GLYPH_CLASS}`]: { color: GREY300 },
    });
    expect(disabled.opacity).toBeUndefined();
  });

  it('ships the shared single-selector focus-visible ring, verbatim', () => {
    const base: StyleObject = baseOf(true);
    const ringKeys: string[] = keysMatching(base, ':focus-visible');

    expect(ringKeys).toEqual(['&:focus-visible']);
    expect(base['&:focus-visible']).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
    expect(FOCUS_RING).toBe(`inset 0 0 0 2px ${DARK_PRIMARY}`);
  });

  describeFocusRingOrder(
    () => baseOf(true),
    (keys: string[]): number => keys.indexOf('&:focus-visible')
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
    expect(base.border).toBe(`1px solid ${BRAND_GRAY}`);
    expect(base.backgroundColor).toBe(WHITE);
    expect(base.padding).toBe('7px 11px');
  });

  it('ships no transition and no animation, so nothing can move between states', () => {
    const serialised: string = JSON.stringify([
      baseOf(true),
      baseOf(false),
      addButtonLabelSx,
      addButtonGlyphSx,
    ]);

    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
  });

  describeSxLayerMerge(layersOf);
});

describe('add-button styles — content recipes (pure, mutation-killing)', () => {
  it('pins the label to Inter Medium 14/18 with tracking killed, one un-wrapped line', () => {
    const label: StyleObject = addButtonLabelSx as StyleObject;

    expect(label.fontFamily).toBe('Inter');
    expect(label.fontWeight).toBe(500);
    expect(label.fontSize).toBe('0.875rem');
    expect(label.lineHeight).toBe('1.125rem');
    expect(label.letterSpacing).toBe(0);
    expect(label.whiteSpace).toBe('nowrap');
    expect(label.color).toBe(GREY250);
  });

  it('pins the 18px glyph box, never shrinking, primary ink at rest', () => {
    const box: StyleObject = addButtonGlyphSx as StyleObject;

    expect(box.flexShrink).toBe(0);
    expect(box.display).toBe('flex');
    expect(box.width).toBe('1.125rem');
    expect(box.height).toBe('1.125rem');
    expect(box.color).toBe(PRIMARY);
  });

  it('pins the class hooks the root drives every descendant swap through', () => {
    expect(ADD_BUTTON_LABEL_CLASS).toBe('ui-add-button__label');
    expect(ADD_BUTTON_GLYPH_CLASS).toBe('ui-add-button__glyph');
  });
});

describe('PlusGlyph — the trailing plus (pure recipe)', () => {
  it('pins the Figma path, 18px box at stroke 1.5 — not the shared 20px default', () => {
    expect(PLUS_PATH).toBe('M9 3.75V14.25M3.75 9H14.25');
  });

  it('renders one decorative 18px svg whose stroke follows currentColor', () => {
    render(<PlusGlyph />);

    const svg: Element = firstOf(nodesMatching('svg'));
    const path: Element = firstOf(nodesMatching('svg path'));
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('width', '18');
    expect(svg).toHaveAttribute('height', '18');
    expect(svg).toHaveAttribute('viewBox', '0 0 18 18');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(nodesMatching('svg path')).toHaveLength(1);
    expect(path).toHaveAttribute('d', PLUS_PATH);
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('stroke-width', '1.5');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
  });
});

describe('useAddButton — button view model', () => {
  function modelFor(props: Readonly<Partial<UiAddButtonProps>>): AddButtonModel {
    return renderHook((): AddButtonModel => useAddButton(props as UiAddButtonProps)).result.current;
  }

  it('pins the Ukrainian default label', () => {
    expect(DEFAULT_LABEL).toBe('Додати стовпець');
  });

  it('marks an unwired button non-interactive with no aria-disabled', () => {
    const model: AddButtonModel = modelFor({ label: LABEL });

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
    expect(model.label).toBe(LABEL);
  });

  it('does not throw when an unwired button is activated (no onActivate to call)', () => {
    const model: AddButtonModel = modelFor({ label: LABEL });
    expect(() => model.onActivate()).not.toThrow();
  });

  it('leaves aria-disabled off a disabled but UNWIRED button', () => {
    const model: AddButtonModel = modelFor({ label: LABEL, disabled: true });

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('swallows activation while disabled, before any DOM concern', () => {
    const onActivate: jest.Mock = jest.fn();
    const model: AddButtonModel = modelFor({ label: LABEL, disabled: true, onActivate });

    model.onActivate();

    expect(onActivate).not.toHaveBeenCalled();
    expect(model.ariaDisabled).toBe(true);
    expect(model.interactive).toBe(true);
  });

  it('reports activation once, payload-free, for a wired enabled button', () => {
    const onActivate: jest.Mock = jest.fn();
    const model: AddButtonModel = modelFor({ label: LABEL, onActivate });

    model.onActivate();

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith();
    expect(model.interactive).toBe(true);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('treats an explicit `disabled: false` exactly like an absent one', () => {
    const onActivate: jest.Mock = jest.fn();
    const model: AddButtonModel = modelFor({ label: LABEL, disabled: false, onActivate });

    model.onActivate();

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('falls back to the default label when the prop is omitted', () => {
    const model: AddButtonModel = modelFor({});
    expect(model.label).toBe(DEFAULT_LABEL);
  });
});
