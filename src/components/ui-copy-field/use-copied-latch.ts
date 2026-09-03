// Split out of `use-copy-field.ts` so neither module exceeds the per-file
// closure budget the metrics gate enforces.
import React from 'react';

/** How long the chip holds its confirmation paint after a successful copy. */
export const COPIED_RESET_MS: number = 2000;

export interface CopiedLatch {
  copied: boolean;
  latch: () => void;
}

/**
 * The confirmation latch. It lives in the model, not the consumer, because the
 * feedback is a property of the chip's OWN activation -- a caller that also
 * wants to know still gets `onCopy`. A second copy restarts the timer rather
 * than stacking one, and unmounting clears it, so no reset is ever left in
 * flight against an unmounted chip.
 */
export function useCopiedLatch(): CopiedLatch {
  const [copied, setCopied] = React.useState<boolean>(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect((): (() => void) => (): void => clearTimeout(timer.current), []);
  const latch = React.useCallback((): void => {
    clearTimeout(timer.current);
    setCopied(true);
    timer.current = setTimeout((): void => setCopied(false), COPIED_RESET_MS);
  }, []);
  return { copied, latch };
}
