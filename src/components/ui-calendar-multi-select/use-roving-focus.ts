import React from 'react';

export interface RovingFocus {
  /** Callback ref for the roving cell — focuses it after keyboard navigation. */
  rovingRef: (node: HTMLElement | null) => void;
  /** Arms focus so the next roving cell to attach pulls focus. */
  requestFocus: () => void;
}

// Focus-on-attach: React re-attaches `rovingRef` to whichever cell is the roving
// target. After keyboard navigation (`requestFocus`) the freshly attached cell
// pulls focus; on mount and after nav-button clicks the flag is false, so focus
// is left where it is (on the button / the initial tab stop).
export function useRovingFocus(): RovingFocus {
  const shouldFocusRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);

  const rovingRef: RovingFocus['rovingRef'] = React.useCallback(
    (node: HTMLElement | null): void => {
      if (node != null && shouldFocusRef.current) {
        shouldFocusRef.current = false;
        node.focus();
      }
    },
    []
  );

  const requestFocus: RovingFocus['requestFocus'] = React.useCallback((): void => {
    shouldFocusRef.current = true;
  }, []);

  return { rovingRef, requestFocus };
}
