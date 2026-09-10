import React from 'react';

import { devWarn } from '@/utils/dev-warn';

const RADIOGROUP_SELECTOR: string = '[role="radiogroup"]';

// ARIA 1.2 imposes no required context role on `radio` (`radiogroup` is a
// SHOULD), so a standalone card is valid and independently completable — this is
// therefore a dev-only teaching warning and never a gate. It is the one warning
// that reads the DOM rather than the props, so it runs from a mount effect
// against the real node instead of through `useDevWarning`; `devWarn` still keeps
// it silent in production. The deps are all stable, so it fires once.
function useRadioGroupContextWarning(
  card: React.RefObject<HTMLButtonElement | null>,
  wired: boolean,
  warning: string
): void {
  React.useEffect((): void => {
    // Static cards carry no role at all, so they never check.
    if (!wired || card.current?.closest(RADIOGROUP_SELECTOR) != null) {
      return;
    }
    devWarn(warning);
  }, [card, wired, warning]);
}

interface CardNodeAssignment {
  /** The consumer's ref, in either of React's two shapes. */
  forwarded: React.ForwardedRef<HTMLButtonElement>;
  /** The component's own handle, read only by the mount check. */
  own: React.RefObject<HTMLButtonElement | null>;
  node: HTMLButtonElement | null;
}

// The forwarded ref lands on the card button itself — there is no positioning
// wrapper, because nothing in these cards floats. React accepts a callback ref
// or a ref object, so both shapes are assigned explicitly.
function assignCardNode(assignment: CardNodeAssignment): void {
  const { forwarded, own, node } = assignment;
  own.current = node;
  if (typeof forwarded === 'function') {
    forwarded(node);
    return;
  }
  if (forwarded != null) {
    forwarded.current = node;
  }
}

/**
 * The callback ref shared by every "whole card is one `role="radio"` button"
 * component: it feeds the consumer's forwarded ref AND keeps a private handle on
 * the node, which the radiogroup-ancestor check reads on mount. The component
 * itself never calls `.focus()` on it — focus behaviour is entirely the
 * platform's; the ref exists purely as the consumer's focus-return API.
 *
 * `contextWarning` is the caller's, because the message names the component the
 * consumer actually wrote and has to be actionable in their own vocabulary.
 */
export default function useRadioCardRef(
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
  wired: boolean,
  contextWarning: string
): React.RefCallback<HTMLButtonElement> {
  const card: React.RefObject<HTMLButtonElement | null> = React.useRef<HTMLButtonElement | null>(
    null
  );
  useRadioGroupContextWarning(card, wired, contextWarning);
  return React.useCallback(
    (node: HTMLButtonElement | null): void =>
      assignCardNode({ forwarded: forwardedRef, own: card, node }),
    [forwardedRef]
  );
}
