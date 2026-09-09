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
 * than stacking one.
 *
 * The mounted flag is what makes the cleanup complete. Clearing the timer on
 * unmount is not enough on its own: the clipboard write is async, so a promise
 * that settles AFTER unmount would call `latch` on a dead hook, set state on it
 * and schedule a fresh timer that the cleanup has already run past. A latch
 * arriving that late is simply dropped.
 */
interface LatchRefs {
  mounted: React.RefObject<boolean>;
  timer: React.RefObject<ReturnType<typeof setTimeout> | undefined>;
}

/**
 * The two refs the latch needs, sharing one cleanup: unmounting both stops a
 * pending reset and closes the latch to anything that arrives afterwards. Split
 * out so `useCopiedLatch` stays inside the per-function LLOC budget.
 */
function useLatchRefs(): LatchRefs {
  const mounted: React.RefObject<boolean> = React.useRef<boolean>(true);
  const timer: React.RefObject<ReturnType<typeof setTimeout> | undefined> = React.useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);
  React.useEffect((): (() => void) => {
    mounted.current = true;
    return (): void => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  return { mounted, timer };
}

export function useCopiedLatch(): CopiedLatch {
  const [copied, setCopied] = React.useState<boolean>(false);
  const { mounted, timer }: LatchRefs = useLatchRefs();
  const latch = React.useCallback((): void => {
    if (mounted.current) {
      clearTimeout(timer.current);
      setCopied(true);
      timer.current = setTimeout((): void => setCopied(false), COPIED_RESET_MS);
    }
  }, [mounted, timer]);
  return { copied, latch };
}
