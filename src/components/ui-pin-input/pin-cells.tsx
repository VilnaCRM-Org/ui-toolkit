import { Box } from '@mui/material';
import React from 'react';

import type { PinCellHandlers } from './pin-cell-handlers';
import { PIN_CELL_CLASS, pinCellSx } from './styles';
import type { UiPinCellLabel } from './types';
import type { PinCellAria, PinInputModel } from './use-pin-input';

// `type="text"` with a numeric `inputMode` and this pattern, NEVER `type="number"`
// (spinner buttons, scroll-wheel mutation and a locale-dependent value inside a
// one-character box). The pattern is what puts the numeric keypad on iOS.
const PIN_PATTERN: string = '[0-9]*';

// The design paints the same grey "0" in every master, including disabled, so it
// is a placeholder rather than content. `aria-label` names each cell, so the
// placeholder never becomes the accessible name.
const PIN_PLACEHOLDER: string = '0';

// One autofill target for the whole field: the OS drops the entire code into the
// first cell and the shared paste path distributes it. Repeating the token on
// every cell would offer N competing targets for one value.
const OTP_AUTOCOMPLETE: string = 'one-time-code';
const NO_AUTOCOMPLETE: string = 'off';

/** Ukrainian default (Ruling 7); 1-based, so it matches what a user counts. */
function defaultCellLabel(index: number, length: number): string {
  return `Цифра ${index} з ${length}`;
}

// Selecting on focus is what makes typing OVERWRITE: without it a click into a
// filled cell would leave the caret beside the digit and `maxLength={1}` would
// silently swallow the keystroke. Programmatic and user focus behave identically
// because the selection lives here rather than in the focus mover.
function selectCellOnFocus(event: React.FocusEvent<HTMLInputElement>): void {
  event.currentTarget.select();
}

interface BoundCellHandlers {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
}

// The cell index is bound outside the JSX rather than through inline arrows, so
// the render stays declarative and each handler keeps an explicit event type.
function bindCellHandlers(index: number, handlers: PinCellHandlers): BoundCellHandlers {
  return {
    onChange: (event): void => handlers.onChange(index, event.target.value),
    onKeyDown: (event): void => handlers.onKeyDown(index, event),
    onPaste: (event): void => handlers.onPaste(index, event),
  };
}

/** Everything one cell renders, resolved before the JSX so the view stays flat. */
interface ResolvedPinCell {
  digit: string;
  label: string;
  autoComplete: string;
  /** Required announces ONCE, on the first cell, not N times. */
  ariaRequired: true | undefined;
  aria: PinCellAria;
  handlers: BoundCellHandlers;
  setCell: React.RefCallback<HTMLInputElement>;
}

interface CellFactory {
  model: PinInputModel;
  label: UiPinCellLabel;
}

function buildCellProps(
  factory: Readonly<CellFactory>,
  digit: string,
  index: number
): ResolvedPinCell {
  const { model } = factory;
  const first: boolean = index === 0;
  return {
    digit: digit.trim(),
    label: factory.label(index + 1, model.axes.length),
    autoComplete: first ? OTP_AUTOCOMPLETE : NO_AUTOCOMPLETE,
    ariaRequired: first ? model.cell.ariaRequired : undefined,
    aria: model.cell,
    handlers: bindCellHandlers(index, model.handlers),
    setCell: model.setCell(index),
  };
}

interface PinCellProps {
  cell: ResolvedPinCell;
}

// One digit cell. A disabled cell is `readOnly` + `aria-disabled`, never natively
// disabled, so keyboard focus is never dropped when a focused field flips
// disabled (SC 2.4.3). `aria-invalid` and `aria-describedby` are on EVERY cell:
// a user who lands on cell 4 must still hear that the code is wrong and why.
function PinCell({ cell }: Readonly<PinCellProps>): React.ReactElement {
  const { aria, handlers } = cell;
  return (
    <Box
      component="input"
      type="text"
      inputMode="numeric"
      pattern={PIN_PATTERN}
      maxLength={1}
      autoComplete={cell.autoComplete}
      className={PIN_CELL_CLASS}
      placeholder={PIN_PLACEHOLDER}
      value={cell.digit}
      readOnly={aria.readOnly}
      aria-label={cell.label}
      aria-disabled={aria.ariaDisabled}
      aria-invalid={aria.ariaInvalid}
      aria-required={cell.ariaRequired}
      aria-describedby={aria.describedBy}
      onChange={handlers.onChange}
      onKeyDown={handlers.onKeyDown}
      onPaste={handlers.onPaste}
      onFocus={selectCellOnFocus}
      ref={cell.setCell}
      sx={pinCellSx}
    />
  );
}

export interface PinCellsProps {
  model: PinInputModel;
  cellLabel: UiPinCellLabel | undefined;
}

/**
 * The N cells of the group. The value is padded to the cell count and split, so
 * cell `i` always paints `value.charAt(i)` and an empty cell falls back to the
 * placeholder — one source of truth for what is on screen, and no per-cell state
 * anywhere.
 */
export function PinCells({ model, cellLabel }: Readonly<PinCellsProps>): React.ReactElement {
  const factory: CellFactory = { model, label: cellLabel ?? defaultCellLabel };
  return (
    <>
      {model.axes.value
        .padEnd(model.axes.length)
        .split('')
        .map((digit: string, index: number) => (
          <PinCell key={index} cell={buildCellProps(factory, digit, index)} />
        ))}
    </>
  );
}
