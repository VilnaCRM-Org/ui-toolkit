import {
  digitsOnly,
  withDigitsAt,
  writeIndex,
  type PinCellContext,
  type PinOutcome,
} from './pin-value';

/**
 * The single write path shared by paste, OS one-time-code autofill and ordinary
 * typing — a typed digit is just a one-character run, so no entry route can be
 * validated differently from another (the 2.4A file-upload lesson).
 *
 * Non-digits are stripped first, so `"123-456"` and `"code: 123456"` both land
 * as `123456`. The run starts at the focused cell (densified, so a click on an
 * empty far cell still appends at the end), is truncated at the last cell, and
 * focus finishes on the cell AFTER the last one filled — clamped to the last
 * cell, which is where a user expects the caret once the code is complete.
 * A paste carrying no digits at all changes nothing and leaves focus where it is.
 */
export default function resolvePinEntry(raw: string, ctx: Readonly<PinCellContext>): PinOutcome {
  const index: number = writeIndex(ctx.value, ctx.index);
  const digits: string = digitsOnly(raw).slice(0, ctx.length - index);
  return {
    value: withDigitsAt({ value: ctx.value, index, digits }),
    focusIndex: Math.min(index + digits.length, ctx.length - 1),
  };
}
