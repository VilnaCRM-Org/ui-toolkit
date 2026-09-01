import React from 'react';

import { devWarn } from '@/utils/dev-warn';

const RADIOGROUP_CONTEXT_WARNING: string =
  'UiIntegrationCard is wired but has no `[role="radiogroup"]` ancestor. The card never ' +
  'renders its own group (a11y contract §1.2) — wrap the sibling cards in a named ' +
  '`role="radiogroup"` so assistive tech announces the choice as one set.';

const RADIOGROUP_SELECTOR: string = '[role="radiogroup"]';

// ARIA 1.2 imposes no required context role on `radio` (`radiogroup` is a SHOULD),
// so a standalone card is valid and independently completable — this is therefore
// a dev-only teaching warning and never a gate (a11y contract §12.2). It is the
// one warning that reads the DOM rather than the props, so it runs from a mount
// effect against the real node instead of through `useDevWarning`; `devWarn` still
// keeps it silent in production. The deps are both stable, so it fires once.
function useRadioGroupContextWarning(
  card: React.RefObject<HTMLButtonElement | null>,
  wired: boolean
): void {
  React.useEffect((): void => {
    // Static cards carry no role at all, so they never check (§12.2).
    if (!wired || card.current?.closest(RADIOGROUP_SELECTOR) != null) {
      return;
    }
    devWarn(RADIOGROUP_CONTEXT_WARNING);
  }, [card, wired]);
}

interface CardNodeAssignment {
  /** The consumer's ref, in either of React's two shapes. */
  forwarded: React.ForwardedRef<HTMLButtonElement>;
  /** The component's own handle, read only by the §12.2 mount check. */
  own: React.RefObject<HTMLButtonElement | null>;
  node: HTMLButtonElement | null;
}

// The forwarded ref lands on the card button itself — there is no positioning
// wrapper (§2.1), because nothing in this card floats. React accepts a callback
// ref or a ref object, so both shapes are assigned explicitly.
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
 * The card's callback ref: it feeds the consumer's forwarded ref AND keeps a
 * private handle on the node, which the §12.2 radiogroup-ancestor check reads on
 * mount. The component itself never calls `.focus()` on it — focus behaviour is
 * entirely the platform's (§4.2); the ref exists purely as the consumer's
 * focus-return API.
 */
export default function useCardRef(
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
  wired: boolean
): React.RefCallback<HTMLButtonElement> {
  const card: React.RefObject<HTMLButtonElement | null> = React.useRef<HTMLButtonElement | null>(
    null
  );
  useRadioGroupContextWarning(card, wired);
  return React.useCallback(
    (node: HTMLButtonElement | null): void =>
      assignCardNode({ forwarded: forwardedRef, own: card, node }),
    [forwardedRef]
  );
}
