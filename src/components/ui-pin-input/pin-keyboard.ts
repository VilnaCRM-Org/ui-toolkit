import { charAt, withoutDigitAt, type PinCellContext, type PinOutcome } from './pin-value';

// The editing keys the cells handle themselves, as a TABLE rather than an `if`
// ladder: one lookup, one dispatch, and every branch stays inside the per-function
// exit budget. Everything else — digits, Tab, Enter, modifier combinations — falls
// through untouched, so the native input keeps its own behaviour and no manual
// Enter/Space handler exists anywhere in this component (S6).
export type PinKeyIntent = 'backspace' | 'delete' | 'prev' | 'next';

// A `Map`, not an object literal: `event.key` is an arbitrary string from the UA
// (or from a synthetic event), and an object lookup resolves an INHERITED member
// — `toString`, `constructor`, `valueOf` — to a Function, handing that non-intent
// to `resolvePinKey`, which then throws inside the keydown handler.
const KEY_INTENTS: ReadonlyMap<string, PinKeyIntent> = new Map<string, PinKeyIntent>([
  ['Backspace', 'backspace'],
  ['Delete', 'delete'],
  ['ArrowLeft', 'prev'],
  ['ArrowRight', 'next'],
]);

/** The intent a key expresses, or `null` when the cell must not intercept it. */
export function pinKeyIntent(key: string): PinKeyIntent | null {
  return KEY_INTENTS.get(key) ?? null;
}

/** The keyboard facts a cell decides on: the key name plus the modifier state. */
export interface PinKeyEvent {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

/**
 * The intent a key EVENT expresses. A combination carrying Alt, Ctrl or Meta
 * belongs to the browser or the OS — Alt+Arrow is history navigation, Ctrl/Cmd+
 * Arrow is word and line caret movement — so the cell neither claims it nor
 * `preventDefault()`s it, which is what the header above already promises. Shift
 * is deliberately absent from the gate: it only extends the selection inside a
 * one-character box, where moving a cell is still the useful reading. Ctrl/Cmd+V
 * is unaffected either way, because its key is `v` and was never in the table.
 */
export function pinEventIntent(event: Readonly<PinKeyEvent>): PinKeyIntent | null {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return null;
  }
  return pinKeyIntent(event.key);
}

// Backspace is the only two-branch key: on a FILLED cell it clears in place and
// focus stays put, on an EMPTY one it steps back a cell and clears that instead —
// the behaviour a user expects when correcting a code they mistyped two cells ago.
// Clamped at cell 0, where "step back" degrades to clearing cell 0 itself.
function backspaceOutcome(ctx: Readonly<PinCellContext>): PinOutcome {
  if (charAt(ctx.value, ctx.index) !== '') {
    return { value: withoutDigitAt(ctx.value, ctx.index), focusIndex: null };
  }
  const previous: number = Math.max(ctx.index - 1, 0);
  return { value: withoutDigitAt(ctx.value, previous), focusIndex: previous };
}

/** Delete clears the current cell and never moves focus (the Backspace mirror). */
function deleteOutcome(ctx: Readonly<PinCellContext>): PinOutcome {
  return { value: withoutDigitAt(ctx.value, ctx.index), focusIndex: null };
}

// The arrows are a CONVENIENCE layer over the natural tab order, never a
// replacement for it: every cell stays tabbable, so a screen reader in forms mode
// still reaches all of them. Both ends clamp rather than wrap — a PIN is read
// left to right and wrapping would silently relocate the caret.
function prevOutcome(ctx: Readonly<PinCellContext>): PinOutcome {
  return { value: null, focusIndex: Math.max(ctx.index - 1, 0) };
}

function nextOutcome(ctx: Readonly<PinCellContext>): PinOutcome {
  return { value: null, focusIndex: Math.min(ctx.index + 1, ctx.length - 1) };
}

const INTENT_OUTCOMES: Readonly<
  Record<PinKeyIntent, (ctx: Readonly<PinCellContext>) => PinOutcome>
> = {
  backspace: backspaceOutcome,
  delete: deleteOutcome,
  prev: prevOutcome,
  next: nextOutcome,
};

/** What the field should do about an intercepted key. */
export function resolvePinKey(intent: PinKeyIntent, ctx: Readonly<PinCellContext>): PinOutcome {
  return INTENT_OUTCOMES[intent](ctx);
}
