// The value vocabulary every other module in UiPinInput speaks: normalisation,
// clamping and the dense-write primitives. Pure string maths, no React, no DOM —
// which is what lets the keyboard and paste tables stay declarative.
import type { UiPinInputProps } from './types';

/** Six cells is the OTP norm; the Figma master ships one cell and no group. */
export const DEFAULT_PIN_LENGTH: number = 6;

const NON_DIGIT: RegExp = /\D/g;

/**
 * Strips everything that is not `0-9`. BOTH entry paths — typed keystrokes and
 * paste/OS autofill — run through this one filter, so a value can never be
 * admitted by one route that the other would reject (the 2.4A lesson).
 */
export function digitsOnly(raw: string): string {
  return raw.replace(NON_DIGIT, '');
}

/**
 * Cell count: a whole number of at least 1. A fractional or non-finite `length`
 * falls back to the default rather than rendering an impossible grid; both that
 * and `length < 1` dev-warn from the warnings module.
 */
export function normalizeLength(length: number | undefined): number {
  const requested: number = Math.floor(length ?? DEFAULT_PIN_LENGTH);
  return Number.isFinite(requested) ? Math.max(1, requested) : DEFAULT_PIN_LENGTH;
}

/** The always-controlled value: nullish becomes `''`, digits only, clamped. */
export function normalizeValue(value: string | undefined, length: number): string {
  return digitsOnly(value ?? '').slice(0, length);
}

/** The digit painted in a cell, or `''` when that cell is empty. */
export function charAt(value: string, index: number): string {
  return value.charAt(index);
}

/**
 * The position a write aimed at `index` really lands on. The value is kept DENSE
 * — clicking cell 5 of an empty field and typing appends at the end rather than
 * opening a hole — so every emitted string is a digits-only prefix that
 * round-trips through {@link normalizeValue} unchanged.
 */
export function writeIndex(value: string, index: number): number {
  return Math.min(index, value.length);
}

export interface PinWrite {
  value: string;
  /** Already resolved through {@link writeIndex}. */
  index: number;
  /** One typed digit, or a whole pasted run — the same write either way. */
  digits: string;
}

/**
 * Overwrites `digits.length` cells starting at `index`. This is the file plan's
 * `withDigitAt` generalised to a RUN: a typed digit is simply a one-character
 * run, which is how typed entry and paste stay on a single code path.
 */
export function withDigitsAt(write: Readonly<PinWrite>): string {
  const { value, index, digits } = write;
  return `${value.slice(0, index)}${digits}${value.slice(index + digits.length)}`;
}

/** Removes the digit at `index`, closing the gap so the value stays dense. */
export function withoutDigitAt(value: string, index: number): string {
  return `${value.slice(0, index)}${value.slice(index + 1)}`;
}

/** Which cell an edit happened in, plus the axes it is resolved against. */
export interface PinCellContext {
  value: string;
  index: number;
  length: number;
}

/**
 * What an edit asks the field to do. `value: null` means "the value does not
 * change" and `focusIndex: null` means "leave focus alone" — both are real
 * outcomes (an arrow key moves focus only; Delete edits only), and neither may
 * be conflated with an empty string or cell 0.
 */
export interface PinOutcome {
  value: string | null;
  focusIndex: number | null;
}

/** The always-controlled axes, resolved once per render and shared by every cell. */
export interface PinAxes {
  length: number;
  value: string;
  /** True when `onChange` is present — the cells accept input. */
  interactive: boolean;
  disabled: boolean;
}

/** Coerces the four props that decide what the cells paint and whether they edit. */
export function pinAxes(props: UiPinInputProps): PinAxes {
  const length: number = normalizeLength(props.length);
  return {
    length,
    value: normalizeValue(props.value, length),
    interactive: props.onChange != null,
    disabled: props.disabled ?? false,
  };
}
