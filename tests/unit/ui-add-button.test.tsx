import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
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

import mockConsoleWarn from './utils/mock-console-warn';

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

function button(): HTMLElement {
  return screen.getByRole('button');
}

function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

function glyphBox(): Element {
  return nodesMatching(`.${ADD_BUTTON_GLYPH_CLASS}`)[0];
}

const FOCUSABLE_SELECTOR: string =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable]';

function focusables(): Element[] {
  return nodesMatching(FOCUSABLE_SELECTOR);
}

const ARIA_SELECTOR: string =
  '[role], [tabindex], [aria-checked], [aria-disabled], [aria-pressed], [aria-label], ' +
  '[aria-labelledby], [aria-describedby], [aria-haspopup], [aria-expanded], [aria-controls]';

// `addButtonSx` is typed as the broad `SxProps` union; in practice it always
// returns the `[base, ...consumerSx]` array. Narrow it once here so the layer
// assertions can index into the produced style objects.
type StyleObject = Record<string, unknown>;
type SxLayers = StyleObject[];

function layersOf(interactive: boolean, sx: UiAddButtonProps['sx']): SxLayers {
  return addButtonSx({ interactive, sx }) as SxLayers;
}

function baseOf(interactive: boolean): StyleObject {
  return layersOf(interactive, undefined)[0];
}

function keysMatching(base: StyleObject, fragment: string): string[] {
  return Object.keys(base).filter((key: string) => key.includes(fragment));
}

function ruleAt(base: StyleObject, fragment: string): StyleObject {
  return base[keysMatching(base, fragment)[0]] as StyleObject;
}

describe('UiAddButton — wired button semantics', () => {
  it('renders the whole pill as ONE native type="button" with no implicit role hack', () => {
    render(buttonWith({ onActivate: noop }));

    const root: HTMLElement = button();
    expect(root.tagName).toBe('BUTTON');
    expect(root).toHaveAttribute('type', 'button');
    expect(root).not.toHaveAttribute('role');
    expect(root).toHaveAccessibleName(LABEL);
  });

  it('ships no ARIA state at all — a plain action button', () => {
    render(buttonWith({ onActivate: noop }));

    const root: HTMLElement = button();
    expect(root).not.toHaveAttribute('aria-pressed');
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root).not.toHaveAttribute('aria-haspopup');
    expect(root).not.toHaveAttribute('aria-disabled');
    expect(root).not.toHaveAttribute('aria-label');
  });

  it('keeps exactly one focusable element', () => {
    render(buttonWith({ onActivate: noop }));

    expect(focusables()).toHaveLength(1);
    expect(focusables()[0]).toBe(button());
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('paints the label as a plain span carrying the class hook, label first', () => {
    render(buttonWith({ onActivate: noop }));

    const label: Element = nodesMatching(`.${ADD_BUTTON_LABEL_CLASS}`)[0];
    expect(label.tagName).toBe('SPAN');
    expect(screen.getByText(LABEL)).toBe(label);
    expect(nodesMatching(`.${ADD_BUTTON_LABEL_CLASS}`)).toHaveLength(1);
    const order: number = label.compareDocumentPosition(glyphBox());
    expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the plus as an aria-hidden decoration that is never a control', () => {
    render(buttonWith({ onActivate: noop }));

    const box: Element = glyphBox();
    const svg: Element = nodesMatching('svg')[0];
    expect(box.tagName).toBe('SPAN');
    expect(box).not.toHaveAttribute('role');
    expect(box).not.toHaveAttribute('tabindex');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(nodesMatching('title')).toHaveLength(0);
    expect(nodesMatching('svg')).toHaveLength(1);
  });

  it('applies id and lang only when the consumer supplies them', () => {
    const { rerender } = render(buttonWith({ onActivate: noop }));

    expect(button()).not.toHaveAttribute('id');
    expect(button()).not.toHaveAttribute('lang');

    rerender(buttonWith({ id: 'add-column', lang: 'ru', onActivate: noop }));
    expect(button()).toHaveAttribute('id', 'add-column');
    expect(button()).toHaveAttribute('lang', 'ru');
  });

  it('uses the built-in Ukrainian default label when none is supplied', () => {
    render(<UiAddButton onActivate={noop} />);
    expect(button()).toHaveAccessibleName(DEFAULT_LABEL);
  });

  it('exposes its display name', () => {
    expect(UiAddButton.displayName).toBe('UiAddButton');
  });
});

describe('UiAddButton — static (unwired) button', () => {
  it('exposes zero buttons, zero focusable elements and zero ARIA hooks', () => {
    render(buttonWith({}));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(focusables()).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });

  it('keeps the identical content tree, plus glyph included, with id and lang', () => {
    render(buttonWith({ id: 'static-add', lang: 'ru' }));

    const root: Element = nodesMatching('#static-add')[0];
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveAttribute('lang', 'ru');
    expect(root.contains(glyphBox())).toBe(true);
    expect(screen.getByText(LABEL)).toBeInTheDocument();
    expect(nodesMatching('svg')).toHaveLength(1);
  });

  it('never paints the disabled state, so no grey outlives aria-disabled', () => {
    render(buttonWith({ disabled: true }));

    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
    expect(baseOf(false)['&[aria-disabled="true"]']).toBeUndefined();
  });

  it('never fires anything, because there is nothing to activate', async () => {
    const user: UserEvent = userEvent.setup();
    render(buttonWith({ id: 'static-add' }));

    const root: HTMLElement = nodesMatching('#static-add')[0] as HTMLElement;
    await user.click(root);
    await user.tab();

    expect(root).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });
});

describe('UiAddButton — activation', () => {
  it('requests activation exactly once per click, with no payload', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ onActivate }));

    await user.click(button());

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith();
  });

  it('requests activation exactly once on Enter (no manual key handler double-fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ onActivate }));

    button().focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('requests activation exactly once on Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ onActivate }));

    button().focus();
    await user.keyboard(' ');

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('never submits an enclosing form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    const onActivate: jest.Mock = jest.fn();
    render(<form onSubmit={onSubmit}>{buttonWith({ onActivate })}</form>);

    button().focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('UiAddButton — disabled (aria-disabled boundary)', () => {
  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    render(buttonWith({ disabled: true, onActivate: noop }));

    const root: HTMLElement = button();
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root.getAttributeNames()).not.toContain('disabled');
    expect(root).toBeEnabled();
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(buttonWith({ disabled: true, onActivate: noop }));

    await user.tab();
    expect(button()).toHaveFocus();
  });

  it('no-ops every activation path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ disabled: true, onActivate }));

    await user.click(button());
    button().focus();
    await user.keyboard('{Enter} ');

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('retains focus when a focused button flips disabled, then re-enables', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    const { rerender } = render(buttonWith({ onActivate }));

    const root: HTMLElement = button();
    root.focus();
    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);

    rerender(buttonWith({ disabled: true, onActivate }));
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);

    rerender(buttonWith({ onActivate }));
    expect(root).not.toHaveAttribute('aria-disabled');
    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(2);
  });
});

describe('UiAddButton — dev warnings', () => {
  it('stays silent for a healthy wired button and a healthy static one', () => {
    const { rerender } = render(buttonWith({ onActivate: noop }));
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(buttonWith({}));
    expect(warn.spy).not.toHaveBeenCalled();
  });

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

  it('warns once per warning state, not once per render', () => {
    const { rerender } = render(buttonWith({ label: '', onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(buttonWith({ label: '   ', onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(buttonWith({ label: LABEL, onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);
  });

  it('emits nothing in production', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(buttonWith({ label: '', onActivate: noop }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
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
  it('applies an object sx to the wired root, merged last', () => {
    render(buttonWith({ sx: { marginTop: '1rem' }, onActivate: noop }));
    expect(button()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the static root', () => {
    render(buttonWith({ id: 'styled', sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }] }));

    const root: Element = nodesMatching('#styled')[0];
    expect(root).toHaveStyle({ marginTop: '1rem' });
    expect(root).toHaveStyle({ paddingTop: '2rem' });
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
    expect(base[hoverKeys[0]]).toEqual({ borderColor: GREY400, boxShadow: ADD_BUTTON_SHADOW });
  });

  it('gates :active on the same boundary — active border equals rest, LIGHTER than hover', () => {
    const base: StyleObject = baseOf(true);
    const activeKeys: string[] = keysMatching(base, ':active');

    expect(activeKeys).toEqual(['&:active:not([aria-disabled="true"])']);
    expect(base[activeKeys[0]]).toEqual({ borderColor: BRAND_GRAY, boxShadow: ADD_BUTTON_SHADOW });
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

  it('declares the ring AFTER hover, active and disabled', () => {
    const keys: string[] = Object.keys(baseOf(true));
    const hover: number = keys.findIndex((key: string) => key.includes(':hover'));
    const active: number = keys.findIndex((key: string) => key.includes(':active'));
    const disabled: number = keys.indexOf('&[aria-disabled="true"]');
    const ring: number = keys.indexOf('&:focus-visible');

    expect(active).toBeGreaterThan(hover);
    expect(disabled).toBeGreaterThan(active);
    expect(ring).toBeGreaterThan(disabled);
  });

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

  it('merges the consumer sx last, in object, array and absent forms', () => {
    expect(layersOf(true, undefined)).toHaveLength(2);
    expect(layersOf(true, undefined)[1]).toEqual({});
    expect(layersOf(true, { marginTop: '1rem' })[1]).toEqual({ marginTop: '1rem' });

    const layers: SxLayers = layersOf(false, [{ marginTop: '1rem' }, { paddingTop: '2rem' }]);
    expect(layers).toHaveLength(3);
    expect(layers[1]).toEqual({ marginTop: '1rem' });
    expect(layers[2]).toEqual({ paddingTop: '2rem' });
  });
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

    const svg: Element = nodesMatching('svg')[0];
    const path: Element = nodesMatching('svg path')[0];
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
