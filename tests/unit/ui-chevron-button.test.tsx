import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiChevronButton from '../../src/components/ui-chevron-button';
import chevronButtonWarning from '../../src/components/ui-chevron-button/chevron-button-warnings';
import { ChevronGlyph } from '../../src/components/ui-chevron-button/chevron-glyph';
import {
  CHEVRON_HOVER_SHADOW_TINT,
  FOCUS_RING,
  chevronButtonSx,
} from '../../src/components/ui-chevron-button/styles';
import type { UiChevronButtonProps } from '../../src/components/ui-chevron-button/types';

import mockConsoleWarn from './utils/mock-console-warn';

// UiChevronButton emits one dev-only accessible-name warning via console.warn.
// Silence it for the suite and keep a handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;
const LABEL: string = 'Наступна сторінка';

// Palette literals, pinned rather than imported: a mutation that swaps a token
// for its neighbour must fail here, which it cannot do if the expectation reads
// the same token as the implementation.
const WHITE: string = '#FFF';
const BRAND_GRAY: string = '#E1E7EA';
const GREY300: string = '#969B9D';
const DARK_PRIMARY: string = '#1A1C1E';

interface ButtonOverrides {
  label?: string;
  direction?: UiChevronButtonProps['direction'];
  onActivate?: () => void;
  disabled?: boolean;
  id?: string;
  sx?: UiChevronButtonProps['sx'];
}

// Props are applied one by one (the repo forbids JSX spreading). The `in` check
// keeps the "runtime data violates the prop type" fixture — an absent label —
// expressible as an explicit `undefined`.
function buttonWith(extra: Readonly<ButtonOverrides>): React.ReactElement {
  const label: string = ('label' in extra ? extra.label : LABEL) as string;
  return (
    <UiChevronButton
      label={label}
      direction={extra.direction}
      onActivate={extra.onActivate}
      disabled={extra.disabled}
      id={extra.id}
      sx={extra.sx}
    />
  );
}

function chevronButton(): HTMLElement {
  return screen.getByRole('button');
}

function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

// Every hook that would make something else in the button focusable.
const FOCUSABLE_SELECTOR: string =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable]';

function focusables(): Element[] {
  return nodesMatching(FOCUSABLE_SELECTOR);
}

// Every ARIA/interactivity hook the static branch must not ship.
const ARIA_SELECTOR: string =
  '[role], [tabindex], [aria-checked], [aria-disabled], [aria-pressed], [aria-label], ' +
  '[aria-labelledby], [aria-describedby], [aria-haspopup], [aria-expanded], [aria-controls]';

// `chevronButtonSx` is typed as the broad `SxProps` union; in practice it always
// returns the `[base, ...consumerSx]` array. Narrow it once so the layer
// assertions can index into the produced style objects.
type StyleObject = Record<string, unknown>;
type SxLayers = StyleObject[];

function layersOf(interactive: boolean, sx: UiChevronButtonProps['sx']): SxLayers {
  return chevronButtonSx({ interactive, sx }) as SxLayers;
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

// Records every node the forwarded callback ref is handed, attach and detach.
function collectorInto(
  seen: (HTMLButtonElement | null)[]
): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    seen.push(node);
  };
}

describe('UiChevronButton — wired button semantics', () => {
  it('renders the circle as ONE native type="button" named by aria-label', () => {
    render(buttonWith({ onActivate: noop }));

    const root: HTMLElement = chevronButton();
    expect(root.tagName).toBe('BUTTON');
    expect(root).toHaveAttribute('type', 'button');
    expect(root).not.toHaveAttribute('role');
    expect(root).toHaveAccessibleName(LABEL);
  });

  it('ships no ARIA state beyond aria-label/aria-disabled — a plain action button', () => {
    render(buttonWith({ onActivate: noop }));

    const root: HTMLElement = chevronButton();
    expect(root).not.toHaveAttribute('aria-pressed');
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root).not.toHaveAttribute('aria-haspopup');
    expect(root).not.toHaveAttribute('aria-disabled');
  });

  it('keeps exactly one focusable element', () => {
    render(buttonWith({ onActivate: noop }));

    expect(focusables()).toHaveLength(1);
    expect(focusables()[0]).toBe(chevronButton());
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('renders the glyph as an aria-hidden decoration that is never a control', () => {
    render(buttonWith({ onActivate: noop }));

    const svg: Element = nodesMatching('svg')[0];
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(nodesMatching('title')).toHaveLength(0);
    expect(nodesMatching('svg')).toHaveLength(1);
  });

  it('applies id only when the consumer supplies it', () => {
    const { rerender } = render(buttonWith({ onActivate: noop }));

    expect(chevronButton()).not.toHaveAttribute('id');

    rerender(buttonWith({ id: 'next-page', onActivate: noop }));
    expect(chevronButton()).toHaveAttribute('id', 'next-page');
  });

  it('exposes its display name', () => {
    expect(UiChevronButton.displayName).toBe('UiChevronButton');
  });
});

describe('UiChevronButton — static (unwired) button', () => {
  it('exposes zero buttons, zero focusable elements and zero ARIA hooks', () => {
    render(buttonWith({}));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(focusables()).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });

  it('keeps the identical glyph content, with the consumer id', () => {
    render(buttonWith({ id: 'static-chevron' }));

    const root: Element = nodesMatching('#static-chevron')[0];
    expect(root.tagName).toBe('SPAN');
    expect(nodesMatching('svg')).toHaveLength(1);
  });

  it('honours an explicit direction on the static branch too', () => {
    render(buttonWith({ direction: 'left' }));

    const path: string = nodesMatching('svg path')[0].getAttribute('d') ?? '';
    expect(path).toBe('M12.5 5L7.5 10L12.5 15');
  });

  it('never paints the disabled state, so no grey outlives aria-disabled', () => {
    render(buttonWith({ disabled: true }));

    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
    expect(baseOf(false)['&[aria-disabled="true"]']).toBeUndefined();
  });

  it('never fires anything, because there is nothing to activate', async () => {
    const user: UserEvent = userEvent.setup();
    render(buttonWith({ id: 'static-chevron' }));

    const root: HTMLElement = nodesMatching('#static-chevron')[0] as HTMLElement;
    await user.click(root);
    await user.tab();

    expect(root).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });
});

describe('UiChevronButton — activation', () => {
  it('activates exactly once per click, with no payload', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ onActivate }));

    await user.click(chevronButton());

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith();
  });

  it('activates exactly once on Enter (no manual key handler double-fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ onActivate }));

    chevronButton().focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('activates exactly once on Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ onActivate }));

    chevronButton().focus();
    await user.keyboard(' ');

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('never submits an enclosing form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    const onActivate: jest.Mock = jest.fn();
    render(<form onSubmit={onSubmit}>{buttonWith({ onActivate })}</form>);

    chevronButton().focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('UiChevronButton — disabled (aria-disabled boundary)', () => {
  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    render(buttonWith({ disabled: true, onActivate: noop }));

    const root: HTMLElement = chevronButton();
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root.getAttributeNames()).not.toContain('disabled');
    expect(root).toBeEnabled();
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(buttonWith({ disabled: true, onActivate: noop }));

    await user.tab();
    expect(chevronButton()).toHaveFocus();
  });

  it('no-ops every activation path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ disabled: true, onActivate }));

    await user.click(chevronButton());
    chevronButton().focus();
    await user.keyboard('{Enter} ');

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('retains focus across a disabled flip, and re-activates once re-enabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    const { rerender } = render(buttonWith({ onActivate }));

    const root: HTMLElement = chevronButton();
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

  it('leaves aria-disabled off a disabled but UNWIRED button', () => {
    render(buttonWith({ disabled: true }));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
  });
});

describe('UiChevronButton — focus and refs', () => {
  it('adds no explicit tabindex, so every wired button is one native tab stop', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <div>
        <UiChevronButton label="Перша" onActivate={noop} />
        <UiChevronButton label="Статична" />
        <UiChevronButton label="Друга" onActivate={noop} />
      </div>
    );

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Перша' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Друга' })).toHaveFocus();
  });

  it('keeps focus on the button after activation — it never moves focus itself', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(buttonWith({ onActivate }));

    const root: HTMLElement = chevronButton();
    root.focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(root).toHaveFocus();
  });

  it('forwards an object ref to the button itself, never a wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiChevronButton ref={ref} label={LABEL} onActivate={noop} />);

    expect(ref.current).toBe(chevronButton());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node and releases it on unmount', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const collect: (node: HTMLButtonElement | null) => void = collectorInto(seen);
    const { unmount } = render(<UiChevronButton ref={collect} label={LABEL} onActivate={noop} />);

    expect(seen[0]).toBe(chevronButton());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });

  it('hands back nothing on a static button — there is no focusable node to return', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiChevronButton ref={ref} label={LABEL} />);

    expect(ref.current).toBeNull();
  });
});

describe('UiChevronButton — direction (visual only)', () => {
  it('defaults to right, matching the on-canvas Figma render', () => {
    render(buttonWith({ onActivate: noop }));

    const path: string = nodesMatching('svg path')[0].getAttribute('d') ?? '';
    expect(path).toBe('M7.5 5L12.5 10L7.5 15');
  });

  it('flips to left on request', () => {
    render(buttonWith({ direction: 'left', onActivate: noop }));

    const path: string = nodesMatching('svg path')[0].getAttribute('d') ?? '';
    expect(path).toBe('M12.5 5L7.5 10L12.5 15');
  });

  it('carries no aria-label, aria-labelledby or title beyond the button root', () => {
    render(buttonWith({ onActivate: noop }));

    expect(nodesMatching('[aria-labelledby], [title]')).toHaveLength(0);
    expect(nodesMatching('[aria-label]')).toHaveLength(1);
  });
});

describe('UiChevronButton — dev warnings', () => {
  it('stays silent for a healthy wired button and a healthy static one', () => {
    const { rerender } = render(buttonWith({ onActivate: noop }));
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(buttonWith({}));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns when the label is blank', () => {
    render(buttonWith({ label: '  ', onActivate: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns when the label is missing entirely', () => {
    render(buttonWith({ label: undefined, onActivate: noop }));

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns on the static branch too — a nameless button is nameless either way', () => {
    render(buttonWith({ label: '' }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns once per warning state, not once per render', () => {
    const { rerender } = render(buttonWith({ label: '', onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(buttonWith({ label: '   ', onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(buttonWith({ onActivate: noop }));
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

describe('chevronButtonWarning — pure warning selector', () => {
  it('returns null for a healthy label', () => {
    expect(chevronButtonWarning({ label: LABEL })).toBeNull();
  });

  it('reports the blank-label warning for every blank, missing and whitespace form', () => {
    expect(chevronButtonWarning({ label: '' })).toContain('blank `label`');
    expect(chevronButtonWarning({ label: '   ' })).toContain('blank `label`');
    expect(chevronButtonWarning({} as UiChevronButtonProps)).toContain('blank `label`');
  });
});

describe('UiChevronButton — consumer sx', () => {
  it('applies an object sx to the wired root, merged last', () => {
    render(buttonWith({ sx: { marginTop: '1rem' }, onActivate: noop }));
    expect(chevronButton()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the static root', () => {
    render(buttonWith({ id: 'styled', sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }] }));

    const root: Element = nodesMatching('#styled')[0];
    expect(root).toHaveStyle({ marginTop: '1rem' });
    expect(root).toHaveStyle({ paddingTop: '2rem' });
  });
});

describe('chevronButtonSx — style assembly (pure, mutation-killing)', () => {
  it('pins the 30x30 circle to the measured Figma geometry', () => {
    const base: StyleObject = baseOf(true);

    expect(base.boxSizing).toBe('border-box');
    expect(base.display).toBe('flex');
    expect(base.alignItems).toBe('center');
    expect(base.justifyContent).toBe('center');
    expect(base.width).toBe('1.875rem');
    expect(base.height).toBe('1.875rem');
    expect(base.padding).toBe(0);
    expect(base.margin).toBe(0);
    expect(base.borderRadius).toBe('50%');
    expect(base.border).toBe(`1px solid ${BRAND_GRAY}`);
    expect(base.backgroundColor).toBe(WHITE);
    expect(base.color).toBe(GREY300);
  });

  it('gates hover on the aria-disabled boundary and paints the Figma hover column', () => {
    const base: StyleObject = baseOf(true);
    const hoverKeys: string[] = keysMatching(base, ':hover');

    expect(hoverKeys).toEqual(['&:hover:not([aria-disabled="true"])']);
    expect(base['&:hover']).toBeUndefined();
    expect(base[hoverKeys[0]]).toEqual({
      borderColor: GREY300,
      boxShadow: `0 4px 13px 0 ${CHEVRON_HOVER_SHADOW_TINT}`,
    });
  });

  it('gates :active on the same boundary — the hover border minus the shadow', () => {
    const base: StyleObject = baseOf(true);
    const activeKeys: string[] = keysMatching(base, ':active');

    expect(activeKeys).toEqual(['&:active:not([aria-disabled="true"])']);
    expect(base[activeKeys[0]]).toEqual({ borderColor: GREY300 });
  });

  it('pins the off-palette Figma hover shadow tint exactly', () => {
    expect(CHEVRON_HOVER_SHADOW_TINT).toBe('rgba(0, 0, 0, 0.25)');
  });

  it('paints the disabled column — brandGray fill, transparent border, default cursor', () => {
    const disabled: StyleObject = baseOf(true)['&[aria-disabled="true"]'] as StyleObject;

    expect(disabled).toEqual({
      backgroundColor: BRAND_GRAY,
      borderColor: 'transparent',
      cursor: 'default',
    });
  });

  it('ships the shared single-layer inset ring, declared after hover/active/disabled', () => {
    const base: StyleObject = baseOf(true);
    const keys: string[] = Object.keys(base);
    const hover: number = keys.findIndex((key: string) => key.includes(':hover'));
    const active: number = keys.findIndex((key: string) => key.includes(':active'));
    const disabled: number = keys.indexOf('&[aria-disabled="true"]');
    const ring: number = keys.indexOf('&:focus-visible');

    expect(active).toBeGreaterThan(hover);
    expect(disabled).toBeGreaterThan(active);
    expect(ring).toBeGreaterThan(disabled);
    expect(ruleAt(base, ':focus-visible')).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
    expect(FOCUS_RING).toBe(`inset 0 0 0 2px ${DARK_PRIMARY}`);
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
    // The layout half is identical, which is what makes both branches paint the
    // same rest presentation.
    expect(base.border).toBe(`1px solid ${BRAND_GRAY}`);
    expect(base.backgroundColor).toBe(WHITE);
    expect(base.borderRadius).toBe('50%');
  });

  it('ships no transition and no animation, so nothing can move between states', () => {
    const serialised: string = JSON.stringify([baseOf(true), baseOf(false)]);

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

describe('ChevronGlyph — the glyph (pure recipe)', () => {
  it('renders one decorative 20px svg whose stroke follows currentColor', () => {
    render(<ChevronGlyph direction="right" />);

    const svg: Element = nodesMatching('svg')[0];
    const path: Element = nodesMatching('svg path')[0];
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(nodesMatching('svg path')).toHaveLength(1);
    expect(path).toHaveAttribute('d', 'M7.5 5L12.5 10L7.5 15');
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('stroke-width', '1.67');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
  });

  it('renders the left path when direction is left', () => {
    render(<ChevronGlyph direction="left" />);

    const path: Element = nodesMatching('svg path')[0];
    expect(path).toHaveAttribute('d', 'M12.5 5L7.5 10L12.5 15');
  });
});
