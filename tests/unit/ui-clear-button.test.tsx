import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
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

import mockConsoleWarn from './utils/mock-console-warn';

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
  label?: string;
  onActivate?: () => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
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

function clearButton(): HTMLElement {
  return screen.getByRole('button');
}

function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

function glyphBox(): Element {
  return nodesMatching(`.${GLYPH_CLASS}`)[0];
}

// Every hook that would make something else in the button focusable. Exactly
// one match is allowed in the wired tree and zero in the static one.
const FOCUSABLE_SELECTOR: string =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable]';

function focusables(): Element[] {
  return nodesMatching(FOCUSABLE_SELECTOR);
}

// Every ARIA/interactivity hook the static branch must not ship. `aria-hidden`
// is excluded on purpose: the decorative × carries it in BOTH branches.
const ARIA_SELECTOR: string =
  '[role], [tabindex], [aria-checked], [aria-disabled], [aria-pressed], [aria-label], ' +
  '[aria-labelledby], [aria-describedby], [aria-haspopup], [aria-expanded], [aria-controls]';

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

// `clearButtonSx` is typed as the broad `SxProps` union; in practice it always
// returns the `[base, ...consumerSx]` array. Narrow it once here so the layer
// assertions can index into the produced style objects.
type StyleObject = Record<string, unknown>;
type SxLayers = StyleObject[];

function layersOf(interactive: boolean, sx: UiClearButtonProps['sx']): SxLayers {
  return clearButtonSx({ interactive, sx }) as SxLayers;
}

function baseOf(interactive: boolean): StyleObject {
  return layersOf(interactive, undefined)[0];
}

function keysMatching(base: StyleObject, fragment: string): string[] {
  return Object.keys(base).filter((key: string) => key.includes(fragment));
}

// Records every node the forwarded callback ref is handed, attach and detach.
function collectorInto(
  seen: (HTMLButtonElement | null)[]
): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    seen.push(node);
  };
}

describe('UiClearButton — wired button semantics', () => {
  it('renders the whole row as ONE native type="button" with no implicit role hack', () => {
    render(buttonWith({ onActivate: noop }));

    const root: HTMLElement = clearButton();
    expect(root.tagName).toBe('BUTTON');
    expect(root).toHaveAttribute('type', 'button');
    expect(root).not.toHaveAttribute('role');
    expect(root).toHaveAccessibleName(DEFAULT_LABEL);
  });

  it('ships no ARIA state at all — a plain action button', () => {
    render(buttonWith({ onActivate: noop }));

    const root: HTMLElement = clearButton();
    expect(root).not.toHaveAttribute('aria-pressed');
    expect(root.getAttributeNames()).not.toContain('aria-checked');
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root).not.toHaveAttribute('aria-haspopup');
    expect(root).not.toHaveAttribute('aria-disabled');
  });

  it('keeps exactly one focusable element', () => {
    render(buttonWith({ onActivate: noop }));

    expect(focusables()).toHaveLength(1);
    expect(focusables()[0]).toBe(clearButton());
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('renders the × as an aria-hidden decoration that is never a control', () => {
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

    expect(clearButton()).not.toHaveAttribute('id');
    expect(clearButton()).not.toHaveAttribute('lang');

    rerender(buttonWith({ id: 'clear-filters', lang: 'ru', onActivate: noop }));
    expect(clearButton()).toHaveAttribute('id', 'clear-filters');
    expect(clearButton()).toHaveAttribute('lang', 'ru');
  });

  it('exposes its display name', () => {
    expect(UiClearButton.displayName).toBe('UiClearButton');
  });

  it('renders a custom label as the accessible name', () => {
    render(buttonWith({ label: 'Скинути все', onActivate: noop }));

    expect(clearButton()).toHaveAccessibleName('Скинути все');
  });
});

describe('UiClearButton — static (unwired) button', () => {
  it('exposes zero buttons, zero focusable elements and zero ARIA hooks', () => {
    render(buttonWith({}));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(focusables()).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });

  it('keeps the identical content tree, × included, with the consumer id and lang', () => {
    render(buttonWith({ id: 'static-clear', lang: 'ru' }));

    const root: Element = nodesMatching('#static-clear')[0];
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveAttribute('lang', 'ru');
    expect(root.contains(glyphBox())).toBe(true);
    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
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
    render(buttonWith({ id: 'static-clear' }));

    const root: HTMLElement = nodesMatching('#static-clear')[0] as HTMLElement;
    await user.click(root);
    await user.tab();

    expect(root).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });
});

describe('UiClearButton — activation requests', () => {
  it('requests activation exactly once per click, with no payload', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ onActivate }));

    await user.click(clearButton());

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith();
  });

  it('requests activation exactly once on Enter (no manual key handler double-fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ onActivate }));

    clearButton().focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('requests activation exactly once on Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ onActivate }));

    clearButton().focus();
    await user.keyboard(' ');

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('never submits an enclosing form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    const onActivate: jest.Mock = jest.fn();
    render(<form onSubmit={onSubmit}>{buttonWith({ onActivate })}</form>);

    clearButton().focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('UiClearButton — disabled (aria-disabled boundary)', () => {
  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    render(buttonWith({ disabled: true, onActivate: noop }));

    const root: HTMLElement = clearButton();
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root.getAttributeNames()).not.toContain('disabled');
    expect(root).toBeEnabled();
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(buttonWith({ disabled: true, onActivate: noop }));

    await user.tab();
    expect(clearButton()).toHaveFocus();
  });

  it('no-ops every activation path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ disabled: true, onActivate }));

    await user.click(clearButton());
    clearButton().focus();
    await user.keyboard('{Enter} ');

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('retains focus across a disabled flip, then activates again once re-enabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    const { rerender } = render(buttonWith({ onActivate }));

    const root: HTMLElement = clearButton();
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
    expect(root).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(2);
  });
});

describe('UiClearButton — focus and ref forwarding', () => {
  it('adds no explicit tabindex, so every wired button is one native tab stop', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <div>
        <UiClearButton label="Перший" onActivate={noop} />
        <UiClearButton label="Статичний" />
        <UiClearButton label="Другий" onActivate={noop} />
      </div>
    );

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Перший' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Другий' })).toHaveFocus();
  });

  it('forwards an object ref to the button itself, never a wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiClearButton ref={ref} onActivate={noop} />);

    expect(ref.current).toBe(clearButton());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node and releases it on unmount', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const collect: (node: HTMLButtonElement | null) => void = collectorInto(seen);
    const { unmount } = render(<UiClearButton ref={collect} onActivate={noop} />);

    expect(seen[0]).toBe(clearButton());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });

  it('hands back nothing on a static button — there is no focusable node to return', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiClearButton ref={ref} />);

    expect(ref.current).toBeNull();
  });
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
  it('stays silent for a healthy wired button and a healthy static one', () => {
    const { rerender } = render(buttonWith({ onActivate: noop }));
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(buttonWith({}));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns when the label is explicitly blank', () => {
    render(buttonWith({ label: '   ', onActivate: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('treats an omitted label as a default, never as an override', () => {
    render(buttonWith({ label: undefined, onActivate: noop }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns once per warning state, not once per render', () => {
    const { rerender } = render(buttonWith({ label: '', onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(buttonWith({ label: '  ', onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(buttonWith({ label: undefined, onActivate: noop }));
    rerender(buttonWith({ label: '', onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(2);
  });

  it('warns on the static branch too — a nameless button is nameless either way', () => {
    render(buttonWith({ label: '' }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
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
  it('applies an object sx to the wired root, merged last', () => {
    render(buttonWith({ sx: { marginTop: '1rem' }, onActivate: noop }));
    expect(clearButton()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the static root', () => {
    render(buttonWith({ id: 'styled', sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }] }));

    const root: Element = nodesMatching('#styled')[0];
    expect(root).toHaveStyle({ marginTop: '1rem' });
    expect(root).toHaveStyle({ paddingTop: '2rem' });
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
    expect(base[hoverKeys[0]]).toEqual({
      color: DARK_PRIMARY,
      [`& .${GLYPH_CLASS}`]: { color: DARK_PRIMARY },
    });
  });

  it('gates :active on the same boundary and paints darkSecondary', () => {
    const base: StyleObject = baseOf(true);
    const activeKeys: string[] = keysMatching(base, ':active');

    expect(activeKeys).toEqual(['&:active:not([aria-disabled="true"])']);
    expect(base[activeKeys[0]]).toEqual({
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

  it('declares the ring AFTER hover, active and disabled', () => {
    const keys: string[] = Object.keys(baseOf(true));
    const hover: number = keys.findIndex((key: string) => key.includes(':hover'));
    const active: number = keys.findIndex((key: string) => key.includes(':active'));
    const disabled: number = keys.indexOf('&[aria-disabled="true"]');
    const ring: number = keys.findIndex((key: string) => key.includes(':focus-visible'));

    expect(hover).toBeGreaterThanOrEqual(0);
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

    const svg: Element = nodesMatching('svg')[0];
    const path: Element = nodesMatching('svg path')[0];
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
