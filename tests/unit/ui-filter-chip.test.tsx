import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiFilterChip from '../../src/components/ui-filter-chip';
import { ChipGlyph, X_CLOSE_PATH } from '../../src/components/ui-filter-chip/chip-glyph';
import filterChipWarning from '../../src/components/ui-filter-chip/filter-chip-warnings';
import {
  CHIP_GLYPH_CLASS,
  CHIP_LABEL_CLASS,
  CHIP_SHADOW,
  CHIP_VALUE_CLASS,
  FOCUS_RING,
  FOCUS_SELECTORS,
  chipGlyphSx,
  chipLabelRowSx,
  chipLabelSx,
  chipValueSx,
  filterChipSx,
} from '../../src/components/ui-filter-chip/styles';
import type { UiFilterChipProps } from '../../src/components/ui-filter-chip/types';
import {
  DEFAULT_REMOVE_LABEL,
  useFilterChip,
  type FilterChipModel,
} from '../../src/components/ui-filter-chip/use-filter-chip';

import { ARIA_SELECTOR, expectNoLiveRegion, focusables, nodesMatching } from './utils/dom-queries';
import mockConsoleWarn from './utils/mock-console-warn';
import { keysMatching, type StyleObject, type SxLayers } from './utils/style-layers';

// UiFilterChip emits the two dev-only accessible-name warnings via console.warn.
// Silence them for the suite and keep a handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// The Figma "Tags" master's own sample string, verbatim — curly quotes
// U+201C/U+201D included. Both segments are consumer data: the chip bakes in no
// natural-language literal of its own except the hidden removal suffix.
const LABEL: string = 'Фильтр:';
const VALUE: string = 'Комментар - “клиент”';
const SUFFIX: string = ', видалити фільтр';

// Name = visible text FIRST, removal semantics appended (SC 2.5.3). The accessible
// name algorithm joins the three text nodes with single spaces.
const CHIP_NAME: string = `${LABEL} ${VALUE} ${SUFFIX}`;

// Palette literals, pinned rather than imported: a mutation that swaps a token for
// its neighbour must fail here, which it cannot do if the expectation reads the
// same token as the implementation.
const GREY500: string = '#EAECEE';
const GREY400: string = '#D0D4D8';
const GREY300: string = '#969B9D';
const GREY250: string = '#57595B';
const DARK_PRIMARY: string = '#1A1C1E';
const PRIMARY: string = '#1EAEFF';
const ACTIVE_BLUE: string = '#0399ED';
const WHITE: string = '#FFF';

interface ChipOverrides {
  label?: string | undefined;
  filterValue?: string | undefined;
  removeLabel?: string | undefined;
  onRemove?: (() => void) | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  sx?: UiFilterChipProps['sx'] | undefined;
}

// Props are applied one by one (the repo forbids JSX spreading). `in` checks keep
// the "runtime data violates the prop type" fixtures — an absent label, an absent
// filter value — expressible as an explicit `undefined`.
function chipWith(extra: Readonly<ChipOverrides>): React.ReactElement {
  const label: string = ('label' in extra ? extra.label : LABEL) as string;
  const filterValue: string = ('filterValue' in extra ? extra.filterValue : VALUE) as string;
  return (
    <UiFilterChip
      label={label}
      filterValue={filterValue}
      removeLabel={extra.removeLabel}
      onRemove={extra.onRemove}
      disabled={extra.disabled}
      id={extra.id}
      lang={extra.lang}
      sx={extra.sx}
    />
  );
}

function chip(): HTMLElement {
  return screen.getByRole('button');
}

// `noUncheckedIndexedAccess` makes every index read optional, so the "there is
// one and this test is about it" assumption is asserted once here instead of
// being cast away at each call site.
function firstMatching(selector: string): Element {
  const [first] = nodesMatching(selector);
  if (first === undefined) {
    throw new Error(`no node matched ${selector}`);
  }
  return first;
}

function firstKey(keys: string[]): string {
  const [first] = keys;
  if (first === undefined) {
    throw new Error('no style key matched');
  }
  return first;
}

function glyphBox(): Element {
  return firstMatching(`.${CHIP_GLYPH_CLASS}`);
}

function layersOf(interactive: boolean, sx: UiFilterChipProps['sx']): SxLayers {
  return filterChipSx({ interactive, sx }) as SxLayers;
}

function baseOf(interactive: boolean): StyleObject {
  return layersOf(interactive, undefined)[0] as StyleObject;
}

function ruleAt(base: StyleObject, fragment: string): StyleObject {
  return base[firstKey(keysMatching(base, fragment))] as StyleObject;
}

// Records every node the forwarded callback ref is handed, attach and detach.
function collectorInto(
  seen: (HTMLButtonElement | null)[]
): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    seen.push(node);
  };
}

describe('UiFilterChip — wired button semantics (§ Role / ARIA state mapping)', () => {
  it('renders the whole pill as ONE native type="button" with no implicit role hack', () => {
    render(chipWith({ onRemove: noop }));

    const root: HTMLElement = chip();
    expect(root.tagName).toBe('BUTTON');
    expect(root).toHaveAttribute('type', 'button');
    // The role is the element's own; nothing overrides it.
    expect(root).not.toHaveAttribute('role');
    expect(root).toHaveAccessibleName(CHIP_NAME);
  });

  it('ships no ARIA state at all — a plain action button', () => {
    render(chipWith({ onRemove: noop }));

    const root: HTMLElement = chip();
    expect(root).not.toHaveAttribute('aria-pressed');
    // `aria-checked` is swept by name: the chip is not a checkable role at all,
    // so a checked-state matcher would be the wrong question to ask of it.
    expect(root.getAttributeNames()).not.toContain('aria-checked');
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root).not.toHaveAttribute('aria-haspopup');
    expect(root).not.toHaveAttribute('aria-selected');
    expect(root).not.toHaveAttribute('aria-disabled');
    expect(root).not.toHaveAttribute('aria-setsize');
    expect(root).not.toHaveAttribute('aria-posinset');
  });

  it('keeps exactly one focusable element — never a smaller nested × button', () => {
    render(chipWith({ onRemove: noop }));

    expect(focusables()).toHaveLength(1);
    expect(focusables()[0]).toBe(chip());
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(nodesMatching('input')).toHaveLength(0);
  });

  it('renders no list semantics of its own — the consumer owns the surrounding list', () => {
    render(chipWith({ onRemove: noop }));

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('heading')).toHaveLength(0);
  });

  it('paints both label segments as plain spans carrying the class hooks', () => {
    render(chipWith({ onRemove: noop }));

    const prefix: Element = firstMatching(`.${CHIP_LABEL_CLASS}`);
    const value: Element = firstMatching(`.${CHIP_VALUE_CLASS}`);
    expect(prefix.tagName).toBe('SPAN');
    expect(value.tagName).toBe('SPAN');
    expect(screen.getByText(LABEL)).toBe(prefix);
    expect(screen.getByText(VALUE)).toBe(value);
    expect(nodesMatching(`.${CHIP_LABEL_CLASS}`)).toHaveLength(1);
    expect(nodesMatching(`.${CHIP_VALUE_CLASS}`)).toHaveLength(1);
  });

  it('renders the × as an aria-hidden decoration that is never a control', () => {
    render(chipWith({ onRemove: noop }));

    const box: Element = glyphBox();
    const svg: Element = firstMatching('svg');
    expect(box.tagName).toBe('SPAN');
    expect(box).not.toHaveAttribute('role');
    expect(box).not.toHaveAttribute('tabindex');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    // Never an <svg> with a <title>: it would duplicate the hidden suffix.
    expect(nodesMatching('title')).toHaveLength(0);
    expect(nodesMatching('svg')).toHaveLength(1);
  });

  it('applies id on the button and lang on the filter text alone', () => {
    const { rerender } = render(chipWith({ onRemove: noop }));

    expect(chip()).not.toHaveAttribute('id');
    expect(nodesMatching('[lang]')).toHaveLength(0);

    rerender(chipWith({ id: 'filter-comment', lang: 'ru', onRemove: noop }));
    expect(chip()).toHaveAttribute('id', 'filter-comment');
    // `lang` marks the FILTER TEXT, never the whole chip: the built-in Ukrainian
    // removal suffix must not be relabelled as Russian along with it (SC 3.1.2).
    expect(chip()).not.toHaveAttribute('lang');
    const marked: Element = firstMatching('[lang="ru"]');
    expect(marked).toHaveTextContent(`${LABEL}${VALUE}`);
    expect(marked).not.toHaveTextContent(SUFFIX);
  });

  it('exposes its display name', () => {
    expect(UiFilterChip.displayName).toBe('UiFilterChip');
  });
});

describe('UiFilterChip — static (unwired) chip', () => {
  it('exposes zero buttons, zero focusable elements and zero ARIA hooks', () => {
    render(chipWith({}));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(focusables()).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });

  it('keeps the identical VISIBLE tree, × included, and drops the removal suffix', () => {
    render(chipWith({ id: 'static-chip', lang: 'ru' }));

    const root: Element = firstMatching('#static-chip');
    expect(root.tagName).toBe('DIV');
    expect(root.contains(glyphBox())).toBe(true);
    expect(screen.getByText(LABEL)).toBeInTheDocument();
    expect(screen.getByText(VALUE)).toBeInTheDocument();
    expect(firstMatching('[lang="ru"]')).toHaveTextContent(`${LABEL}${VALUE}`);
    // A static chip removes nothing, so announcing ", видалити фільтр" would
    // promise assistive tech an action that does not exist.
    expect(screen.queryByText(SUFFIX)).not.toBeInTheDocument();
    expect(nodesMatching('svg')).toHaveLength(1);
  });

  it('never paints the disabled state, so no grey outlives aria-disabled', () => {
    render(chipWith({ disabled: true }));

    // The disabled chrome is keyed off `[aria-disabled="true"]`, an attribute this
    // branch never has — the rest presentation is structural, not conditional.
    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
    expect(baseOf(false)['&[aria-disabled="true"]']).toBeUndefined();
  });

  it('never fires anything, because there is nothing to activate', async () => {
    const user: UserEvent = userEvent.setup();
    render(chipWith({ id: 'static-chip' }));

    const root: HTMLElement = firstMatching('#static-chip') as HTMLElement;
    await user.click(root);
    await user.tab();

    expect(root).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });
});

describe('UiFilterChip — removal requests', () => {
  it('requests removal exactly once per click, with no payload', async () => {
    const user: UserEvent = userEvent.setup();
    const onRemove: jest.Mock = jest.fn();
    render(chipWith({ onRemove }));

    await user.click(chip());

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith();
  });

  it('requests removal exactly once on Enter (no manual key handler double-fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onRemove: jest.Mock = jest.fn();
    render(chipWith({ onRemove }));

    chip().focus();
    await user.keyboard('{Enter}');

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('requests removal exactly once on Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onRemove: jest.Mock = jest.fn();
    render(chipWith({ onRemove }));

    chip().focus();
    await user.keyboard(' ');

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('ignores Delete, Backspace, arrows and printable keys — no shortcut exists', async () => {
    const user: UserEvent = userEvent.setup();
    const onRemove: jest.Mock = jest.fn();
    render(chipWith({ onRemove }));

    chip().focus();
    await user.keyboard('{Delete}{Backspace}{ArrowLeft}{ArrowRight}{Home}{End}{Escape}a');

    expect(onRemove).not.toHaveBeenCalled();
  });

  it('stays eligible after the consumer DECLINES the removal', async () => {
    const user: UserEvent = userEvent.setup();
    const onRemove: jest.Mock = jest.fn();
    render(chipWith({ onRemove }));

    await user.click(chip());
    await user.click(chip());
    chip().focus();
    await user.keyboard('{Enter}');

    // The chip stayed mounted (the consumer declined), so every later activation
    // is reported again — the gate is state, never a latch.
    expect(onRemove).toHaveBeenCalledTimes(3);
    expect(chip()).toBeInTheDocument();
  });

  it('never submits an enclosing filter form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    const onRemove: jest.Mock = jest.fn();
    render(<form onSubmit={onSubmit}>{chipWith({ onRemove })}</form>);

    chip().focus();
    await user.keyboard('{Enter}');

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('UiFilterChip — disabled (aria-disabled boundary)', () => {
  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    render(chipWith({ disabled: true, onRemove: noop }));

    const root: HTMLElement = chip();
    expect(root).toHaveAttribute('aria-disabled', 'true');
    // The native `disabled` attribute is NEVER set — that is what keeps the chip
    // focusable while disabled (SC 2.4.3).
    expect(root.getAttributeNames()).not.toContain('disabled');
    expect(root).toBeEnabled();
    expect(root.tagName).toBe('BUTTON');
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(chipWith({ disabled: true, onRemove: noop }));

    await user.tab();
    expect(chip()).toHaveFocus();
  });

  it('no-ops every activation path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onRemove: jest.Mock = jest.fn();
    render(chipWith({ disabled: true, onRemove }));

    await user.click(chip());
    chip().focus();
    await user.keyboard('{Enter} ');

    expect(onRemove).not.toHaveBeenCalled();
  });

  it('retains focus when a focused chip flips disabled, then removes once re-enabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onRemove: jest.Mock = jest.fn();
    const { rerender } = render(chipWith({ onRemove }));

    const root: HTMLElement = chip();
    root.focus();
    await user.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(1);

    rerender(chipWith({ disabled: true, onRemove }));
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).toHaveFocus();
    expect(document.body).not.toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(1);

    rerender(chipWith({ onRemove }));
    expect(root).not.toHaveAttribute('aria-disabled');
    expect(root).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(2);
  });

  it('keeps the full accessible name while disabled — nothing is dropped', () => {
    render(chipWith({ disabled: true, onRemove: noop }));

    expect(chip()).toHaveAccessibleName(CHIP_NAME);
    expect(screen.getByText(LABEL)).toBeInTheDocument();
  });
});

describe('UiFilterChip — focus and tab order', () => {
  it('adds no explicit tabindex, so every wired chip is one native tab stop', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <div>
        <UiFilterChip label={LABEL} filterValue="Перший" onRemove={noop} />
        <UiFilterChip label={LABEL} filterValue="Статичний" />
        <UiFilterChip label={LABEL} filterValue="Другий" onRemove={noop} />
      </div>
    );

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('button', { name: /Перший/ })).toHaveFocus();
    // The static chip is skipped because it is not focusable at all.
    await user.tab();
    expect(screen.getByRole('button', { name: /Другий/ })).toHaveFocus();
  });

  it('keeps focus on the chip after activation — the chip never moves focus itself', async () => {
    const user: UserEvent = userEvent.setup();
    const onRemove: jest.Mock = jest.fn();
    render(chipWith({ onRemove }));

    const root: HTMLElement = chip();
    root.focus();
    await user.keyboard('{Enter}');

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(root).toHaveFocus();
  });

  it('forwards an object ref to the chip button itself, never a wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiFilterChip ref={ref} label={LABEL} filterValue={VALUE} onRemove={noop} />);

    expect(ref.current).toBe(chip());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node and releases it on unmount', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const collect: (node: HTMLButtonElement | null) => void = collectorInto(seen);
    const { unmount } = render(
      <UiFilterChip ref={collect} label={LABEL} filterValue={VALUE} onRemove={noop} />
    );

    expect(seen[0]).toBe(chip());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });

  it('hands back nothing on a static chip — there is no focusable node to return', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiFilterChip ref={ref} label={LABEL} filterValue={VALUE} />);

    expect(ref.current).toBeNull();
  });

  it('re-resolves the chip by id after a remount, the documented focus-return API', () => {
    const { unmount } = render(chipWith({ id: 'filter-3', onRemove: noop }));
    expect(chip()).toHaveAttribute('id', 'filter-3');

    unmount();
    expect(nodesMatching('#filter-3')).toHaveLength(0);

    render(chipWith({ id: 'filter-3', onRemove: noop }));
    const remounted: Element = firstMatching('#filter-3');
    expect(remounted).toBe(chip());
    (remounted as HTMLElement).focus();
    expect(remounted).toHaveFocus();
  });
});

describe('UiFilterChip — accessible name', () => {
  it('names the chip label + value + hidden suffix, visible text first', () => {
    render(chipWith({ onRemove: noop }));

    const name: string = chip().textContent ?? '';
    expect(chip()).toHaveAccessibleName(CHIP_NAME);
    expect(name.indexOf(LABEL)).toBe(0);
    expect(name.indexOf(VALUE)).toBeGreaterThan(name.indexOf(LABEL));
    expect(name.indexOf(SUFFIX)).toBeGreaterThan(name.indexOf(VALUE));
  });

  it('carries no aria-label, aria-labelledby or title anywhere in the tree', () => {
    render(chipWith({ onRemove: noop }));

    expect(nodesMatching('[aria-label], [aria-labelledby], [title]')).toHaveLength(0);
    expect(chip()).not.toHaveAttribute('aria-label');
  });

  it('honours a removeLabel override in the name, in the same trailing position', () => {
    render(chipWith({ removeLabel: ', зняти цей фільтр', onRemove: noop }));

    expect(chip()).toHaveAccessibleName(`${LABEL} ${VALUE} , зняти цей фільтр`);
    expect(screen.queryByText(SUFFIX)).not.toBeInTheDocument();
  });

  it('hides the suffix visually with the shared srOnly clip recipe', () => {
    render(chipWith({ onRemove: noop }));

    const hidden: HTMLElement = screen.getByText(SUFFIX);
    expect(hidden.tagName).toBe('SPAN');
    expect(hidden).toHaveStyle({ position: 'absolute', width: '1px', height: '1px' });
    expect(hidden).toHaveStyle({ overflow: 'hidden', whiteSpace: 'nowrap' });
    // Hidden from sight, never from assistive technology.
    expect(hidden).not.toHaveAttribute('aria-hidden');
  });

  it('reads the static chip as the visible text alone, with no action verb', () => {
    render(chipWith({ id: 'static-name' }));

    const root: HTMLElement = firstMatching('#static-name') as HTMLElement;
    // Both visible segments in wired order, and nothing after them: the removal
    // verb belongs to the wired branch, which is the only one that can act.
    expect(root).toHaveTextContent(`${LABEL}${VALUE}`);
    expect(root).not.toHaveTextContent(SUFFIX);
  });

  it('keeps a long filter value whole — no clamp, no ellipsis, one line', () => {
    // Held in two segments so neither source line passes the 100-BYTE lint
    // budget; the asserted value is the whole sentence.
    const HEAD: string = 'Коментар - “клієнт із дуже';
    const TAIL: string = 'довгою назвою компанії та описом”';
    const LONG: string = `${HEAD} ${TAIL}`;
    render(chipWith({ filterValue: LONG, onRemove: noop }));

    expect(screen.getByText(LONG)).toBeInTheDocument();
    expect((chipLabelRowSx as StyleObject).whiteSpace).toBe('nowrap');
    expect((chipValueSx as StyleObject).textOverflow).toBeUndefined();
    expect((chipValueSx as StyleObject).WebkitLineClamp).toBeUndefined();
  });
});

describe('UiFilterChip — live-region prohibition', () => {
  it('exposes none across rest, disabled and static', () => {
    const { rerender } = render(chipWith({ onRemove: noop }));
    expectNoLiveRegion();

    rerender(chipWith({ disabled: true, onRemove: noop }));
    expectNoLiveRegion();

    rerender(chipWith({}));
    expectNoLiveRegion();
  });

  it('exposes none after a real removal request', async () => {
    const user: UserEvent = userEvent.setup();
    const onRemove: jest.Mock = jest.fn();
    render(chipWith({ onRemove }));

    await user.click(chip());

    expect(onRemove).toHaveBeenCalledTimes(1);
    expectNoLiveRegion();
  });
});

describe('UiFilterChip — dev warnings', () => {
  it('stays silent for a healthy wired chip and a healthy static one', () => {
    const { rerender } = render(chipWith({ onRemove: noop }));
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(chipWith({}));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns when BOTH visible segments are blank — the removal loses its subject', () => {
    render(chipWith({ label: '  ', filterValue: '', onRemove: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no subject'));
  });

  it('warns when both segments are missing entirely', () => {
    render(chipWith({ label: undefined, filterValue: undefined, onRemove: noop }));

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no subject'));
  });

  it('stays silent when only ONE segment is blank — the other still names the filter', () => {
    const { rerender } = render(chipWith({ label: '', onRemove: noop }));
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(chipWith({ filterValue: '   ', onRemove: noop }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns for a blank removeLabel override — the name loses its action semantics', () => {
    render(chipWith({ removeLabel: '   ', onRemove: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `removeLabel`'));
  });

  it('treats an omitted removeLabel as a default, never as an override', () => {
    render(chipWith({ removeLabel: undefined, onRemove: noop }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('reports the blank-subject misconfiguration ahead of the blank suffix', () => {
    render(chipWith({ label: '', filterValue: '', removeLabel: '', onRemove: noop }));

    // One warning per render, the most structural first: a name with no subject is
    // useless whatever the verb reads.
    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no subject'));
  });

  it('warns once per warning state, not once per render', () => {
    const { rerender } = render(chipWith({ label: '', filterValue: '', onRemove: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // `useDevWarning` is keyed on the message: a prop change landing in the SAME
    // warning state stays quiet — the console is not a render log.
    rerender(chipWith({ label: '   ', filterValue: undefined, onRemove: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // A change INTO a different warning state does re-report.
    rerender(chipWith({ removeLabel: '', onRemove: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(2);
    expect(warn.spy).toHaveBeenLastCalledWith(expect.stringContaining('blank `removeLabel`'));
  });

  it('warns on the static branch too — a nameless chip is nameless either way', () => {
    render(chipWith({ label: '', filterValue: '' }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no subject'));
  });

  it('emits nothing in production, for either warning', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { rerender } = render(chipWith({ label: '', filterValue: '', onRemove: noop }));
      rerender(chipWith({ removeLabel: '', onRemove: noop }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('filterChipWarning — first-applicable selector (pure)', () => {
  function warningFor(props: Readonly<ChipOverrides>): string | null {
    return filterChipWarning(props as UiFilterChipProps);
  }

  it('returns null for healthy props', () => {
    expect(warningFor({ label: LABEL, filterValue: VALUE })).toBeNull();
    expect(warningFor({ label: LABEL, filterValue: VALUE, removeLabel: SUFFIX })).toBeNull();
  });

  it('accepts either segment alone as a sufficient subject', () => {
    expect(warningFor({ label: LABEL, filterValue: '' })).toBeNull();
    expect(warningFor({ label: '', filterValue: VALUE })).toBeNull();
    expect(warningFor({ filterValue: VALUE })).toBeNull();
    expect(warningFor({ label: LABEL })).toBeNull();
  });

  it('reports the blank subject for every blank, missing and whitespace combination', () => {
    expect(warningFor({ label: '', filterValue: '' })).toContain('no subject');
    expect(warningFor({ label: '   ', filterValue: '\t' })).toContain('no subject');
    expect(warningFor({})).toContain('no subject');
    expect(warningFor({ label: undefined, filterValue: '' })).toContain('no subject');
  });

  it('reports the blank removeLabel only when it is an explicit blank override', () => {
    expect(warningFor({ label: LABEL, filterValue: VALUE, removeLabel: '' })).toContain(
      'blank `removeLabel`'
    );
    expect(warningFor({ label: LABEL, filterValue: VALUE, removeLabel: '  ' })).toContain(
      'blank `removeLabel`'
    );
    expect(warningFor({ label: LABEL, filterValue: VALUE, removeLabel: undefined })).toBeNull();
  });

  it('prefers the blank subject when both faults are present', () => {
    expect(warningFor({ label: '', filterValue: '', removeLabel: '' })).toContain('no subject');
  });
});

describe('UiFilterChip — consumer sx', () => {
  it('applies an object sx to the wired root, merged last', () => {
    render(chipWith({ sx: { marginTop: '1rem' }, onRemove: noop }));
    expect(chip()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the static root', () => {
    render(chipWith({ id: 'styled', sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }] }));

    const root: Element = firstMatching('#styled');
    expect(root).toHaveStyle({ marginTop: '1rem' });
    expect(root).toHaveStyle({ paddingTop: '2rem' });
  });
});

describe('filterChipSx — style assembly (pure, mutation-killing)', () => {
  it('pins the chip box to the measured 256x30 master geometry', () => {
    const base: StyleObject = baseOf(true);

    expect(base.boxSizing).toBe('border-box');
    expect(base.display).toBe('inline-flex');
    // A3: flex-start is faithful to the master; `center` would move the label.
    expect(base.alignItems).toBe('flex-start');
    expect(base.gap).toBe('0.5rem');
    expect(base.minHeight).toBe('1.875rem');
    // A hug-contents pill: a `minHeight`, never a `height`, and never a width.
    expect(base.height).toBeUndefined();
    expect(base.width).toBeUndefined();
    expect(base.margin).toBe(0);
    // Inside-stroke compensation: 1 + 7 + 212 + 8 + 20 + 7 + 1 = 256 across.
    expect(base.padding).toBe('4px 7px');
    expect(base.borderRadius).toBe('0.25rem');
    expect(base.backgroundColor).toBe(GREY500);
    expect(base.textAlign).toBe('left');
    expect(base.font).toBe('inherit');
  });

  it('keeps the border a constant 1px in every state, swapping only its colour', () => {
    const base: StyleObject = baseOf(true);
    const hover: StyleObject = ruleAt(base, ':hover');
    const active: StyleObject = ruleAt(base, ':active');

    expect(base.border).toBe('1px solid transparent');
    expect(hover.border).toBeUndefined();
    expect(hover.borderWidth).toBeUndefined();
    expect(hover.borderColor).toBe(GREY400);
    expect(active.border).toBeUndefined();
    expect(active.borderWidth).toBeUndefined();
    expect(active.borderColor).toBe(GREY300);
  });

  it('gates hover on the aria-disabled boundary and paints the Figma hover column', () => {
    const base: StyleObject = baseOf(true);
    const hoverKeys: string[] = keysMatching(base, ':hover');

    expect(hoverKeys).toEqual(['&:hover:not([aria-disabled="true"])']);
    expect(base['&:hover']).toBeUndefined();
    expect(base[firstKey(hoverKeys)]).toEqual({
      backgroundColor: WHITE,
      borderColor: GREY400,
      boxShadow: CHIP_SHADOW,
      [`& .${CHIP_GLYPH_CLASS}`]: { color: PRIMARY },
    });
  });

  it('gates :active on the same boundary and darkens border + glyph one step (A2)', () => {
    const base: StyleObject = baseOf(true);
    const activeKeys: string[] = keysMatching(base, ':active');

    expect(activeKeys).toEqual(['&:active:not([aria-disabled="true"])']);
    expect(base[firstKey(activeKeys)]).toEqual({
      backgroundColor: WHITE,
      borderColor: GREY300,
      boxShadow: CHIP_SHADOW,
      [`& .${CHIP_GLYPH_CLASS}`]: { color: ACTIVE_BLUE },
    });
  });

  it('pins the off-palette Figma drop shadow exactly', () => {
    expect(CHIP_SHADOW).toBe('0 4px 4px rgba(26, 27, 36, 0.09)');
  });

  it('paints the disabled column per segment, by attribute, with no opacity dimming', () => {
    const disabled: StyleObject = baseOf(true)['&[aria-disabled="true"]'] as StyleObject;

    expect(disabled).toEqual({
      cursor: 'default',
      [`& .${CHIP_LABEL_CLASS}`]: { color: GREY300 },
      [`& .${CHIP_VALUE_CLASS}`]: { color: GREY300 },
      [`& .${CHIP_GLYPH_CLASS}`]: { color: GREY300 },
    });
    expect(disabled.opacity).toBeUndefined();
    expect(disabled.backgroundColor).toBeUndefined();
  });

  it('ships the Amendment-A1 two-selector ring, verbatim, over the hover gate', () => {
    const base: StyleObject = baseOf(true);
    const ringKeys: string[] = keysMatching(base, ':focus-visible');

    // A bare `&:focus-visible` is (0,2,0) while the hover rule is (0,3,0), so on a
    // chip that is focused AND hovered the Figma shadow would win and the ring
    // would vanish. The second selector repeats hover's own negation to tie its
    // specificity; declared later, it wins. The bare one still covers a disabled,
    // focused chip.
    expect(ringKeys).toEqual([FOCUS_SELECTORS]);
    expect(FOCUS_SELECTORS).toBe('&:focus-visible, &:focus-visible:not([aria-disabled="true"])');
    expect(base[firstKey(ringKeys)]).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
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

  it('re-expresses the ring as an outline under forced colors', () => {
    expect(baseOf(true)['@media (forced-colors: active)']).toEqual({
      // The SAME selector list as the ring rule, not a bare `:focus-visible`:
      // a media query adds no specificity, so the shorter selector would lose to
      // the ring's own `outline: none` and leave forced-colors users no indicator.
      [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
    });
  });

  it('adds cursor and appearance only to the wired branch', () => {
    expect(baseOf(true).cursor).toBe('pointer');
    expect(baseOf(true).appearance).toBe('none');
  });

  it('omits every button-only rule from the static branch, keeping the layout half', () => {
    const base: StyleObject = baseOf(false);

    expect(base.cursor).toBeUndefined();
    expect(base.appearance).toBeUndefined();
    expect(base['&[aria-disabled="true"]']).toBeUndefined();
    expect(base['@media (forced-colors: active)']).toBeUndefined();
    expect(keysMatching(base, ':hover')).toEqual([]);
    expect(keysMatching(base, ':active')).toEqual([]);
    expect(keysMatching(base, ':focus-visible')).toEqual([]);
    // The layout half is identical, which is what makes both branches paint the
    // same rest presentation.
    expect(base.border).toBe('1px solid transparent');
    expect(base.backgroundColor).toBe(GREY500);
    expect(base.padding).toBe('4px 7px');
  });

  it('ships no transition and no animation, so nothing can move between states', () => {
    const serialised: string = JSON.stringify([
      baseOf(true),
      baseOf(false),
      chipLabelRowSx,
      chipLabelSx,
      chipValueSx,
      chipGlyphSx,
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

describe('filter-chip styles — content recipes (pure, mutation-killing)', () => {
  it('keeps the label row one un-wrapped line with the master 4px gap (A4)', () => {
    const row: StyleObject = chipLabelRowSx as StyleObject;

    expect(row.display).toBe('flex');
    expect(row.alignItems).toBe('center');
    expect(row.gap).toBe('0.25rem');
    expect(row.minWidth).toBe(0);
    expect(row.whiteSpace).toBe('nowrap');
  });

  it('pins both segments to Inter Medium 14/18 with tracking killed, differing only in ink', () => {
    const prefix: StyleObject = chipLabelSx as StyleObject;
    const value: StyleObject = chipValueSx as StyleObject;

    [prefix, value].forEach((segment: StyleObject): void => {
      // Inter 600 is not a loaded weight; the Figma "Medium" maps to 500.
      expect(segment.fontFamily).toBe('Inter');
      expect(segment.fontWeight).toBe(500);
      expect(segment.fontSize).toBe('0.875rem');
      expect(segment.lineHeight).toBe('1.125rem');
      expect(segment.letterSpacing).toBe(0);
    });
    expect(prefix.color).toBe(GREY250);
    expect(value.color).toBe(DARK_PRIMARY);
  });

  it('pins the 20px glyph box, clipped and never shrinking', () => {
    const box: StyleObject = chipGlyphSx as StyleObject;

    expect(box.flexShrink).toBe(0);
    expect(box.display).toBe('flex');
    expect(box.width).toBe('1.25rem');
    expect(box.height).toBe('1.25rem');
    expect(box.overflow).toBe('clip');
    // The rest ink; hover/active/disabled retint it through the class hook.
    expect(box.color).toBe(GREY300);
  });

  it('pins the class hooks the root drives every descendant swap through', () => {
    expect(CHIP_LABEL_CLASS).toBe('ui-filter-chip__label');
    expect(CHIP_VALUE_CLASS).toBe('ui-filter-chip__value');
    expect(CHIP_GLYPH_CLASS).toBe('ui-filter-chip__glyph');
  });
});

describe('ChipGlyph — the remove × (pure recipe)', () => {
  it('pins the Figma path, which is NOT the stock 24px x-close', () => {
    expect(X_CLOSE_PATH).toBe(
      'M14.16667 5.83333L5.83333 14.16667M5.83333 5.83333L14.16667 14.16667'
    );
    expect(X_CLOSE_PATH).not.toBe('M18 6L6 18M6 6L18 18');
  });

  it('renders one decorative 20px svg whose stroke follows currentColor', () => {
    render(<ChipGlyph />);

    const svg: Element = firstMatching('svg');
    const path: Element = firstMatching('svg path');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(nodesMatching('svg path')).toHaveLength(1);
    expect(path).toHaveAttribute('d', X_CLOSE_PATH);
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('stroke-width', '1.667');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
  });
});

describe('useFilterChip — chip view model', () => {
  function modelFor(props: Readonly<Partial<UiFilterChipProps>>): FilterChipModel {
    return renderHook((): FilterChipModel => useFilterChip(props as UiFilterChipProps)).result
      .current;
  }

  it('pins the Ukrainian default suffix', () => {
    expect(DEFAULT_REMOVE_LABEL).toBe(', видалити фільтр');
  });

  it('marks an unwired chip non-interactive with no aria-disabled', () => {
    const model: FilterChipModel = modelFor({ label: LABEL, filterValue: VALUE });

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
    expect(model.removeLabel).toBe(DEFAULT_REMOVE_LABEL);
  });

  it('does not throw when an unwired chip is activated (no onRemove to call)', () => {
    const model: FilterChipModel = modelFor({ label: LABEL, filterValue: VALUE });
    expect(() => model.onActivate()).not.toThrow();
  });

  it('leaves aria-disabled off a disabled but UNWIRED chip', () => {
    const model: FilterChipModel = modelFor({
      label: LABEL,
      filterValue: VALUE,
      disabled: true,
    });

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('swallows activation while disabled, before any DOM concern', () => {
    const onRemove: jest.Mock = jest.fn();
    const model: FilterChipModel = modelFor({
      label: LABEL,
      filterValue: VALUE,
      disabled: true,
      onRemove,
    });

    model.onActivate();

    expect(onRemove).not.toHaveBeenCalled();
    expect(model.ariaDisabled).toBe(true);
    expect(model.interactive).toBe(true);
  });

  it('reports removal once, payload-free, for a wired enabled chip', () => {
    const onRemove: jest.Mock = jest.fn();
    const model: FilterChipModel = modelFor({ label: LABEL, filterValue: VALUE, onRemove });

    model.onActivate();

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith();
    expect(model.interactive).toBe(true);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('treats an explicit `disabled: false` exactly like an absent one', () => {
    const onRemove: jest.Mock = jest.fn();
    const model: FilterChipModel = modelFor({
      label: LABEL,
      filterValue: VALUE,
      disabled: false,
      onRemove,
    });

    model.onActivate();

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('adopts a removeLabel override instead of the default suffix', () => {
    const model: FilterChipModel = modelFor({
      label: LABEL,
      filterValue: VALUE,
      removeLabel: ', зняти фільтр',
    });

    expect(model.removeLabel).toBe(', зняти фільтр');
  });
});
