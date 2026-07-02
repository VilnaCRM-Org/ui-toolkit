import { useEffect } from 'react';

/**
 * Emits a `console.warn` in development only; stripped from the production build
 * so the published bundle stays silent. Shared by the exported components that
 * degrade gracefully on runtime-invalid props the strict TypeScript types forbid
 * (e.g. CMS/API data feeding a nullish value into a required prop).
 */
export function devWarn(message: string): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  console.warn(message);
}

/**
 * Runs {@link devWarn} from an effect keyed to `message`, so a normal re-render
 * does not re-log while a prop change into or out of the warning state does.
 * Pass `null` when there is nothing to warn about.
 */
export function useDevWarning(message: string | null): void {
  useEffect((): void => {
    if (message != null) {
      devWarn(message);
    }
  }, [message]);
}
