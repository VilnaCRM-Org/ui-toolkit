import type React from 'react';

import { pinEventIntent, resolvePinKey, type PinKeyIntent } from './pin-keyboard';
import resolvePinEntry from './pin-paste';
import { digitsOnly, type PinAxes, type PinCellContext, type PinOutcome } from './pin-value';

/** The three DOM handlers every cell wires, each taking its own cell index. */
export interface PinCellHandlers {
  onChange: (index: number, raw: string) => void;
  onKeyDown: (index: number, event: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (index: number, event: React.ClipboardEvent<HTMLInputElement>) => void;
}

export interface PinHandlerInput {
  axes: PinAxes;
  focusCell: (index: number) => void;
  onChange: ((next: string) => void) | undefined;
}

// Everything an edit is resolved against, plus the two sinks it may reach. The
// `onChange` here is ALREADY gated — the disabled and static branches leave it
// undefined — so no handler below re-checks the boundary (the `makeActivate`
// precedent: activation is gated in the model, never in the DOM).
interface PinContext {
  value: string;
  length: number;
  focusCell: (index: number) => void;
  onChange: ((next: string) => void) | undefined;
}

// The two channels an outcome can touch, kept apart on purpose: the value goes
// back to the consumer as a REQUEST (a declined edit simply re-renders the old
// value), while focus is moved locally, because the caret is DOM state the
// consumer neither owns nor can express. A no-op edit reaches neither.
function applyPinOutcome(ctx: Readonly<PinContext>, outcome: PinOutcome): void {
  if (outcome.value != null && outcome.value !== ctx.value) {
    ctx.onChange?.(outcome.value);
  }
  if (outcome.focusIndex != null) {
    ctx.focusCell(outcome.focusIndex);
  }
}

/** The outcome of an edit that must reach neither channel. */
const NO_CHANGE: PinOutcome = { value: null, focusIndex: null };

// A change event is not always an insertion. A cut, a drag-out and any deletion
// an IME or a soft keyboard performs itself never raise `Backspace` — they arrive
// here as the EMPTY string, and discarding one would re-paint the digit the user
// just removed. `''` is therefore the Delete outcome (clear this cell, keep
// focus); every other payload carrying no digit is still rejected outright.
function resolveCellChange(raw: string, ctx: Readonly<PinCellContext>): PinOutcome {
  if (raw === '') {
    return resolvePinKey('delete', ctx);
  }
  return digitsOnly(raw) === '' ? NO_CHANGE : resolvePinEntry(raw, ctx);
}

// Typed entry runs the PASTE resolver: one typed digit is a one-character run,
// so a keystroke, a clipboard drop and an OS one-time-code autofill are all
// validated and distributed by the same code (the 2.4A lesson).
function makeCellChange(ctx: Readonly<PinContext>): PinCellHandlers['onChange'] {
  return (index: number, raw: string): void => {
    applyPinOutcome(ctx, resolveCellChange(raw, { value: ctx.value, index, length: ctx.length }));
  };
}

// Only the four editing/navigation keys are intercepted, and each one calls
// `preventDefault()` so the native caret does not also move under us. Every other
// key — digits, Tab, Enter, Space — is left entirely to the platform (S6), and so
// is every Alt/Ctrl/Meta combination, which belongs to the browser or the OS.
function makeCellKeyDown(ctx: Readonly<PinContext>): PinCellHandlers['onKeyDown'] {
  return (index: number, event: React.KeyboardEvent<HTMLInputElement>): void => {
    const intent: PinKeyIntent | null = pinEventIntent(event);
    if (intent == null) {
      return;
    }
    event.preventDefault();
    applyPinOutcome(ctx, resolvePinKey(intent, { value: ctx.value, index, length: ctx.length }));
  };
}

// The paste is always swallowed: a `maxLength={1}` cell would otherwise keep the
// first character and drop the rest of the code on the floor.
function makeCellPaste(ctx: Readonly<PinContext>): PinCellHandlers['onPaste'] {
  return (index: number, event: React.ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const raw: string = event.clipboardData.getData('text');
    applyPinOutcome(ctx, resolvePinEntry(raw, { value: ctx.value, index, length: ctx.length }));
  };
}

/** Binds the three handlers to one render's axes; the disabled gate lives here. */
export function buildPinHandlers(input: Readonly<PinHandlerInput>): PinCellHandlers {
  const { axes } = input;
  const ctx: PinContext = {
    value: axes.value,
    length: axes.length,
    focusCell: input.focusCell,
    onChange: axes.interactive && !axes.disabled ? input.onChange : undefined,
  };
  return {
    onChange: makeCellChange(ctx),
    onKeyDown: makeCellKeyDown(ctx),
    onPaste: makeCellPaste(ctx),
  };
}
