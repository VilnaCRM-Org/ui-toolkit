import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiLink from '../../src/components/ui-link';
import UiMultiSelect from '../../src/components/ui-multi-select';
import type { UiMultiSelectOption } from '../../src/components/ui-multi-select/types';

import mockConsoleWarn from './utils/mock-console-warn';

// UiMultiSelect emits dev-only accessibility guidance via console.warn; silence it
// for the whole file and assert on the spy in the dedicated block.
const warn = mockConsoleWarn();

// Tuple-typed so the per-index reads below stay definite `UiMultiSelectOption`s
// under `noUncheckedIndexedAccess`.
const options: [UiMultiSelectOption, UiMultiSelectOption, UiMultiSelectOption] = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv' },
  { label: 'Odesa', value: 'odesa' },
];

const noop: (value: UiMultiSelectOption[]) => void = () => undefined;

// Figma "Multiselect": the empty field's stroke is grey400 #D0D4D8 (from the theme);
// once chips fill it the stroke darkens to grey300 #969B9D (FILLED_STROKE_SX).
const EMPTY_STROKE: string = '#D0D4D8';
const FILLED_STROKE: string = '#969B9D';

/*
 * How the painted stroke is resolved here, and what that resolution assumes.
 *
 * `getComputedStyle` cannot answer the question. jsdom resolves the cascade by document
 * order alone and ignores specificity, and emotion emits the Autocomplete root's `sx`
 * rule BEFORE the notched outline's own rule whenever a filled field is the first thing
 * rendered (the root renders first) — so jsdom reports the resting stroke for a field
 * the browser paints with the override. Which rule lands first even varies with the
 * order the tests render in. The helpers below therefore read the emitted CSSOM and
 * resolve the winner the way a browser does: most specific rule wins, document order
 * breaking ties.
 *
 * Two rules can paint that fieldset today. The outline's own emotion class
 * (`.css-<hash>-MuiNotchedOutlined-root-MuiOutlinedInput-notchedOutline`, one class)
 * carries the shared field theme's `border: 1px solid #D0D4D8` AND the multi-select
 * theme's explicit `border-color: #D0D4D8`; it is that longhand, not the shorthand, that
 * this model can read. Once chips fill the field the root's `sx` adds
 * `.css-<hash>-MuiAutocomplete-root .MuiOutlinedInput-notchedOutline`, two classes, with
 * `border-color: #969B9D`. The override therefore wins on SPECIFICITY — not on document
 * order, which is exactly why the order-only answer is the wrong one. That specificity
 * gap is asserted below so it cannot erode unnoticed.
 *
 * These cases throw instead of being silently mis-resolved, so a future styling change
 * fails loudly rather than passing for the wrong reason:
 *   - a matching selector that is not a plain class chain (id, element, pseudo-class or
 *     pseudo-element), because a class count would stop being its specificity;
 *   - a `border-color` carrying `!important`;
 *   - a multi-value `border-color`, or a per-side longhand disagreeing with it — the
 *     resolved colour describes all four sides, not one;
 *   - a matching rule that paints through `border`, `border-<side>` or a lone
 *     `border-<side>-color`: cssom stores parsed declarations verbatim and never expands
 *     them, so those colours never reach `border-color` and would otherwise vanish;
 *   - a stroke nested in an at-rule such as `@media`/`@supports`, whose condition is not
 *     evaluated here;
 *   - an inline border on the fieldset;
 *   - no matching rule at all.
 * Selectors jsdom's engine cannot parse (MUI's `::-moz-focus-inner` vendor rules) and
 * `@keyframes` bodies are skipped rather than rejected: neither can paint a resting
 * border.
 */

/** One emitted rule that paints the fieldset's border. */
interface StrokeRule {
  /** The colour it paints on every side of the box. */
  color: string;
  /** Its class count — the specificity the cascade compares, once vetted below. */
  classes: number;
}

// One compound of bare class selectors, e.g. `.a` or `.a.b`. Combinators are split off
// before this is applied: a single pattern spanning the whole chain would need `\s*` on
// both sides of an optional combinator, which backtracks exponentially (CodeQL js/redos).
const CLASS_COMPOUND: RegExp = /^(?:\.[\w-]+)+$/;
// Whitespace, child and sibling combinators — the joins between compounds.
const COMBINATORS: RegExp = /[\s>+~]+/;
// Every property that can carry a border colour. Only `border-color` is readable here, so
// the rest have to be rejected on sight rather than skipped.
const BORDER_COLOUR_PROPERTY: RegExp = /^border(-(top|right|bottom|left))?(-color)?$/;
const SIDES: readonly string[] = [
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
];

function isStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return typeof (rule as CSSStyleRule).selectorText === 'string';
}

// MUI ships vendor pseudo-element rules (`::-moz-focus-inner`) that jsdom's
// selector engine refuses to parse; they can never paint a border, so skip them.
function matchesSafely(element: Element, selectorText: string): boolean {
  try {
    return element.matches(selectorText);
  } catch {
    return false;
  }
}

// The property names a parsed rule actually declares. cssom's CSSStyleDeclaration has no
// `item()`, so read the indexed entries instead.
function declaredProperties(style: CSSStyleDeclaration): string[] {
  return Array.from({ length: style.length }, (_, index) => style[index] ?? '');
}

// One colour rather than the four-value `border-color` form. Parenthesised groups are
// elided first so `rgb(30, 174, 255)` is not read as four values.
function isOneColour(color: string): boolean {
  return !color.replace(/\([^()]*\)/g, '').includes(' ');
}

// A descendant chain of bare class compounds: the only shape whose specificity a plain
// class count describes faithfully. Anything else — an id, an element, a pseudo-class or
// pseudo-element, an attribute test, a selector list — fails here.
function isClassChain(selectorText: string): boolean {
  return selectorText
    .trim()
    .split(COMBINATORS)
    .every(compound => CLASS_COMPOUND.test(compound));
}

// Reject any candidate the "most classes wins, all four sides alike" model misreads.
function assertModelled(rule: CSSStyleRule, color: string): void {
  if (!isClassChain(rule.selectorText)) {
    throw new Error(`stroke selector "${rule.selectorText}" is not a plain class chain`);
  }
  if (rule.style.getPropertyPriority('border-color') !== '') {
    throw new Error(`stroke rule "${rule.selectorText}" paints with !important`);
  }
  const sides: string[] = SIDES.map(side => rule.style.getPropertyValue(side));
  if (!isOneColour(color) || sides.some(side => side !== '' && side !== color)) {
    throw new Error(`stroke rule "${rule.selectorText}" paints its sides differently`);
  }
}

// A matching rule with no readable `border-color` is only safe to skip if it declares no
// border colour at all: cssom keeps `border: 1px solid X` and `border-bottom-color: X`
// verbatim, so their colours never surface as `border-color` and would drop out silently.
function assertNoHiddenStroke(rule: CSSStyleRule): void {
  const hidden: string | undefined = declaredProperties(rule.style).find(name =>
    BORDER_COLOUR_PROPERTY.test(name)
  );
  if (hidden !== undefined) {
    throw new Error(`stroke rule "${rule.selectorText}" paints through unread "${hidden}"`);
  }
}

function strokeOf(rule: CSSStyleRule, outline: Element): StrokeRule[] {
  if (!matchesSafely(outline, rule.selectorText)) return [];
  const color: string = rule.style.getPropertyValue('border-color');
  if (color === '') {
    assertNoHiddenStroke(rule);
    return [];
  }
  assertModelled(rule, color);
  return [{ color, classes: (rule.selectorText.match(/\./g) ?? []).length }];
}

// An at-rule's condition is not evaluated here, so a stroke hiding inside one would be
// resolved against a query that may not hold. Surface it instead of silently dropping it.
function strokeInsideAtRule(rule: CSSRule, outline: Element): StrokeRule[] {
  const grouped: CSSRuleList | undefined = (rule as CSSGroupingRule).cssRules;
  if (grouped === undefined || strokesIn(grouped, outline).length === 0) return [];
  throw new Error(`a stroke declared inside "${rule.cssText.slice(0, 40)}" is not modelled`);
}

function strokesIn(rules: CSSRuleList, outline: Element): StrokeRule[] {
  return Array.from(rules).flatMap(rule =>
    isStyleRule(rule) ? strokeOf(rule, outline) : strokeInsideAtRule(rule, outline)
  );
}

// Every emitted rule that paints the outline, in document order.
function strokeRules(outline: Element): StrokeRule[] {
  const inline: string = outline.getAttribute('style') ?? '';
  if (/border/i.test(inline)) {
    throw new Error(`the outline carries an unmodelled inline border: ${inline}`);
  }
  return Array.from(document.styleSheets).flatMap(sheet => strokesIn(sheet.cssRules, outline));
}

// The most specific matching rule paints the border; document order breaks ties, which
// is the cascade's own rule.
function paintedStroke(outline: Element): string {
  const painted: StrokeRule[] = strokeRules(outline);
  if (painted.length === 0) {
    throw new Error('no emitted rule paints the field stroke');
  }
  return painted.reduce((best, rule) => (rule.classes >= best.classes ? rule : best)).color;
}

function fieldOutline(): Element {
  const combobox: HTMLElement = screen.getByRole('combobox');
  // eslint-disable-next-line testing-library/no-node-access -- root wrapper, no semantic query
  const root: HTMLElement | null = combobox.closest('.MuiAutocomplete-root');
  // eslint-disable-next-line testing-library/no-node-access -- the outline is a bare fieldset
  const outline: Element | null | undefined = root?.querySelector(
    '.MuiOutlinedInput-notchedOutline'
  );
  if (outline === null || outline === undefined) {
    throw new Error('the multi-select rendered without an outlined border');
  }
  return outline;
}

// The colour of the border the user actually sees around the rendered field.
function fieldStrokeColor(): string {
  return paintedStroke(fieldOutline());
}

// The specificity of the MOST specific rule painting `color` — the one the cascade would
// compare. Taking the first in document order instead would let the gap close unnoticed.
function strokeSpecificity(color: string): number {
  const painted: number[] = strokeRules(fieldOutline())
    .filter(rule => rule.color === color)
    .map(rule => rule.classes);
  if (painted.length === 0) {
    throw new Error(`no emitted rule paints the field stroke ${color}`);
  }
  return Math.max(...painted);
}

describe('UiMultiSelect — filled-field stroke merge', () => {
  it('merges a consumer sx object while chips fill the field', () => {
    render(
      <UiMultiSelect
        options={options}
        value={[options[0]]}
        aria-label="Cities"
        onChange={noop}
        sx={{ marginTop: '4px' }}
      />
    );
    const combobox: HTMLElement = screen.getByRole('combobox', { name: 'Cities' });
    expect(combobox).toBeInTheDocument();
    // The consumer sx merges onto the Autocomplete root alongside the filled stroke;
    // assert the merged style actually reaches the DOM (not just that the field renders).
    // eslint-disable-next-line testing-library/no-node-access -- root wrapper, no semantic query
    const root: HTMLElement | null = combobox.closest('.MuiAutocomplete-root');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  it('merges a consumer sx array while chips fill the field', () => {
    render(
      <UiMultiSelect
        options={options}
        value={[options[0]]}
        aria-label="Cities"
        onChange={noop}
        sx={[{ marginTop: '4px' }]}
      />
    );
    const combobox: HTMLElement = screen.getByRole('combobox', { name: 'Cities' });
    expect(combobox).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access -- root wrapper, no semantic query
    const root: HTMLElement | null = combobox.closest('.MuiAutocomplete-root');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  it('paints the field with the darker filled stroke once a chip fills it', () => {
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );
    expect(fieldStrokeColor()).toBe(FILLED_STROKE);
  });

  // The resolution above would be a coin toss if the two rules ever tied: equal
  // specificity leaves only emotion's injection order deciding which colour paints the
  // field. Pin the gap so that day fails here instead of passing for the wrong reason.
  it('lets the filled stroke win on specificity, not merely on injection order', () => {
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );
    expect(strokeSpecificity(FILLED_STROKE)).toBeGreaterThan(strokeSpecificity(EMPTY_STROKE));
  });

  it('leaves an empty field on the lighter resting stroke', () => {
    render(<UiMultiSelect options={options} value={[]} aria-label="Cities" onChange={noop} />);
    expect(fieldStrokeColor()).toBe(EMPTY_STROKE);
  });

  it('leaves an omitted value on the lighter resting stroke', () => {
    render(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);
    expect(fieldStrokeColor()).toBe(EMPTY_STROKE);
  });

  it('darkens the stroke only when the selection becomes non-empty', () => {
    const { rerender } = render(
      <UiMultiSelect options={options} value={[]} aria-label="Cities" onChange={noop} />
    );
    expect(fieldStrokeColor()).toBe(EMPTY_STROKE);

    rerender(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );
    expect(fieldStrokeColor()).toBe(FILLED_STROKE);

    rerender(<UiMultiSelect options={options} value={[]} aria-label="Cities" onChange={noop} />);
    expect(fieldStrokeColor()).toBe(EMPTY_STROKE);
  });
});

async function openListbox(user: UserEvent): Promise<HTMLElement> {
  const combobox: HTMLElement = screen.getByRole('combobox');
  await user.click(combobox);
  return combobox;
}

describe('UiMultiSelect — rendering and accessible name', () => {
  it('renders a combobox', () => {
    render(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('names the combobox from a visible label', () => {
    render(<UiMultiSelect options={options} label="Cities" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'Cities' })).toBeInTheDocument();
  });

  it('names the combobox from aria-label when there is no visible label', () => {
    render(<UiMultiSelect options={options} aria-label="Choose cities" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'Choose cities' })).toBeInTheDocument();
  });

  it('prefers the visible label over aria-label', () => {
    render(<UiMultiSelect options={options} label="Cities" aria-label="Ignored" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'Cities' })).toBeInTheDocument();
  });

  it('falls back to aria-label when the label is empty', () => {
    render(<UiMultiSelect options={options} label="" aria-label="Cities" onChange={noop} />);
    expect(screen.getByRole('combobox', { name: 'Cities' })).toBeInTheDocument();
  });

  it('exposes its display name', () => {
    expect(UiMultiSelect.displayName).toBe('UiMultiSelect');
  });

  it('renders the dropdown chevron as a named, non-tabbable button', () => {
    render(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);
    const toggle: HTMLElement = screen.getByRole('button', { name: /open/i });
    expect(toggle).toHaveAttribute('tabindex', '-1');
  });

  it('shows a placeholder only while nothing is selected', () => {
    const { rerender } = render(
      <UiMultiSelect
        options={options}
        aria-label="Cities"
        placeholder="Pick some"
        onChange={noop}
      />
    );
    expect(screen.getByPlaceholderText('Pick some')).toBeInTheDocument();

    rerender(
      <UiMultiSelect
        options={options}
        aria-label="Cities"
        placeholder="Pick some"
        value={[options[0]]}
        onChange={noop}
      />
    );
    expect(screen.queryByPlaceholderText('Pick some')).not.toBeInTheDocument();
  });

  it('force-opens the dropdown inline (demo props)', () => {
    render(<UiMultiSelect aria-label="Roles" options={options} open disablePortal />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});

describe('UiMultiSelect — removable chips', () => {
  it('renders a chip for each selected option', () => {
    render(
      <UiMultiSelect
        options={options}
        value={[options[0], options[2]]}
        aria-label="Cities"
        onChange={noop}
      />
    );
    expect(screen.getByText('Kyiv')).toBeInTheDocument();
    expect(screen.getByText('Odesa')).toBeInTheDocument();
  });

  it('gives each chip a named delete control kept out of the tab order', () => {
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );
    const remove: HTMLElement = screen.getByRole('button', { name: 'Remove Kyiv' });
    expect(remove).toHaveAttribute('tabindex', '-1');
  });

  it('draws the Figma cross inside the delete control', () => {
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );
    const remove: HTMLElement = screen.getByRole('button', { name: 'Remove Kyiv' });

    // eslint-disable-next-line testing-library/no-node-access -- decorative glyph, no role
    const path: SVGPathElement | null = remove.querySelector<SVGPathElement>('svg path');
    expect(path).not.toBeNull();
    // Written out rather than imported: an expectation that reads the source
    // constant passes whatever that constant becomes.
    expect(path).toHaveAttribute('d', 'M4 4l8 8M12 4l-8 8');
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('stroke-width', '1.5');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
  });

  it('removes the focused chip with ArrowLeft then Delete', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiMultiSelect
        options={options}
        value={[options[0], options[1]]}
        aria-label="Cities"
        onChange={onChange}
      />
    );

    const combobox: HTMLElement = await openListbox(user);
    await user.keyboard('{Escape}'); // close the popup, keep focus on the input
    await user.keyboard('{ArrowLeft}'); // roving focus onto the last chip (Lviv)
    await user.keyboard('{Delete}');
    expect(onChange).toHaveBeenCalledWith([options[0]]);
    expect(combobox).toHaveFocus();
  });

  it('removes a chip through onChange when its delete control is clicked', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiMultiSelect
        options={options}
        value={[options[0], options[1]]}
        aria-label="Cities"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Remove Kyiv' }));
    expect(onChange).toHaveBeenCalledWith([options[1]]);
  });

  it('removes the last chip with Backspace on an empty input', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiMultiSelect
        options={options}
        value={[options[0], options[1]]}
        aria-label="Cities"
        onChange={onChange}
      />
    );

    const combobox: HTMLElement = await openListbox(user);
    await user.keyboard('{Escape}'); // close the popup, keep focus on the input
    await user.keyboard('{Backspace}');
    expect(onChange).toHaveBeenCalledWith([options[0]]);
    expect(combobox).toHaveFocus();
  });
});

describe('UiMultiSelect — listbox and multi-selection', () => {
  it('marks the listbox multi-selectable and names it from the field', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiMultiSelect options={options} label="Cities" onChange={noop} />);

    await openListbox(user);
    const listbox: HTMLElement = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    expect(listbox).toHaveAccessibleName('Cities');
  });

  it('reflects selected options with aria-selected', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );

    await openListbox(user);
    expect(screen.getByRole('option', { name: 'Kyiv' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Lviv' })).toHaveAttribute('aria-selected', 'false');
  });

  it('matches selection by value rather than object identity', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    // A fresh object, structurally equal to options[0] but NOT the same reference —
    // the real controlled-consumer case (value rebuilt from a separate fetch). This
    // only holds because isOptionEqualToValue matches by `.value`, not identity.
    render(
      <UiMultiSelect
        options={options}
        value={[{ label: 'Kyiv', value: 'kyiv' }]}
        aria-label="Cities"
        onChange={onChange}
      />
    );
    expect(screen.getByText('Kyiv')).toBeInTheDocument();

    await openListbox(user);
    expect(screen.getByRole('option', { name: 'Kyiv' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Lviv' })).toHaveAttribute('aria-selected', 'false');
    // Re-picking the value-equal option deselects it (would duplicate under
    // reference equality).
    await user.click(screen.getByRole('option', { name: 'Kyiv' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('adds an option and keeps the popup open on selection', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiMultiSelect
        options={options}
        value={[options[0]]}
        aria-label="Cities"
        onChange={onChange}
      />
    );

    await openListbox(user);
    await user.click(screen.getByRole('option', { name: 'Lviv' }));
    expect(onChange).toHaveBeenCalledWith([options[0], options[1]]);
    // disableCloseOnSelect keeps the listbox open for the next pick.
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('toggles a selected option off when picked again', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <UiMultiSelect
        options={options}
        value={[options[0]]}
        aria-label="Cities"
        onChange={onChange}
      />
    );

    await openListbox(user);
    await user.click(screen.getByRole('option', { name: 'Kyiv' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('filters options as the user types', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('Lv');
    const filtered: HTMLElement[] = screen.getAllByRole('option');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toHaveTextContent('Lviv');
  });

  it('does not throw when selecting without an onChange handler', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiMultiSelect options={options} aria-label="Cities" />);

    await openListbox(user);
    await user.click(screen.getByRole('option', { name: 'Kyiv' }));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not trap keyboard focus — Tab moves on', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <UiMultiSelect options={options} aria-label="Cities" onChange={noop} />
        <UiLink href="/after">after</UiLink>
      </>
    );

    await openListbox(user);
    await user.tab();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
  });
});

describe('UiMultiSelect — status announcements', () => {
  it('exposes an empty polite status region at mount', () => {
    render(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('announces an addition with the running count', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );

    await openListbox(user);
    await user.click(screen.getByRole('option', { name: 'Lviv' }));
    expect(screen.getByRole('status')).toHaveTextContent('Lviv added, 2 selected');
  });

  it('announces a removal on delete-control click', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <UiMultiSelect options={options} value={[options[0]]} aria-label="Cities" onChange={noop} />
    );

    await user.click(screen.getByRole('button', { name: 'Remove Kyiv' }));
    expect(screen.getByRole('status')).toHaveTextContent('Kyiv removed, 0 selected');
  });
});

describe('UiMultiSelect — error, helper and required semantics', () => {
  it('reflects the error prop through aria-invalid', () => {
    const { rerender } = render(
      <UiMultiSelect options={options} aria-label="Cities" error={false} onChange={noop} />
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'false');

    rerender(
      <UiMultiSelect
        options={options}
        aria-label="Cities"
        error
        helperText="Pick a city"
        onChange={noop}
      />
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('links helperText through aria-describedby', () => {
    render(
      <UiMultiSelect
        options={options}
        label="Cities"
        helperText="Select at least one"
        onChange={noop}
      />
    );
    expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Select at least one');
  });

  it('is required only while the selection is empty', () => {
    const { rerender } = render(
      <UiMultiSelect options={options} label="Cities" required value={[]} onChange={noop} />
    );
    expect(screen.getByRole('combobox')).toBeRequired();

    rerender(
      <UiMultiSelect
        options={options}
        label="Cities"
        required
        value={[options[0]]}
        onChange={noop}
      />
    );
    expect(screen.getByRole('combobox')).not.toBeRequired();
  });
});

describe('UiMultiSelect — disabled semantics', () => {
  it('disables the combobox and makes chips read-only', () => {
    render(
      <UiMultiSelect
        options={options}
        value={[options[0]]}
        aria-label="Cities"
        disabled
        onChange={noop}
      />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Remove Kyiv' })).not.toBeInTheDocument();
    // The chip text remains readable.
    expect(screen.getByText('Kyiv')).toBeInTheDocument();
  });

  it('removes a disabled combobox from the keyboard tab order', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <UiLink href="/before">before</UiLink>
        <UiMultiSelect options={options} aria-label="Cities" disabled onChange={noop} />
        <UiLink href="/after">after</UiLink>
      </>
    );
    await user.tab();
    expect(screen.getByRole('link', { name: 'before' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
  });
});

describe('UiMultiSelect — accessibility guidance', () => {
  it('warns when there is no accessible name', () => {
    render(<UiMultiSelect options={options} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
  });

  it('warns when the label is blank whitespace and nothing else names it', () => {
    render(<UiMultiSelect options={options} label="   " onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('stays quiet when a label, aria-label or id is provided', () => {
    const { rerender } = render(<UiMultiSelect options={options} label="Cities" onChange={noop} />);
    rerender(<UiMultiSelect options={options} aria-label="Cities" onChange={noop} />);
    rerender(<UiMultiSelect options={options} id="cities" onChange={noop} />);
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });

  it('warns when in error with no helperText', () => {
    render(<UiMultiSelect options={options} aria-label="Cities" error onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('stays quiet in error when a helperText is supplied', () => {
    render(
      <UiMultiSelect
        options={options}
        aria-label="Cities"
        error
        helperText="Required"
        onChange={noop}
      />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('warns in error when helperText is blank whitespace', () => {
    render(
      <UiMultiSelect options={options} aria-label="Cities" error helperText="   " onChange={noop} />
    );
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('stays quiet in error when helperText is a non-text node', () => {
    render(
      <UiMultiSelect
        options={options}
        aria-label="Cities"
        error
        helperText={<span>Pick a city</span>}
        onChange={noop}
      />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('helperText'));
  });

  it('emits no warnings in production even without a name', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(<UiMultiSelect options={options} onChange={noop} />);
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('re-logs the name warning when the name is removed on re-render', () => {
    const { rerender } = render(
      <UiMultiSelect options={options} aria-label="Cities" onChange={noop} />
    );
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('accessible name'));
    rerender(<UiMultiSelect options={options} onChange={noop} />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });
});
