import { useEffect, useRef, type RefObject } from 'react';

// A submit failure moves focus to the error banner so the failure is both
// announced and brought into view. Keyed on `error`, never on mount: a form
// that opens with an error already set keeps the user's place in the first
// field, and a later submit that swaps one message for another refocuses the
// banner even though it never left the DOM. The previous value is compared,
// not a render count, so StrictMode's replayed effects cannot steal focus.
export default function useFocusOnError<T extends HTMLElement>(
  error: string | null | undefined
): RefObject<T | null> {
  const ref: RefObject<T | null> = useRef<T>(null);
  const previous: RefObject<string | null | undefined> = useRef(error);

  useEffect((): void => {
    const changed: boolean = error !== previous.current;
    previous.current = error;
    if (changed && error) {
      ref.current?.focus();
    }
  }, [error]);

  return ref;
}
