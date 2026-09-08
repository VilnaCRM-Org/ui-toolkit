import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiOptionCard from '../../src/components/ui-option-card';
import {
  BOX_CLASS,
  CAPTION_CLASS,
  VALUE_CLASS,
  boxSx,
  captionSx,
  optionCardSx,
  valueSx,
} from '../../src/components/ui-option-card/styles';
import type { UiOptionCardProps } from '../../src/components/ui-option-card/types';
import {
  useOptionCard,
  type OptionCardModel,
} from '../../src/components/ui-option-card/use-option-card';

import { ARIA_SELECTOR, focusables, nodesMatching } from './utils/dom-queries';
import firstOf from './utils/first-of';
import mockConsoleWarn from './utils/mock-console-warn';
import { collectorInto, describeRadioCardContract } from './utils/radio-card-contract';
import { keysMatching, type StyleObject, type SxLayers } from './utils/style-layers';

// UiOptionCard emits dev-only warnings via console.warn; silence them and keep a
// handle for the assertions that check them explicitly.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

const LABEL: string = 'Analytics API';
const VALUE_LABEL: string = 'Reporting';
const FULL_NAME: string = `${LABEL} ${VALUE_LABEL}`;

// A second brand, reached by the shared contract's tab-order sweep.
const SECOND_LABEL: string = 'Billing API';
const SECOND_VALUE_LABEL: string = 'Invoicing';
const SECOND_NAME: string = `${SECOND_LABEL} ${SECOND_VALUE_LABEL}`;

// The palette literals the brief pins, asserted as local consts so a token swap
// in `ui-color-theme` fails this suite rather than silently repainting the card.
const WHITE: string = '#FFF';
const BRAND_GRAY: string = '#E1E7EA';
const GREY400: string = '#D0D4D8';
const GREY500: string = '#EAECEE';
const GREY300: string = '#969B9D';
const GREY250: string = '#57595B';
const PRIMARY: string = '#1EAEFF';
const DARK_SECONDARY: string = '#1B2327';
const DARK_PRIMARY: string = '#1A1C1E';
const SELECTED_FILL: string = 'rgba(30, 174, 255, 0.1)';
const HOVER_SHADOW: string = '0 8px 15px rgba(49, 59, 67, 0.14)';
const FOCUS_RING: string = `inset 0 0 0 2px ${DARK_PRIMARY}`;

interface CardOverrides {
  // UiOptionCard has no `name` prop of its own; `name` is the shared radio-card
  // contract's field, and its closest honest analogue here is `label` — this
  // card's caption and identity text.
  name?: string | undefined;
  label?: string | undefined;
  valueLabel?: string | undefined;
  selected?: boolean | undefined;
  onSelect?: (() => void) | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  sx?: UiOptionCardProps['sx'] | undefined;
}

// Props are applied one by one (the repo forbids JSX spreading). `in` checks keep
// the "runtime data violates the prop type" fixtures — a missing label — expressible
// as an explicit `undefined`. `name` (the shared contract's field) falls back to
// `label` only when the caller supplies no explicit `label` override.
function cardWith(extra: Readonly<CardOverrides>): React.ReactElement {
  const label: string = (
    'label' in extra ? extra.label : 'name' in extra ? extra.name : LABEL
  ) as string;
  const valueLabel: string = ('valueLabel' in extra ? extra.valueLabel : VALUE_LABEL) as string;
  return (
    <UiOptionCard
      label={label}
      valueLabel={valueLabel}
      selected={extra.selected}
      onSelect={extra.onSelect}
      disabled={extra.disabled}
      id={extra.id}
      lang={extra.lang}
      sx={extra.sx}
    />
  );
}

function card(): HTMLElement {
  return screen.getByRole('radio');
}

function layersOf(interactive: boolean, sx: UiOptionCardProps['sx']): SxLayers {
  return optionCardSx({ interactive, sx }) as SxLayers;
}

function baseOf(interactive: boolean): StyleObject {
  return firstOf(layersOf(interactive, undefined));
}

// The consumer half of the ownership split: the group and its accessible name
// belong outside the card. UiOptionCard has no radiogroup-context warning to
// suppress, but the fixture shape mirrors its sibling radio-card suites.
function inGroup(node: React.ReactElement): React.ReactElement {
  return <div role="radiogroup">{node}</div>;
}

// The behaviour every radio card in the toolkit shares — role and permanent
// `aria-checked`, the selection-request gate, the `aria-disabled` boundary, tab
// order and ref plumbing, the live-region prohibition, the radiogroup teaching
// warning and the `sx` merge — is asserted once for every card that opts in.
//
// UiOptionCard diverges from its `name`/logo-bearing siblings in three ways the
// contract has no honest stand-in for: it has no `name` prop (its identity text
// is `label`, so the contract's blank/missing-`name` warning assertions do not
// match this card's "blank `label`" wording), no logo/mark concept at all (the
// `unusableLogo` field below is deliberately empty, per the brief), and no
// radiogroup-ancestor mount check or ref hook (so the shared radiogroup-context-
// warning `it`s have no wiring to exercise here). Those specific cases are noted
// in the follow-up report rather than faked. What follows below is what is TRUE
// OF THIS CARD ALONE.
describeRadioCardContract({
  name: 'UiOptionCard',
  cardWith,
  inGroup,
  warn,
  primaryName: FULL_NAME,
  secondaryName: SECOND_NAME,
  remountId: 'option-7',
  // This card paints no mark, so the mark-warning section does not run; and it
  // ships no radiogroup mount check, so that section does not either. Its
  // blank-identity warning names `label`, which is the prop that carries the
  // caption here.
  blankIdentityMessage: 'blank `label`',
  warnsOutsideRadiogroup: false,
  tabOrderGroup: (): React.ReactElement => (
    <div role="radiogroup">
      <UiOptionCard label={LABEL} valueLabel={VALUE_LABEL} onSelect={noop} />
      <UiOptionCard label="Static" valueLabel="Card" />
      <UiOptionCard label={SECOND_LABEL} valueLabel={SECOND_VALUE_LABEL} selected onSelect={noop} />
    </div>
  ),
  withRef: (ref: React.Ref<HTMLButtonElement>): React.ReactElement => (
    <UiOptionCard ref={ref} label={LABEL} valueLabel={VALUE_LABEL} onSelect={noop} />
  ),
  staticBase: (): StyleObject => baseOf(false),
});

describe('UiOptionCard — wired radio semantics', () => {
  it('renders the whole card as one native type="button" with role="radio"', () => {
    render(cardWith({ onSelect: noop }));

    const root: HTMLElement = card();
    expect(root.tagName).toBe('BUTTON');
    expect(root).toHaveAttribute('type', 'button');
    expect(root).toHaveAttribute('role', 'radio');
  });

  it('derives the accessible name from caption + space + value, no aria-label', () => {
    render(cardWith({ onSelect: noop }));

    const root: HTMLElement = card();
    expect(root).toHaveAccessibleName(FULL_NAME);
    expect(nodesMatching('[aria-label], [aria-labelledby]')).toHaveLength(0);
  });

  it('renders no chevron, radio dot or glyph of any kind', () => {
    render(cardWith({ onSelect: noop, selected: true }));

    expect(nodesMatching('svg')).toHaveLength(0);
    expect(nodesMatching('img')).toHaveLength(0);
  });

  it('applies id and lang only when the consumer supplies them', () => {
    const { rerender } = render(cardWith({ onSelect: noop }));

    expect(card()).not.toHaveAttribute('lang');
    expect(card()).not.toHaveAttribute('id');

    rerender(cardWith({ id: 'option-analytics', lang: 'en', onSelect: noop }));
    expect(card()).toHaveAttribute('id', 'option-analytics');
    expect(card()).toHaveAttribute('lang', 'en');
  });

  it('exposes its display name', () => {
    expect(UiOptionCard.displayName).toBe('UiOptionCard');
  });
});

describe('UiOptionCard — static (unwired) card', () => {
  it('exposes zero focusable elements and zero ARIA hooks', () => {
    render(cardWith({}));

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(focusables()).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });

  it('keeps the identical content tree, including the consumer id and lang', () => {
    render(cardWith({ id: 'static-card', lang: 'en' }));

    const [root] = nodesMatching('#static-card');
    expect(root).toBeDefined();
    expect((root as Element).tagName).toBe('DIV');
    expect(root).toHaveAttribute('lang', 'en');
    expect(screen.getByText(LABEL)).toBeInTheDocument();
    expect(screen.getByText(VALUE_LABEL)).toBeInTheDocument();
  });

  it('never paints the selected state, so no checked chrome outlives aria-checked', () => {
    render(cardWith({ selected: true }));

    expect(nodesMatching('[aria-checked]')).toHaveLength(0);
    expect(baseOf(false)['&[aria-checked="true"]']).toBeUndefined();
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('static content'));
  });

  it('shows no aria-disabled on a disabled static card', () => {
    render(cardWith({ disabled: true }));

    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
  });

  it('does not forward a ref to the static branch', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiOptionCard ref={ref} label={LABEL} valueLabel={VALUE_LABEL} />);

    expect(ref.current).toBeNull();
  });
});

describe('UiOptionCard — focus and ref forwarding', () => {
  it('forwards an object ref to the card button itself, never a wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiOptionCard ref={ref} label={LABEL} valueLabel={VALUE_LABEL} onSelect={noop} />);

    expect(ref.current).toBe(card());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node and releases it on unmount', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const collect: (node: HTMLButtonElement | null) => void = collectorInto(seen);
    const { unmount } = render(
      <UiOptionCard ref={collect} label={LABEL} valueLabel={VALUE_LABEL} onSelect={noop} />
    );

    expect(seen[0]).toBe(card());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });

  it('keeps focus on the card after activation (the card never moves focus)', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    const root: HTMLElement = card();
    root.focus();
    await user.keyboard('{Enter}');

    expect(root).toHaveFocus();
  });

  it('adds no explicit tabindex, so every wired card is one native tab stop', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <div role="radiogroup">
        <UiOptionCard label="A" valueLabel="One" onSelect={noop} />
        <UiOptionCard label="Static" valueLabel="Two" />
        <UiOptionCard label="B" valueLabel="Three" selected onSelect={noop} />
      </div>
    );

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('radio', { name: 'A One' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'B Three' })).toHaveFocus();
  });
});

describe('UiOptionCard — dev warnings', () => {
  it('warns when selected is passed without onSelect', () => {
    render(cardWith({ selected: true }));

    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('received `selected` without `onSelect`')
    );
  });

  it('does not warn about selected when onSelect is present', () => {
    render(cardWith({ selected: true, onSelect: noop }));

    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('without `onSelect`'));
  });

  it('warns on a blank label', () => {
    render(cardWith({ label: '  ', onSelect: noop }));

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns on a blank valueLabel when label is present', () => {
    render(cardWith({ valueLabel: '', onSelect: noop }));

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `valueLabel`'));
  });

  it('stays silent with valid label and valueLabel', () => {
    render(cardWith({ onSelect: noop }));

    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns on a nullish label (runtime data violating the prop type)', () => {
    render(cardWith({ label: undefined, onSelect: noop }));

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns on a nullish valueLabel (runtime data violating the prop type)', () => {
    render(cardWith({ valueLabel: undefined, onSelect: noop }));

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `valueLabel`'));
  });
});

describe('UiOptionCard — activation model (use-option-card.ts)', () => {
  it('no-ops safely when onActivate runs with no onSelect supplied', () => {
    const { result } = renderHook<OptionCardModel, unknown>(() =>
      useOptionCard({ label: LABEL, valueLabel: VALUE_LABEL })
    );

    expect(() => result.current.onActivate()).not.toThrow();
  });
});

describe('UiOptionCard — style assembly (styles.ts)', () => {
  it('paints the static layout shared by every state', () => {
    const base: StyleObject = baseOf(false);

    expect(base.display).toBe('flex');
    expect(base.flexDirection).toBe('column');
    expect(base.alignItems).toBe('flex-start');
    expect(base.gap).toBe('0.625rem');
    expect(base.width).toBe('16.375rem');
    expect(base.textAlign).toBe('left');
    expect(base.backgroundColor).toBe('transparent');
  });

  it('adds interactive-only chrome (cursor, hover, checked, disabled, focus ring)', () => {
    const base: StyleObject = baseOf(true);

    expect(base.cursor).toBe('pointer');
    expect((base['&[aria-disabled="true"]'] as StyleObject).cursor).toBe('default');

    const [hoverKey] = keysMatching(base, ':hover');
    expect(hoverKey).toBeDefined();
    const hover: StyleObject = base[hoverKey as string] as StyleObject;
    expect(hover.borderColor).toBe(GREY400);
    expect(hover.boxShadow).toBe(HOVER_SHADOW);

    const checkedBox: StyleObject = base[`&[aria-checked="true"] .${BOX_CLASS}`] as StyleObject;
    expect(checkedBox.backgroundColor).toBe(SELECTED_FILL);
    expect(checkedBox.borderColor).toBe('transparent');

    const checkedValue: StyleObject = base[`&[aria-checked="true"] .${VALUE_CLASS}`] as StyleObject;
    expect(checkedValue.color).toBe(PRIMARY);
    expect(checkedValue.fontWeight).toBe(600);

    const disabledBox: StyleObject = base[`&[aria-disabled="true"] .${BOX_CLASS}`] as StyleObject;
    expect(disabledBox.backgroundColor).toBe(GREY500);
    expect(disabledBox.borderColor).toBe('transparent');

    const disabledValue: StyleObject = base[
      `&[aria-disabled="true"] .${VALUE_CLASS}`
    ] as StyleObject;
    expect(disabledValue.color).toBe(GREY300);

    const disabledCaption: StyleObject = base[
      `&[aria-disabled="true"] .${CAPTION_CLASS}`
    ] as StyleObject;
    expect(disabledCaption.color).toBe(GREY400);

    const ring: StyleObject = base['&:focus-visible'] as StyleObject;
    expect(ring.outline).toBe('none');
    expect(ring.boxShadow).toBe(FOCUS_RING);
  });

  it('leaves the static base with no interactive chrome at all', () => {
    const base: StyleObject = baseOf(false);

    expect(base.cursor).toBeUndefined();
    expect(base['&:hover:not([aria-checked="true"]):not([aria-disabled="true"])']).toBeUndefined();
    expect(base['&:focus-visible']).toBeUndefined();
  });

  it('merges a single consumer sx object last', () => {
    const consumerSx = { marginTop: '1rem' };
    const layers: SxLayers = layersOf(true, consumerSx);

    expect(layers).toHaveLength(2);
    expect(layers[1]).toBe(consumerSx);
  });

  it('spreads a consumer sx array after the base layer', () => {
    const first = { marginTop: '1rem' };
    const second = { marginBottom: '2rem' };
    const layers: SxLayers = layersOf(true, [first, second]);

    expect(layers).toHaveLength(3);
    expect(layers[1]).toBe(first);
    expect(layers[2]).toBe(second);
  });

  it('defaults to an empty consumer layer when sx is undefined', () => {
    const layers: SxLayers = layersOf(false, undefined);

    expect(layers).toHaveLength(2);
    expect(layers[1]).toEqual({});
  });

  it('paints the caption: Golos Text 500 15/18, grey250', () => {
    const caption = captionSx as StyleObject;

    expect(caption.fontFamily).toBe("'Golos Text'");
    expect(caption.fontWeight).toBe(500);
    expect(caption.fontSize).toBe('0.938rem');
    expect(caption.lineHeight).toBe('1.125rem');
    expect(caption.letterSpacing).toBe(0);
    expect(caption.color).toBe(GREY250);
  });

  it('paints the 262x60 border-box value box, inset 24px, rest chrome', () => {
    const box = boxSx as StyleObject;

    expect(box.boxSizing).toBe('border-box');
    expect(box.display).toBe('flex');
    expect(box.alignItems).toBe('center');
    expect(box.width).toBe('16.375rem');
    expect(box.height).toBe('3.75rem');
    expect(box.padding).toBe('0 0 0 1.5rem');
    expect(box.borderRadius).toBe('0.5rem');
    expect(box.border).toBe('1px solid transparent');
    expect(box.borderColor).toBe(BRAND_GRAY);
    expect(box.backgroundColor).toBe(WHITE);
  });

  it('paints the value: Golos Text 400 18/30, darkSecondary', () => {
    const value = valueSx as StyleObject;

    expect(value.fontFamily).toBe("'Golos Text'");
    expect(value.fontWeight).toBe(400);
    expect(value.fontSize).toBe('1.125rem');
    expect(value.lineHeight).toBe('1.875rem');
    expect(value.letterSpacing).toBe(0);
    expect(value.color).toBe(DARK_SECONDARY);
  });
});
