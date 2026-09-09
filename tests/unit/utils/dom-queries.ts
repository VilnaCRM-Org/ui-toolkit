import { screen } from '@testing-library/react';

/** Every hook that would make something in a component's tree focusable. */
export const FOCUSABLE_SELECTOR: string =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable]';

/**
 * Every ARIA/interactivity hook a STATIC (unwired) branch must not ship.
 * `aria-hidden` is excluded on purpose: decorative paint carries it in both
 * branches, so its presence is never evidence of interactivity.
 */
export const ARIA_SELECTOR: string =
  '[role], [tabindex], [aria-checked], [aria-disabled], [aria-pressed], [aria-label], ' +
  '[aria-labelledby], [aria-describedby], [aria-haspopup], [aria-expanded], [aria-controls], ' +
  '[aria-setsize], [aria-posinset], [aria-required], [aria-invalid], [aria-current], ' +
  '[aria-selected]';

/** Every node matching `selector`, as a real array the assertions can index. */
export function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

export function focusables(): Element[] {
  return nodesMatching(FOCUSABLE_SELECTOR);
}

/**
 * A bare `aria-live` container has no implicit role, so role queries alone leave
 * a hole in the sweep; the attributes are checked too.
 */
export function liveRegionNodes(): Element[] {
  return nodesMatching('[aria-live], [aria-atomic], [aria-relevant], output');
}

/** No component in this toolkit announces on its own behalf; the consumer does. */
export function expectNoLiveRegion(): void {
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByRole('log')).not.toBeInTheDocument();
  expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  expect(screen.queryByRole('marquee')).not.toBeInTheDocument();
  expect(liveRegionNodes()).toHaveLength(0);
}
