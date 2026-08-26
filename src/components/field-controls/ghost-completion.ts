// Shared prefix-completion logic for the search/select ghost overlay and the
// dropdown suggestion rows. A suggestion is split into the part the user has typed
// and the remaining completion via a case-insensitive prefix match — the field
// renders the completion as grey ghost text after a caret, and each row renders it
// as the grey run after the dark typed prefix (Figma "Search").
import type React from 'react';

/** True when `query` is a non-empty case-insensitive prefix of `option`. */
export function isPrefixMatch(query: string, option: string): boolean {
  return query.length > 0 && option.toLowerCase().startsWith(query.toLowerCase());
}

/**
 * Splits `option` at the typed length: `[head, tail]`. A prefix match splits at
 * `query.length` (typed prefix + completion); a non-prefix (or empty query) keeps
 * the whole option in the head with an empty tail.
 */
export function splitOnPrefix(option: string, query: string): [string, string] {
  const splitAt: number = isPrefixMatch(query, option) ? query.length : option.length;
  return [option.slice(0, splitAt), option.slice(splitAt)];
}

/**
 * The first option that `query` prefix-matches with a non-empty completion, returned
 * WHOLE in its own (canonical) casing. The field draws the remainder after the typed
 * length as the grey ghost, and the accept gesture commits this full option — so
 * typing `top` and accepting yields `Top performers`, not `top performers`. Empty
 * when nothing matches, the query is empty, or the only match is exact.
 */
export function firstGhostMatch(query: string, options: readonly string[]): string {
  for (const option of options) {
    if (isPrefixMatch(query, option) && option.length > query.length) {
      return option;
    }
  }
  return '';
}

// Tab (not Shift+Tab, which must still move focus backward), or ArrowRight with the
// caret at the very end, commits the completion. Shared by the freeSolo search
// ghost and the select ghost so the accept gesture stays identical.
//
// INVARIANT: no key listed here may overlap a key MUI Autocomplete handles on
// its root (its switch checks `defaultMuiPrevented`, not `preventDefault`, and
// today has no Tab/ArrowRight cases in single-select). Re-audit this set on any
// MUI upgrade or before adding a key — an overlap would race the ghost's
// preventDefault against MUI's own handling of the same event.
// ArrowRight only commits from the very end of the value; anywhere else it is an
// ordinary caret move. Split out so `isGhostAcceptKey` stays inside the metrics
// gate's per-function exit budget.
function isCaretAtEnd(event: React.KeyboardEvent<HTMLInputElement>): boolean {
  const end: number = event.currentTarget.value.length;
  return event.currentTarget.selectionStart === end && event.currentTarget.selectionEnd === end;
}

export function isGhostAcceptKey(event: React.KeyboardEvent<HTMLInputElement>): boolean {
  // Never accept mid-composition. An IME dispatches keydown while a candidate is
  // being composed, and both accept keys are load-bearing there — ArrowRight walks
  // the candidate list / clause boundary and Tab commits the candidate. Treating
  // either as "accept the ghost" would `preventDefault` the IME's own key and
  // replace the user's in-progress composition with the first prefix match. The
  // guard lives in the shared predicate so the search ghost and the select ghost
  // are both covered; `isComposing` is false for every non-IME keystroke, so this
  // changes nothing for Latin input.
  if (event.nativeEvent.isComposing) return false;
  if (event.key === 'Tab') return !event.shiftKey;
  return event.key === 'ArrowRight' && isCaretAtEnd(event);
}
