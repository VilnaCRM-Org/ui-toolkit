import { useLayoutEffect, useRef, type RefObject } from 'react';

function focusDropped(): boolean {
  return document.activeElement === document.body;
}

export default function useNativeSubmitFocus(
  native: boolean,
  submitting: boolean,
  submitRef: RefObject<HTMLButtonElement | null>
): void {
  const wasSubmitting: RefObject<boolean> = useRef<boolean>(false);
  useLayoutEffect((): void => {
    const ended: boolean = wasSubmitting.current && !submitting;
    wasSubmitting.current = submitting;
    if (native && ended && focusDropped()) {
      (submitRef.current as HTMLButtonElement).focus();
    }
  }, [native, submitting, submitRef]);
}
