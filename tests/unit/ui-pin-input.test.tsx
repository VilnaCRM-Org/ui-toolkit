import { createEvent, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiPinInput } from '../../src/components';
import {
  buildPinHandlers,
  type PinCellHandlers,
} from '../../src/components/ui-pin-input/pin-cell-handlers';
import usePinCellRefs, { type PinCellRefs } from '../../src/components/ui-pin-input/pin-cell-refs';
import pinInputWarning from '../../src/components/ui-pin-input/pin-input-warnings';
import type { PinAxes } from '../../src/components/ui-pin-input/pin-value';
import {
  PIN_CELL_CLASS,
  PIN_FOCUS_SHADOW,
  pinCellSx,
  pinGroupSx,
  pinInputSx,
} from '../../src/components/ui-pin-input/styles';
import type { UiPinCellLabel, UiPinInputProps } from '../../src/components/ui-pin-input/types';
import { usePinInput, type PinInputModel } from '../../src/components/ui-pin-input/use-pin-input';

import mockConsoleWarn from './utils/mock-console-warn';

// UiPinInput emits four dev-only warnings via console.warn — one of them on every
// field that mounts without an accessible group name. Silence them and keep a
// handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: (next: string) => void = () => undefined;

// Ukrainian consumer copy (Ruling 7). The component bakes in exactly one natural
// language literal of its own — the per-cell default name — and nothing else.
const GROUP_LABEL: string = 'Код підтвердження';
const HELPER_TEXT: string = 'Введіть 6 цифр, надіслані у SMS';

// The exact literals the Figma masters resolve to, pinned here so a token swap in
// styles.ts cannot pass silently.
const BRAND_GRAY: string = '#E1E7EA';
const GREY_400: string = '#D0D4D8';
const GREY_250: string = '#57595B';
const GREY_500: string = '#EAECEE';
const ERROR_MAIN: string = '#DC3939';
const WHITE: string = '#FFF';
const DARK_PRIMARY: string = '#1A1C1E';
const PRIMARY: string = '#1EAEFF';
const FOCUS_RING: string = `inset 0 0 0 2px ${DARK_PRIMARY}`;

// The four cell-level style rules, as exact selector strings: the whole
// attribute-selector state model is unpaintable without them, and a mutated
// selector is otherwise invisible to a render test.
const HOVER_KEY: string = '&:hover:not([aria-disabled="true"])';
const DISABLED_KEY: string = '&[aria-disabled="true"]';
const ACTIVE_KEY: string = '&:focus:not([aria-disabled="true"])';
const RING_KEY: string = '&:focus-visible, &:focus-visible:not([aria-disabled="true"])';
const FORCED_COLORS_KEY: string = '@media (forced-colors: active)';
// The root-level descendant rule that re-applies the shared field-controls
// helper-text treatment (this control mounts no ThemeProvider of its own).
const HELPER_TEXT_KEY: string = '& .MuiFormHelperText-root';

interface PinOverrides {
  label?: string;
  labelledBy?: string;
  value?: string;
  onChange?: (next: string) => void;
  length?: number;
  cellLabel?: UiPinCellLabel;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  sx?: UiPinInputProps['sx'];
}

// Props are threaded one by one (the repo forbids JSX spreading). The `in` check
// keeps "no accessible name at all" expressible as an explicit `undefined`, which
// is what the dev-only backstop exists for.
function pinWith(extra: Readonly<PinOverrides>): React.ReactElement {
  const label: string | undefined = 'label' in extra ? extra.label : GROUP_LABEL;
  return (
    <UiPinInput
      label={label}
      labelledBy={extra.labelledBy}
      value={extra.value}
      onChange={extra.onChange}
      length={extra.length}
      cellLabel={extra.cellLabel}
      required={extra.required}
      error={extra.error}
      helperText={extra.helperText}
      disabled={extra.disabled}
      id={extra.id}
      sx={extra.sx}
    />
  );
}

interface ControlledPinProps {
  initial: string;
  length?: number;
  disabled?: boolean;
  onValue?: (next: string) => void;
}

// The consumer half of the always-controlled contract: the field never self-flips
// a digit, so a real state owner is what makes typing, deleting and pasting
// observable end to end.
function ControlledPin({
  initial,
  length,
  disabled,
  onValue,
}: Readonly<ControlledPinProps>): React.ReactElement {
  const [value, setValue] = React.useState<string>(initial);
  const handleChange: (next: string) => void = React.useCallback(
    (next: string): void => {
      setValue(next);
      onValue?.(next);
    },
    [onValue]
  );
  return (
    <UiPinInput
      label={GROUP_LABEL}
      value={value}
      onChange={handleChange}
      length={length}
      disabled={disabled}
    />
  );
}

function group(): HTMLElement {
  return screen.getByRole('group');
}

function cells(): HTMLInputElement[] {
  return screen.getAllByRole('textbox');
}

function valuesOf(): string[] {
  return cells().map((cell: HTMLInputElement): string => cell.value);
}

function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

// Every ARIA/interactivity hook that would make the field claim widget state.
// `aria-label`, `aria-invalid`, `aria-required` and `aria-describedby` are
// deliberately absent from this list: they are the field's CONTENT semantics and
// belong to both branches.
const WIDGET_ARIA_SELECTOR: string =
  '[aria-disabled], [aria-pressed], [aria-checked], [aria-expanded], [aria-haspopup], ' +
  '[aria-controls], [aria-selected], [aria-setsize], [aria-posinset], [aria-readonly], ' +
  '[tabindex], [role="button"], [role="radio"]';

// A bare `aria-live` container has no implicit role, so role queries alone leave a
// hole; sweep the attributes too (S9).
function liveRegionNodes(): Element[] {
  return Array.from(
    document.querySelectorAll('[aria-live], [aria-atomic], [aria-relevant], output')
  );
}

function expectNoLiveRegion(): void {
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByRole('log')).not.toBeInTheDocument();
  expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  expect(screen.queryByRole('marquee')).not.toBeInTheDocument();
  expect(liveRegionNodes()).toHaveLength(0);
}

// Emotion injects `sx` through CSSOM `insertRule`, so the emitted CSS is only
// reachable through `document.styleSheets` — the `<style>` nodes carry no text.
function emittedRules(selector: string): string[] {
  const matched: string[] = [];
  Array.from(document.styleSheets).forEach((sheet: CSSStyleSheet): void => {
    Array.from(sheet.cssRules).forEach((rule: CSSRule): void => {
      if (rule.cssText.startsWith(`${selector} {`)) matched.push(rule.cssText);
    });
  });
  return matched;
}

// The emotion class emitted for the field root's `sx`, as a CSS selector.
function fieldRootEmotionClass(): string {
  const classes: string[] = Array.from(fieldRoot().classList);
  return `.${classes.find((name: string): boolean => name.startsWith('css-')) ?? 'missing'}`;
}

type StyleObject = Record<string, unknown>;

function cellStyle(): StyleObject {
  return pinCellSx as unknown as StyleObject;
}

function ruleAt(key: string): StyleObject {
  return cellStyle()[key] as StyleObject;
}

function keysMatching(base: StyleObject, fragment: string): string[] {
  return Object.keys(base).filter((key: string) => key.includes(fragment));
}

function pasteInto(cell: HTMLInputElement, text: string): Event {
  const event: Event = createEvent.paste(cell, {
    clipboardData: { getData: (): string => text },
  });
  fireEvent(cell, event);
  return event;
}

describe('UiPinInput — group semantics (role="group", naming)', () => {
  it('wraps the cells in a role="group" named by `label`', () => {
    render(pinWith({ onChange: noop }));

    const wrapper: HTMLElement = group();
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper).toHaveAttribute('aria-label', GROUP_LABEL);
    expect(wrapper).not.toHaveAttribute('aria-labelledby');
    expect(wrapper).toHaveAccessibleName(GROUP_LABEL);
  });

  it('names the group from `labelledBy`, which wins over `label`', () => {
    render(
      <div>
        <p id="visible-pin-label">Одноразовий код</p>
        {pinWith({ labelledBy: 'visible-pin-label', onChange: noop })}
      </div>
    );

    const wrapper: HTMLElement = group();
    expect(wrapper).toHaveAttribute('aria-labelledby', 'visible-pin-label');
    // Never both: a duplicated name would leave the winner up to the AT.
    expect(wrapper).not.toHaveAttribute('aria-label');
    expect(wrapper).toHaveAccessibleName('Одноразовий код');
  });

  it('falls back to `label` when `labelledBy` is blank rather than absent', () => {
    render(pinWith({ labelledBy: '   ', onChange: noop }));

    expect(group()).toHaveAttribute('aria-label', GROUP_LABEL);
    expect(group()).not.toHaveAttribute('aria-labelledby');
  });

  it('applies the consumer id to the group, and only when supplied', () => {
    const { rerender } = render(pinWith({ id: 'sms-code', onChange: noop }));
    expect(group()).toHaveAttribute('id', 'sms-code');

    rerender(pinWith({ onChange: noop }));
    expect(group()).not.toHaveAttribute('id');
  });

  it('carries no widget state on the wrapper — it is not a widget role', () => {
    render(
      pinWith({ disabled: true, error: true, required: true, helperText: 'x', onChange: noop })
    );

    const wrapper: HTMLElement = group();
    expect(wrapper).not.toHaveAttribute('aria-disabled');
    expect(wrapper).not.toHaveAttribute('aria-invalid');
    expect(wrapper).not.toBeRequired();
    expect(wrapper).not.toHaveAttribute('aria-describedby');
    expect(wrapper).not.toHaveAttribute('tabindex');
  });

  it('forwards the ref to the GROUP, never to a cell', () => {
    // Focus INSIDE the field is the field's business; returning focus TO the
    // field is the consumer's, so the handle they get is the group.
    const ref: React.RefObject<HTMLDivElement | null> = React.createRef<HTMLDivElement>();
    render(<UiPinInput ref={ref} label={GROUP_LABEL} onChange={noop} />);

    expect(ref.current).toBe(group());
  });

  it('exposes its display name', () => {
    expect(UiPinInput.displayName).toBe('UiPinInput');
  });
});

describe('UiPinInput — per-cell semantics', () => {
  it('renders N native text inputs, never a single grouped field or type="number"', () => {
    render(pinWith({ onChange: noop }));

    const all: HTMLInputElement[] = cells();
    expect(all).toHaveLength(6);
    all.forEach((cell: HTMLInputElement): void => {
      expect(cell.tagName).toBe('INPUT');
      expect(cell).toHaveAttribute('type', 'text');
      expect(cell).toHaveAttribute('inputmode', 'numeric');
      expect(cell).toHaveAttribute('pattern', '[0-9]*');
      expect(cell).toHaveAttribute('maxlength', '1');
      expect(cell).toHaveAttribute('placeholder', '0');
      expect(cell).toHaveClass(PIN_CELL_CLASS);
    });
    expect(nodesMatching('input[type="number"]')).toHaveLength(0);
  });

  it('puts the one-time-code autofill target on the FIRST cell only', () => {
    render(pinWith({ onChange: noop }));

    const all: HTMLInputElement[] = cells();
    expect(all[0]).toHaveAttribute('autocomplete', 'one-time-code');
    all.slice(1).forEach((cell: HTMLInputElement): void => {
      expect(cell).toHaveAttribute('autocomplete', 'off');
    });
    expect(nodesMatching('[autocomplete="one-time-code"]')).toHaveLength(1);
  });

  it('names every cell with the 1-based Ukrainian default', () => {
    render(pinWith({ length: 4, onChange: noop }));

    expect(cells().map((cell: HTMLInputElement) => cell.getAttribute('aria-label'))).toEqual([
      'Цифра 1 з 4',
      'Цифра 2 з 4',
      'Цифра 3 з 4',
      'Цифра 4 з 4',
    ]);
    expect(screen.getByRole('textbox', { name: 'Цифра 1 з 4' })).toBe(cells()[0]);
  });

  it('accepts a consumer `cellLabel`, which receives the 1-based index and length', () => {
    const seen: number[][] = [];
    const cellLabel: UiPinCellLabel = (index: number, length: number): string => {
      seen.push([index, length]);
      return `Digit ${index}/${length}`;
    };
    render(pinWith({ length: 3, cellLabel, onChange: noop }));

    expect(seen).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
    expect(cells().map((cell: HTMLInputElement) => cell.getAttribute('aria-label'))).toEqual([
      'Digit 1/3',
      'Digit 2/3',
      'Digit 3/3',
    ]);
  });

  it('never lets the placeholder become the accessible name', () => {
    render(pinWith({ onChange: noop }));
    expect(cells()[0]).toHaveAccessibleName('Цифра 1 з 6');
  });
});

describe('UiPinInput — always-controlled value', () => {
  it('paints one digit per cell and leaves the rest empty', () => {
    render(pinWith({ value: '482', onChange: noop }));
    expect(valuesOf()).toEqual(['4', '8', '2', '', '', '']);
  });

  it('treats a nullish value as the empty string, never uncontrolled', () => {
    render(pinWith({ value: undefined, onChange: noop }));

    expect(valuesOf()).toEqual(['', '', '', '', '', '']);
    cells().forEach((cell: HTMLInputElement): void => {
      expect(cell).toHaveValue('');
    });
  });

  it('filters non-digits and clamps an over-long value before painting', () => {
    const { rerender } = render(pinWith({ value: '4-8-2', onChange: noop }));
    expect(valuesOf()).toEqual(['4', '8', '2', '', '', '']);

    rerender(pinWith({ value: '48210099', onChange: noop }));
    expect(valuesOf()).toEqual(['4', '8', '2', '1', '0', '0']);
  });

  it('renders the normalised cell count, defaulting to six', () => {
    const { rerender } = render(pinWith({ onChange: noop }));
    expect(cells()).toHaveLength(6);

    rerender(pinWith({ length: 4, onChange: noop }));
    expect(cells()).toHaveLength(4);

    // Below one normalises to a single cell rather than an empty group.
    rerender(pinWith({ length: 0, onChange: noop }));
    expect(cells()).toHaveLength(1);
  });

  it('never self-flips a digit: with no state owner the cells stay empty', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(pinWith({ value: '', onChange }));

    await user.click(cells()[0]);
    await user.keyboard('4');

    expect(onChange).toHaveBeenCalledWith('4');
    expect(valuesOf()).toEqual(['', '', '', '', '', '']);
  });
});

describe('UiPinInput — typing', () => {
  it('fills the cell, reports the FULL next string and advances focus', async () => {
    const user: UserEvent = userEvent.setup();
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="" onValue={onValue} />);

    await user.click(cells()[0]);
    await user.keyboard('4');
    expect(onValue).toHaveBeenLastCalledWith('4');
    expect(cells()[1]).toHaveFocus();

    await user.keyboard('8');
    expect(onValue).toHaveBeenLastCalledWith('48');
    expect(cells()[2]).toHaveFocus();

    expect(valuesOf()).toEqual(['4', '8', '', '', '', '']);
  });

  it('does not advance past the last cell', async () => {
    const user: UserEvent = userEvent.setup();
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="48210" onValue={onValue} />);

    await user.click(cells()[5]);
    await user.keyboard('0');

    expect(onValue).toHaveBeenLastCalledWith('482100');
    expect(cells()[5]).toHaveFocus();
  });

  it('rejects a non-digit outright — no value change, no advance', async () => {
    const user: UserEvent = userEvent.setup();
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="" onValue={onValue} />);

    await user.click(cells()[0]);
    await user.keyboard('a');

    expect(onValue).not.toHaveBeenCalled();
    expect(cells()[0]).toHaveFocus();
    expect(valuesOf()).toEqual(['', '', '', '', '', '']);
  });

  it('keeps the value dense: typing into a far empty cell appends', async () => {
    const user: UserEvent = userEvent.setup();
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="" onValue={onValue} />);

    await user.click(cells()[4]);
    await user.keyboard('7');

    // The digit lands at index 0 rather than opening a four-cell hole, so the
    // emitted string round-trips through the normaliser unchanged.
    expect(onValue).toHaveBeenLastCalledWith('7');
    expect(valuesOf()).toEqual(['7', '', '', '', '', '']);
    expect(cells()[1]).toHaveFocus();
  });

  it('overwrites a filled cell instead of appending', () => {
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="482" onValue={onValue} />);

    // `user-event` refuses to type into a `maxLength={1}` box that already holds a
    // character, even with the content selected; a browser replaces the selection
    // and emits exactly this change. The selection itself is asserted below in
    // "focus and tab order".
    fireEvent.change(cells()[1], { target: { value: '9' } });

    expect(onValue).toHaveBeenCalledWith('492');
    expect(valuesOf()).toEqual(['4', '9', '2', '', '', '']);
  });

  it('runs typed entry through the same filter as paste (both paths, one gate)', () => {
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="" onValue={onValue} />);

    // An IME or an autofill can hand a change event a whole run; it is validated
    // and distributed by the paste resolver, exactly like a keystroke.
    fireEvent.change(cells()[0], { target: { value: 'a' } });
    expect(onValue).not.toHaveBeenCalled();

    fireEvent.change(cells()[0], { target: { value: '4' } });
    expect(onValue).toHaveBeenCalledWith('4');
  });
});

describe('UiPinInput — Backspace / Delete / Arrow matrix', () => {
  it('Backspace on a FILLED cell clears it and keeps focus', async () => {
    const user: UserEvent = userEvent.setup();
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="482100" onValue={onValue} />);

    await user.click(cells()[2]);
    await user.keyboard('{Backspace}');

    expect(onValue).toHaveBeenLastCalledWith('48100');
    expect(cells()[2]).toHaveFocus();
  });

  it('Backspace on an EMPTY cell steps back and clears the previous one', async () => {
    const user: UserEvent = userEvent.setup();
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="48" onValue={onValue} />);

    await user.click(cells()[2]);
    await user.keyboard('{Backspace}');

    expect(onValue).toHaveBeenLastCalledWith('4');
    expect(cells()[1]).toHaveFocus();
  });

  it('Backspace clamps at cell 0 and reports nothing when there is nothing to clear', async () => {
    const user: UserEvent = userEvent.setup();
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="" onValue={onValue} />);

    await user.click(cells()[0]);
    await user.keyboard('{Backspace}');

    expect(onValue).not.toHaveBeenCalled();
    expect(cells()[0]).toHaveFocus();
  });

  it('Delete clears the current cell and never moves focus', async () => {
    const user: UserEvent = userEvent.setup();
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="482100" onValue={onValue} />);

    await user.click(cells()[0]);
    await user.keyboard('{Delete}');

    expect(onValue).toHaveBeenLastCalledWith('82100');
    expect(cells()[0]).toHaveFocus();
  });

  it('Delete on an empty cell reaches neither channel', async () => {
    const user: UserEvent = userEvent.setup();
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="" onValue={onValue} />);

    await user.click(cells()[3]);
    await user.keyboard('{Delete}');

    expect(onValue).not.toHaveBeenCalled();
    expect(cells()[3]).toHaveFocus();
  });

  it('arrows move focus one cell and clamp at both ends, never wrapping', async () => {
    const user: UserEvent = userEvent.setup();
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="482100" onValue={onValue} />);

    await user.click(cells()[0]);
    await user.keyboard('{ArrowLeft}');
    expect(cells()[0]).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(cells()[1]).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(cells()[0]).toHaveFocus();

    await user.click(cells()[5]);
    await user.keyboard('{ArrowRight}');
    expect(cells()[5]).toHaveFocus();

    expect(onValue).not.toHaveBeenCalled();
  });

  it('preventDefaults the four intercepted keys and nothing else', () => {
    render(pinWith({ value: '4821', onChange: noop }));
    const cell: HTMLInputElement = cells()[1];

    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].forEach((key: string): void => {
      const event: Event = createEvent.keyDown(cell, { key });
      fireEvent(cell, event);
      expect(event.defaultPrevented).toBe(true);
    });

    // Tab, Enter and printable keys stay entirely with the platform (S6).
    ['Tab', 'Enter', ' ', '4', 'ArrowUp', 'Home'].forEach((key: string): void => {
      const event: Event = createEvent.keyDown(cell, { key });
      fireEvent(cell, event);
      expect(event.defaultPrevented).toBe(false);
    });
  });
});

describe('UiPinInput — paste distribution', () => {
  it('strips, distributes and parks focus on the cell after the last one filled', () => {
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="" onValue={onValue} />);

    pasteInto(cells()[0], '48-21');

    expect(onValue).toHaveBeenCalledWith('4821');
    expect(valuesOf()).toEqual(['4', '8', '2', '1', '', '']);
    expect(cells()[4]).toHaveFocus();
  });

  it('truncates at the cell count and parks focus on the last cell', () => {
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="" onValue={onValue} />);

    pasteInto(cells()[0], '1234567890');

    expect(onValue).toHaveBeenCalledWith('123456');
    expect(cells()[5]).toHaveFocus();
  });

  it('starts the run at the focused cell', () => {
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="48" onValue={onValue} />);

    pasteInto(cells()[2], '99');

    expect(onValue).toHaveBeenCalledWith('4899');
    expect(cells()[4]).toHaveFocus();
  });

  it('always swallows the native paste, so a maxLength=1 cell cannot eat the code', () => {
    render(<ControlledPin initial="" />);
    const event: Event = pasteInto(cells()[0], '482100');
    expect(event.defaultPrevented).toBe(true);
  });

  it('changes nothing when the payload carries no digits', () => {
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="48" onValue={onValue} />);

    pasteInto(cells()[1], 'код');

    expect(onValue).not.toHaveBeenCalled();
    expect(valuesOf()).toEqual(['4', '8', '', '', '', '']);
  });

  it('validates an OS autofill drop exactly like a typed digit', () => {
    const onValue: jest.Mock = jest.fn();
    render(<ControlledPin initial="" onValue={onValue} />);

    // The OS drops the whole code onto the single `one-time-code` target; it runs
    // the same filter, the same clamp and the same distribution as a keystroke.
    pasteInto(cells()[0], 'Ваш код: 4821-00');

    expect(onValue).toHaveBeenCalledWith('482100');
    expect(valuesOf()).toEqual(['4', '8', '2', '1', '0', '0']);
  });
});

describe('UiPinInput — error contract', () => {
  it('puts aria-invalid on EVERY cell, never on the group', () => {
    render(pinWith({ error: true, helperText: HELPER_TEXT, onChange: noop }));

    cells().forEach((cell: HTMLInputElement): void => {
      expect(cell).toHaveAttribute('aria-invalid', 'true');
    });
    expect(nodesMatching('[aria-invalid="true"]')).toHaveLength(6);
    expect(group()).not.toHaveAttribute('aria-invalid');
  });

  it('omits aria-invalid entirely when the field is valid', () => {
    const { rerender } = render(pinWith({ onChange: noop }));
    expect(nodesMatching('[aria-invalid]')).toHaveLength(0);

    rerender(pinWith({ error: false, onChange: noop }));
    expect(nodesMatching('[aria-invalid]')).toHaveLength(0);
  });

  it('renders the helper text ONCE, below the group, linked from every cell', () => {
    render(pinWith({ error: true, helperText: HELPER_TEXT, onChange: noop }));

    const helper: HTMLElement = screen.getByText(HELPER_TEXT);
    // `React.useId` ids are not CSS-identifier safe, hence the attribute selector.
    expect(nodesMatching(`[id="${helper.id}"]`)).toHaveLength(1);
    // DOCUMENT_POSITION_FOLLOWING: the explanation comes after the digits.
    expect(group().compareDocumentPosition(helper) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    cells().forEach((cell: HTMLInputElement): void => {
      expect(cell).toHaveAttribute('aria-describedby', helper.id);
      expect(cell).toHaveAccessibleDescription(HELPER_TEXT);
    });
  });

  it('seeds the helper id from the consumer id when one is supplied', () => {
    render(pinWith({ id: 'sms-code', helperText: HELPER_TEXT, onChange: noop }));
    expect(screen.getByText(HELPER_TEXT)).toHaveAttribute('id', 'sms-code-helper-text');
  });

  it('renders no helper element and no aria-describedby without helperText', () => {
    render(pinWith({ error: true, onChange: noop }));

    expect(nodesMatching('[aria-describedby]')).toHaveLength(0);
    expect(nodesMatching('p')).toHaveLength(0);
  });

  // The helper text is this field's non-colour error signal, so it must render in
  // the shared field-controls treatment rather than MUI's Roboto 12px / #D32F2F.
  // jsdom's `getComputedStyle` resolves the cascade in declaration order and
  // ignores specificity, so it would report MUI's own single-class rule even
  // though the two-class descendant rule below outranks it in every real engine.
  // The emitted rule is therefore asserted directly.
  it('emits the field-controls helper-text rule scoped under the field root', () => {
    render(pinWith({ error: true, helperText: HELPER_TEXT, onChange: noop }));

    const root: string = fieldRootEmotionClass();
    const scoped: string[] = emittedRules(`${root} .MuiFormHelperText-root`);

    expect(scoped[0]).toContain('font-family: Inter');
    expect(scoped[0]).toContain('font-weight: 500');
    expect(scoped[0]).toContain('font-size: 0.875rem');
    expect(scoped[0]).toContain('line-height: 1.125rem');
    expect(scoped[0]).toContain('letter-spacing: 0');
    expect(scoped[0]).toContain('margin: 0.25rem 0 0 0');
    expect(scoped[0]).toContain(`color: ${GREY_250}`);
    // The error swap is colour-only, and it is the palette token, not MUI's red.
    expect(emittedRules(`${root} .MuiFormHelperText-root.Mui-error`)[0]).toContain(
      `color: ${ERROR_MAIN}`
    );
  });

  it('accepts a non-string helper node and still links it', () => {
    const node: React.ReactElement = <strong>Невірний код</strong>;
    render(pinWith({ error: true, helperText: node, onChange: noop }));

    const helper: HTMLElement = screen.getByText('Невірний код');
    expect(cells()[0]).toHaveAttribute('aria-describedby', helper.parentElement?.id);
  });
});

describe('UiPinInput — disabled boundary (Ruling 3)', () => {
  it('is readOnly + aria-disabled on every cell, with native disabled NEVER set', () => {
    render(pinWith({ value: '4821', disabled: true, onChange: noop }));

    cells().forEach((cell: HTMLInputElement): void => {
      expect(cell).toHaveAttribute('aria-disabled', 'true');
      expect(cell).toHaveAttribute('readonly');
      expect(cell.readOnly).toBe(true);
      expect(cell.disabled).toBe(false);
      expect(cell).toBeEnabled();
    });
    expect(nodesMatching('[disabled]')).toHaveLength(0);
  });

  it('keeps every cell focusable and keeps focus when a focused field flips', () => {
    const { rerender } = render(pinWith({ value: '4821', onChange: noop }));

    cells()[2].focus();
    expect(cells()[2]).toHaveFocus();

    // SC 2.4.3: native `disabled` would drop focus to the body here.
    rerender(pinWith({ value: '4821', disabled: true, onChange: noop }));
    expect(cells()[2]).toHaveFocus();
    expect(cells()[2]).toHaveAttribute('aria-disabled', 'true');
  });

  it('never reports a change, whichever entry path is used', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(pinWith({ value: '4821', disabled: true, onChange }));

    await user.click(cells()[4]);
    await user.keyboard('9');
    fireEvent.change(cells()[4], { target: { value: '9' } });
    pasteInto(cells()[0], '999999');
    await user.click(cells()[1]);
    await user.keyboard('{Backspace}');
    await user.keyboard('{Delete}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('still lets the arrows walk a disabled field, since it stays readable', async () => {
    const user: UserEvent = userEvent.setup();
    render(pinWith({ value: '4821', disabled: true, onChange: noop }));

    await user.click(cells()[0]);
    await user.keyboard('{ArrowRight}');

    expect(cells()[1]).toHaveFocus();
  });

  it('leaves aria-disabled off a disabled but UNWIRED field', () => {
    render(pinWith({ value: '4821', disabled: true }));

    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
    cells().forEach((cell: HTMLInputElement): void => {
      expect(cell.readOnly).toBe(true);
    });
  });
});

describe('UiPinInput — required announces once', () => {
  it('puts aria-required on the FIRST cell only', () => {
    render(pinWith({ required: true, onChange: noop }));

    expect(cells()[0]).toHaveAttribute('aria-required', 'true');
    cells()
      .slice(1)
      .forEach((cell: HTMLInputElement): void => {
        expect(cell).not.toBeRequired();
      });
    expect(nodesMatching('[aria-required]')).toHaveLength(1);
  });

  it('never sets the native required attribute, which would block a partial code', () => {
    render(pinWith({ required: true, onChange: noop }));

    cells().forEach((cell: HTMLInputElement): void => {
      expect(cell.required).toBe(false);
    });
    expect(nodesMatching('[required]')).toHaveLength(0);
  });

  it('omits aria-required entirely when the field is optional', () => {
    const { rerender } = render(pinWith({ onChange: noop }));
    expect(nodesMatching('[aria-required]')).toHaveLength(0);

    rerender(pinWith({ required: false, onChange: noop }));
    expect(nodesMatching('[aria-required]')).toHaveLength(0);
  });
});

describe('UiPinInput — static (unwired) branch', () => {
  it('renders an identical content tree, read-only, with zero widget ARIA', () => {
    render(pinWith({ value: '482100', disabled: true, required: false }));

    expect(cells()).toHaveLength(6);
    expect(valuesOf()).toEqual(['4', '8', '2', '1', '0', '0']);
    // No aria-disabled, no aria-pressed/checked, no tabindex, no button role: the
    // static branch states nothing it cannot back up (S2).
    expect(nodesMatching(WIDGET_ARIA_SELECTOR)).toHaveLength(0);
  });

  it('keeps the group naming and the per-cell names identical to the wired branch', () => {
    const { rerender } = render(pinWith({ value: '482100' }));
    const staticNames: (string | null)[] = cells().map((cell: HTMLInputElement) =>
      cell.getAttribute('aria-label')
    );

    rerender(pinWith({ value: '482100', onChange: noop }));

    expect(cells().map((cell: HTMLInputElement) => cell.getAttribute('aria-label'))).toEqual(
      staticNames
    );
    expect(group()).toHaveAccessibleName(GROUP_LABEL);
  });

  it('makes every cell readOnly, so React never sees an uncontrolled field', () => {
    render(pinWith({ value: '482100' }));

    cells().forEach((cell: HTMLInputElement): void => {
      expect(cell.readOnly).toBe(true);
      expect(cell.disabled).toBe(false);
    });
  });

  it('reports nothing on any gesture, because there is nothing to report to', async () => {
    const user: UserEvent = userEvent.setup();
    render(pinWith({ value: '4821' }));

    await user.click(cells()[0]);
    await user.keyboard('9{Backspace}{Delete}');
    pasteInto(cells()[0], '999999');

    expect(valuesOf()).toEqual(['4', '8', '2', '1', '', '']);
  });
});

describe('UiPinInput — focus and tab order', () => {
  it('keeps every cell in the natural tab order — no roving tabindex', async () => {
    const user: UserEvent = userEvent.setup();
    render(pinWith({ length: 3, onChange: noop }));

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(cells()[0]).toHaveFocus();
    await user.tab();
    expect(cells()[1]).toHaveFocus();
    await user.tab();
    expect(cells()[2]).toHaveFocus();
  });

  it('keeps a disabled field fully tabbable (readOnly, never native disabled)', async () => {
    const user: UserEvent = userEvent.setup();
    render(pinWith({ length: 2, disabled: true, onChange: noop }));

    await user.tab();
    expect(cells()[0]).toHaveFocus();
    await user.tab();
    expect(cells()[1]).toHaveFocus();
  });

  it('selects the cell content on focus, so typing overwrites', () => {
    render(pinWith({ value: '4821', onChange: noop }));

    cells()[1].focus();

    expect(cells()[1].selectionStart).toBe(0);
    expect(cells()[1].selectionEnd).toBe(1);
  });

  it('exposes exactly the cells as focusables — nothing else in the tree', () => {
    render(pinWith({ helperText: HELPER_TEXT, onChange: noop }));

    const focusable: Element[] = nodesMatching(
      'a[href], button, input, select, textarea, [tabindex], [contenteditable]'
    );
    const all: HTMLInputElement[] = cells();
    expect(focusable).toHaveLength(6);
    focusable.forEach((node: Element, index: number): void => {
      expect(node).toBe(all[index]);
    });
  });
});

describe('UiPinInput — live-region prohibition (S9)', () => {
  it('exposes none across rest, filled, error and disabled', () => {
    const { rerender } = render(pinWith({ onChange: noop }));
    expectNoLiveRegion();

    rerender(pinWith({ value: '482100', onChange: noop }));
    expectNoLiveRegion();

    rerender(pinWith({ value: '482', error: true, helperText: HELPER_TEXT, onChange: noop }));
    expectNoLiveRegion();

    rerender(pinWith({ value: '482', disabled: true, onChange: noop }));
    expectNoLiveRegion();
  });

  it('exposes none on a static field, or after a real edit', () => {
    const { rerender } = render(pinWith({ value: '482' }));
    expectNoLiveRegion();

    rerender(<ControlledPin initial="" />);
    pasteInto(cells()[0], '482100');
    expectNoLiveRegion();
  });
});

describe('UiPinInput — dev warnings', () => {
  it('stays silent for a healthy field', () => {
    render(pinWith({ value: '482', onChange: noop }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns when the group has neither `label` nor `labelledBy`', () => {
    render(pinWith({ label: undefined, onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible group name'));
  });

  it('warns for a whitespace-only name, and stays silent for `labelledBy` alone', () => {
    const { rerender } = render(pinWith({ label: '   ', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(pinWith({ label: undefined, labelledBy: 'visible', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);
  });

  it('warns for `error` without `helperText`', () => {
    render(pinWith({ error: true, onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no `helperText`'));
  });

  it('counts blank helper text as missing, so the error is never colour-only', () => {
    render(pinWith({ error: true, helperText: '   ', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no `helperText`'));
  });

  it('stays silent for `error` with a real helper node', () => {
    const { rerender } = render(pinWith({ error: true, helperText: HELPER_TEXT, onChange: noop }));
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(pinWith({ error: true, helperText: <span>Помилка</span>, onChange: noop }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns for a value carrying non-digits, which it repairs rather than rejects', () => {
    render(pinWith({ value: '48-21', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('non-digits or longer'));
  });

  it('warns for a value longer than the cell count', () => {
    render(pinWith({ value: '48210099', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('non-digits or longer'));
  });

  it('warns for a length below one', () => {
    render(pinWith({ length: 0, onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('`length` below 1'));
  });

  it('warns for a fractional or non-finite length', () => {
    render(pinWith({ length: 4.5, onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('`length` below 1'));
  });

  it('reports the most structural misconfiguration first, one per render', () => {
    render(pinWith({ label: undefined, error: true, value: 'abc', length: 0, onChange: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible group name'));
  });

  it('warns once per warning STATE, not once per render', () => {
    const { rerender } = render(pinWith({ label: '', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // A blank name and an absent one are ONE state; the console is not a render log.
    rerender(pinWith({ label: '   ', onChange: noop }));
    rerender(pinWith({ label: undefined, value: '', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // A change INTO a different warning state does re-report.
    rerender(pinWith({ value: 'abc', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(2);
    expect(warn.spy).toHaveBeenLastCalledWith(expect.stringContaining('non-digits or longer'));
  });

  it('emits nothing in production, for any of the four warnings', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { rerender } = render(pinWith({ label: undefined, onChange: noop }));
      rerender(pinWith({ error: true, onChange: noop }));
      rerender(pinWith({ value: 'abc', onChange: noop }));
      rerender(pinWith({ length: 0, onChange: noop }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('pinInputWarning — first-applicable selection (pure)', () => {
  it('returns null for a well configured field', () => {
    expect(pinInputWarning({ label: GROUP_LABEL })).toBeNull();
    expect(pinInputWarning({ labelledBy: 'heading', value: '482100', length: 6 })).toBeNull();
  });

  it('ranks name over helper over value over length', () => {
    const all: UiPinInputProps = {
      error: true,
      value: 'abc',
      length: 0,
    };
    expect(pinInputWarning(all)).toContain('no accessible group name');
    expect(pinInputWarning({ ...all, label: GROUP_LABEL })).toContain('no `helperText`');
    expect(pinInputWarning({ ...all, label: GROUP_LABEL, helperText: 'x' })).toContain(
      'non-digits or longer'
    );
    expect(
      pinInputWarning({ label: GROUP_LABEL, helperText: 'x', error: true, length: 0 })
    ).toContain('`length` below 1');
  });

  it('treats a non-string helper node as present and a blank string as missing', () => {
    const named: UiPinInputProps = { label: GROUP_LABEL, error: true };
    expect(pinInputWarning({ ...named, helperText: '' })).toContain('no `helperText`');
    expect(pinInputWarning({ ...named, helperText: 0 })).toBeNull();
    expect(pinInputWarning({ ...named, helperText: null })).toContain('no `helperText`');
  });

  it('says nothing about a length that was never supplied', () => {
    expect(pinInputWarning({ label: GROUP_LABEL, length: undefined })).toBeNull();
    expect(pinInputWarning({ label: GROUP_LABEL, length: 6 })).toBeNull();
    expect(pinInputWarning({ label: GROUP_LABEL, length: Number.NaN })).toContain(
      '`length` below 1'
    );
  });

  it('says nothing about an absent value', () => {
    expect(pinInputWarning({ label: GROUP_LABEL, value: undefined })).toBeNull();
    expect(pinInputWarning({ label: GROUP_LABEL, value: '' })).toBeNull();
  });
});

// The field root is the `FormControl` that wraps the group and the helper text —
// the element `pinInputSx` (and therefore the consumer `sx`) lands on.
function fieldRoot(): Element {
  return nodesMatching('.MuiFormControl-root')[0];
}

describe('UiPinInput — consumer sx', () => {
  it('merges an object sx last onto the field root', () => {
    render(pinWith({ sx: { marginTop: '1rem' }, onChange: noop }));
    expect(fieldRoot()).toHaveStyle({ marginTop: '1rem' });
  });

  it('merges array sx layers', () => {
    render(pinWith({ sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }], onChange: noop }));

    const root: Element = fieldRoot();
    expect(root).toHaveStyle({ marginTop: '1rem' });
    expect(root).toHaveStyle({ paddingTop: '2rem' });
  });

  it('keeps the inline-flex column base under the consumer layers', () => {
    render(pinWith({ sx: { marginTop: '1rem' }, onChange: noop }));
    expect(fieldRoot()).toHaveStyle({ display: 'inline-flex', flexDirection: 'column' });
  });
});

describe('pinInputSx / pinGroupSx — layout assembly (pure, mutation-killing)', () => {
  it('lays the group out as a flex row at the ruled 12px gap', () => {
    expect(pinGroupSx).toEqual({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
    });
  });

  it('stacks the group and the helper text in an inline column', () => {
    const layers: StyleObject[] = pinInputSx(undefined) as unknown as StyleObject[];

    expect(layers).toHaveLength(2);
    expect(layers[0]).toMatchObject({
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    });
    expect(layers[1]).toEqual({});
  });

  // The field-controls helper-text recipe, inlined on the root because this
  // control mounts no ThemeProvider. Pinned exactly: without it the message
  // falls back to MUI's Roboto 12px and the off-palette #D32F2F error red.
  it('carries the field-controls helper-text treatment on the root', () => {
    const layers: StyleObject[] = pinInputSx(undefined) as unknown as StyleObject[];
    const base: StyleObject = layers[0];

    expect(base[HELPER_TEXT_KEY]).toEqual({
      margin: '0.25rem 0 0 0',
      fontFamily: 'Inter',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
      letterSpacing: 0,
      color: GREY_250,
      '&.Mui-error': { color: ERROR_MAIN },
    });
  });

  it('appends the consumer sx after the base, in object and array forms', () => {
    const object: StyleObject[] = pinInputSx({ marginTop: '1rem' }) as unknown as StyleObject[];
    expect(object).toHaveLength(2);
    expect(object[1]).toEqual({ marginTop: '1rem' });

    const array: StyleObject[] = pinInputSx([
      { marginTop: '1rem' },
      { paddingTop: '2rem' },
    ]) as unknown as StyleObject[];
    expect(array).toHaveLength(3);
    expect(array[1]).toEqual({ marginTop: '1rem' });
    expect(array[2]).toEqual({ paddingTop: '2rem' });
  });
});

describe('pinCellSx — the 64x86 master (pure, mutation-killing)', () => {
  it('pins the invariant cell box to the Figma measurements', () => {
    const cell: StyleObject = cellStyle();

    expect(cell.width).toBe('4rem');
    // A `minHeight`, never a `height`, so the box may grow at 200% zoom instead
    // of shearing the glyph (SC 1.4.4).
    expect(cell.minHeight).toBe('5.375rem');
    expect(cell.height).toBeUndefined();
    expect(cell.borderRadius).toBe('0.75rem');
    expect(cell.boxSizing).toBe('border-box');
    expect(cell.padding).toBe(0);
    expect(cell.margin).toBe(0);
    expect(cell.flexShrink).toBe(0);
    expect(cell.appearance).toBe('none');
    expect(cell.cursor).toBe('text');
  });

  it('pins the digit typography, identical in all four masters', () => {
    const cell: StyleObject = cellStyle();

    expect(cell.fontFamily).toBe("'Golos Text'");
    expect(cell.fontWeight).toBe(700);
    expect(cell.fontSize).toBe('1.375rem');
    expect(cell.lineHeight).toBe('1.625rem');
    expect(cell.letterSpacing).toBe(0);
    expect(cell.textAlign).toBe('center');
  });

  it('paints the entered digit dark and the placeholder grey', () => {
    const cell: StyleObject = cellStyle();

    expect(cell.color).toBe(DARK_PRIMARY);
    expect(cell.backgroundColor).toBe(WHITE);
    expect(cell['&::placeholder']).toEqual({ color: GREY_400, opacity: 1 });
  });

  it('tints the native caret rather than painting a decorative bar', () => {
    expect(cellStyle().caretColor).toBe(PRIMARY);
    // A painted 2x26 span on top of the native caret would double-draw it.
    expect(JSON.stringify(cellStyle())).not.toMatch(/::(before|after)/);
  });

  it('keeps the border a constant 1px in every state, swapping only its colour', () => {
    const cell: StyleObject = cellStyle();

    expect(cell.border).toBe(`1px solid ${BRAND_GRAY}`);
    expect(ruleAt(HOVER_KEY)).toEqual({ borderColor: GREY_400 });
    // Figma deletes the disabled stroke; keeping it and repainting it in the fill
    // is pixel-identical and holds the geometry still (the no-jitter law).
    expect(ruleAt(DISABLED_KEY).borderColor).toBe(GREY_500);
    expect(ruleAt(DISABLED_KEY).border).toBeUndefined();
    expect(ruleAt(DISABLED_KEY).borderWidth).toBeUndefined();
    expect(ruleAt(HOVER_KEY).border).toBeUndefined();
    expect(ruleAt(HOVER_KEY).borderWidth).toBeUndefined();
  });

  it('gates hover on the aria-disabled boundary, with no bare :hover rule', () => {
    expect(keysMatching(cellStyle(), ':hover')).toEqual([HOVER_KEY]);
    expect(cellStyle()['&:hover']).toBeUndefined();
  });

  it('suppresses the caret, the fill and the pointer on a disabled cell', () => {
    expect(ruleAt(DISABLED_KEY)).toEqual({
      backgroundColor: GREY_500,
      borderColor: GREY_500,
      caretColor: 'transparent',
      cursor: 'default',
    });
  });

  it('paints the Figma active shadow on focus, gated on the disabled boundary', () => {
    expect(PIN_FOCUS_SHADOW).toBe('0 7px 12px rgba(76, 90, 126, 0.15)');
    expect(ruleAt(ACTIVE_KEY)).toEqual({ boxShadow: PIN_FOCUS_SHADOW });
  });

  it('ships the ring as a two-selector list carrying BOTH channels', () => {
    // A bare `&:focus-visible` is (0,2,0) while hover is (0,3,0), so on a cell
    // that is focused AND hovered the hover rule would win. The second selector
    // repeats hover's negation to tie it; declared later, it wins. The bare one
    // still covers the disabled cell, whose ring is never suppressed.
    expect(keysMatching(cellStyle(), ':focus-visible')).toEqual([RING_KEY]);
    expect(cellStyle()['&:focus-visible']).toBeUndefined();
    expect(ruleAt(RING_KEY)).toEqual({
      outline: 'none',
      boxShadow: `${FOCUS_RING}, ${PIN_FOCUS_SHADOW}`,
    });
  });

  it('declares the ring after hover, disabled and the active shadow', () => {
    const keys: string[] = Object.keys(cellStyle());

    expect(keys.indexOf(HOVER_KEY)).toBeGreaterThanOrEqual(0);
    expect(keys.indexOf(DISABLED_KEY)).toBeGreaterThan(keys.indexOf(HOVER_KEY));
    expect(keys.indexOf(ACTIVE_KEY)).toBeGreaterThan(keys.indexOf(DISABLED_KEY));
    expect(keys.indexOf(RING_KEY)).toBeGreaterThan(keys.indexOf(ACTIVE_KEY));
  });

  it('re-expresses the ring as an outline under forced colors', () => {
    expect(cellStyle()[FORCED_COLORS_KEY]).toEqual({
      '&:focus-visible': { outline: '2px solid Highlight', outlineOffset: '-2px' },
    });
    // `outline: none` lives ONLY inside the ring rule.
    expect(cellStyle().outline).toBeUndefined();
  });

  it('ships no transition and no animation, so nothing can move (S9)', () => {
    const serialised: string = JSON.stringify([cellStyle(), pinGroupSx, pinInputSx(undefined)]);

    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
  });

  it('exposes a stable class hook for the showcase board', () => {
    expect(PIN_CELL_CLASS).toBe('ui-pin-input__cell');
  });
});

describe('usePinInput — view model', () => {
  function modelFor(props: UiPinInputProps): PinInputModel {
    return renderHook((): PinInputModel => usePinInput(props)).result.current;
  }

  it('resolves the axes from the coerced props', () => {
    const axes: PinAxes = modelFor({ label: GROUP_LABEL, value: '48-21', length: 4 }).axes;
    expect(axes).toEqual({ length: 4, value: '4821', interactive: false, disabled: false });
  });

  it('marks an unwired field readOnly with no aria-disabled', () => {
    const model: PinInputModel = modelFor({ label: GROUP_LABEL });

    expect(model.axes.interactive).toBe(false);
    expect(model.cell.readOnly).toBe(true);
    expect(model.cell.ariaDisabled).toBeUndefined();
  });

  it('marks a wired, enabled field editable', () => {
    const model: PinInputModel = modelFor({ label: GROUP_LABEL, onChange: noop });

    expect(model.cell.readOnly).toBe(false);
    expect(model.cell.ariaDisabled).toBeUndefined();
  });

  it('marks a wired, disabled field readOnly AND aria-disabled', () => {
    const model: PinInputModel = modelFor({ label: GROUP_LABEL, onChange: noop, disabled: true });

    expect(model.cell.readOnly).toBe(true);
    expect(model.cell.ariaDisabled).toBe(true);
  });

  it('exposes error and required as true-or-absent, never false', () => {
    const off: PinInputModel = modelFor({ label: GROUP_LABEL, error: false, required: false });
    expect(off.cell.ariaInvalid).toBeUndefined();
    expect(off.cell.ariaRequired).toBeUndefined();

    const on: PinInputModel = modelFor({
      label: GROUP_LABEL,
      error: true,
      required: true,
      helperText: HELPER_TEXT,
    });
    expect(on.cell.ariaInvalid).toBe(true);
    expect(on.cell.ariaRequired).toBe(true);
  });

  it('derives the helper id from the consumer id, or from useId when absent', () => {
    expect(modelFor({ label: GROUP_LABEL, helperText: HELPER_TEXT, id: 'code' }).helperTextId).toBe(
      'code-helper-text'
    );
    expect(modelFor({ label: GROUP_LABEL, helperText: HELPER_TEXT }).helperTextId).toMatch(
      /-helper-text$/
    );
  });

  it('drops the helper id and describedby when there is no helper text', () => {
    const model: PinInputModel = modelFor({ label: GROUP_LABEL });

    expect(model.helperTextId).toBeUndefined();
    expect(model.cell.describedBy).toBeUndefined();
  });

  it('lets labelledBy win, and falls back to label when it is blank', () => {
    expect(modelFor({ label: GROUP_LABEL, labelledBy: 'heading' }).group).toEqual({
      label: undefined,
      labelledBy: 'heading',
    });
    expect(modelFor({ label: GROUP_LABEL, labelledBy: '  ' }).group).toEqual({
      label: GROUP_LABEL,
      labelledBy: undefined,
    });
    expect(modelFor({ labelledBy: undefined }).group).toEqual({
      label: undefined,
      labelledBy: undefined,
    });
  });

  it('keeps the cell setter stable across renders, so cells never re-attach', () => {
    const { result, rerender } = renderHook(
      (): PinInputModel => usePinInput({ label: GROUP_LABEL, onChange: noop })
    );
    const first: React.RefCallback<HTMLInputElement> = result.current.setCell(0);

    rerender();

    expect(result.current.setCell(0)).toBe(first);
    expect(result.current.setCell(1)).not.toBe(first);
  });
});

describe('usePinCellRefs — the cell registry', () => {
  it('memoises one callback ref per index and keeps it across renders', () => {
    const { result, rerender } = renderHook((): PinCellRefs => usePinCellRefs());
    const zero: React.RefCallback<HTMLInputElement> = result.current.setCell(0);

    expect(result.current.setCell(0)).toBe(zero);
    rerender();
    expect(result.current.setCell(0)).toBe(zero);
    expect(result.current.setCell(1)).not.toBe(zero);
  });

  it('focuses a registered node', () => {
    const { result } = renderHook((): PinCellRefs => usePinCellRefs());
    const node: HTMLInputElement = document.createElement('input');
    document.body.appendChild(node);

    result.current.setCell(2)(node);
    result.current.focusCell(2);

    expect(node).toHaveFocus();
    node.remove();
  });

  it('no-ops silently for an index that has no node (a detached or unmounted cell)', () => {
    const { result } = renderHook((): PinCellRefs => usePinCellRefs());
    const node: HTMLInputElement = document.createElement('input');

    result.current.setCell(0)(node);
    result.current.setCell(0)(null);

    expect(() => result.current.focusCell(0)).not.toThrow();
    expect(() => result.current.focusCell(9)).not.toThrow();
  });
});

describe('buildPinHandlers — the gate lives in the model, never in the DOM', () => {
  const ENABLED_AXES: PinAxes = {
    length: 6,
    value: '4821',
    interactive: true,
    disabled: false,
  };

  function keyEventFor(key: string, prevented: string[]): React.KeyboardEvent<HTMLInputElement> {
    return {
      key,
      preventDefault: (): void => {
        prevented.push(key);
      },
    } as unknown as React.KeyboardEvent<HTMLInputElement>;
  }

  function clipboardEventFor(text: string): React.ClipboardEvent<HTMLInputElement> {
    return {
      preventDefault: (): void => undefined,
      clipboardData: { getData: (): string => text },
    } as unknown as React.ClipboardEvent<HTMLInputElement>;
  }

  it('reports a typed digit and moves focus', () => {
    const onChange: jest.Mock = jest.fn();
    const focusCell: jest.Mock = jest.fn();
    const handlers: PinCellHandlers = buildPinHandlers({ axes: ENABLED_AXES, focusCell, onChange });

    handlers.onChange(4, '0');

    expect(onChange).toHaveBeenCalledWith('48210');
    expect(focusCell).toHaveBeenCalledWith(5);
  });

  it('rejects a keystroke carrying no digit before touching either channel', () => {
    const onChange: jest.Mock = jest.fn();
    const focusCell: jest.Mock = jest.fn();
    const handlers: PinCellHandlers = buildPinHandlers({ axes: ENABLED_AXES, focusCell, onChange });

    handlers.onChange(0, 'a');
    handlers.onChange(0, '');

    expect(onChange).not.toHaveBeenCalled();
    expect(focusCell).not.toHaveBeenCalled();
  });

  it('ignores a key it does not own, without preventing its default', () => {
    const prevented: string[] = [];
    const onChange: jest.Mock = jest.fn();
    const focusCell: jest.Mock = jest.fn();
    const handlers: PinCellHandlers = buildPinHandlers({ axes: ENABLED_AXES, focusCell, onChange });

    handlers.onKeyDown(0, keyEventFor('Enter', prevented));
    handlers.onKeyDown(0, keyEventFor('4', prevented));

    expect(prevented).toEqual([]);
    expect(onChange).not.toHaveBeenCalled();
    expect(focusCell).not.toHaveBeenCalled();
  });

  it('prevents the default for a key it owns and applies the outcome', () => {
    const prevented: string[] = [];
    const onChange: jest.Mock = jest.fn();
    const focusCell: jest.Mock = jest.fn();
    const handlers: PinCellHandlers = buildPinHandlers({ axes: ENABLED_AXES, focusCell, onChange });

    handlers.onKeyDown(1, keyEventFor('Backspace', prevented));

    expect(prevented).toEqual(['Backspace']);
    expect(onChange).toHaveBeenCalledWith('421');
    expect(focusCell).not.toHaveBeenCalled();
  });

  it('moves focus without reporting a value for an arrow key', () => {
    const prevented: string[] = [];
    const onChange: jest.Mock = jest.fn();
    const focusCell: jest.Mock = jest.fn();
    const handlers: PinCellHandlers = buildPinHandlers({ axes: ENABLED_AXES, focusCell, onChange });

    handlers.onKeyDown(1, keyEventFor('ArrowRight', prevented));

    expect(onChange).not.toHaveBeenCalled();
    expect(focusCell).toHaveBeenCalledWith(2);
  });

  it('declines the callback when the outcome equals the current value', () => {
    const onChange: jest.Mock = jest.fn();
    const focusCell: jest.Mock = jest.fn();
    const handlers: PinCellHandlers = buildPinHandlers({ axes: ENABLED_AXES, focusCell, onChange });

    // Backspace on an empty cell whose predecessor is empty too: focus steps back,
    // the value is untouched, so the consumer hears nothing.
    handlers.onKeyDown(5, keyEventFor('Backspace', []));

    expect(onChange).not.toHaveBeenCalled();
    expect(focusCell).toHaveBeenCalledWith(4);
  });

  it('distributes a paste and swallows the native event', () => {
    const onChange: jest.Mock = jest.fn();
    const focusCell: jest.Mock = jest.fn();
    const handlers: PinCellHandlers = buildPinHandlers({
      axes: { length: 6, value: '', interactive: true, disabled: false },
      focusCell,
      onChange,
    });

    handlers.onPaste(0, clipboardEventFor('4-8-2-1-0-0-9'));

    expect(onChange).toHaveBeenCalledWith('482100');
    expect(focusCell).toHaveBeenCalledWith(5);
  });

  it('withholds the callback entirely from a disabled field, but still moves focus', () => {
    const onChange: jest.Mock = jest.fn();
    const focusCell: jest.Mock = jest.fn();
    const handlers: PinCellHandlers = buildPinHandlers({
      axes: { length: 6, value: '4821', interactive: true, disabled: true },
      focusCell,
      onChange,
    });

    handlers.onChange(0, '9');
    handlers.onKeyDown(1, keyEventFor('Backspace', []));
    handlers.onPaste(0, clipboardEventFor('999999'));

    expect(onChange).not.toHaveBeenCalled();
    expect(focusCell).toHaveBeenCalled();
  });

  it('withholds the callback from a static field, whose axes are non-interactive', () => {
    const onChange: jest.Mock = jest.fn();
    const focusCell: jest.Mock = jest.fn();
    const handlers: PinCellHandlers = buildPinHandlers({
      axes: { length: 6, value: '4821', interactive: false, disabled: false },
      focusCell,
      onChange,
    });

    handlers.onChange(0, '9');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('tolerates a wired field whose onChange is undefined at the boundary', () => {
    const focusCell: jest.Mock = jest.fn();
    const handlers: PinCellHandlers = buildPinHandlers({
      axes: ENABLED_AXES,
      focusCell,
      onChange: undefined,
    });

    expect(() => handlers.onChange(4, '0')).not.toThrow();
    expect(focusCell).toHaveBeenCalledWith(5);
  });
});
