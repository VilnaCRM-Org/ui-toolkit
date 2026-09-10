import type React from 'react';

import { useRadioCardRef } from '../radio-card-controls';

const RADIOGROUP_CONTEXT_WARNING: string =
  'UiIntegrationCard is wired but has no `[role="radiogroup"]` ancestor. The card never ' +
  'renders its own group (a11y contract §1.2) — wrap the sibling cards in a named ' +
  '`role="radiogroup"` so assistive tech announces the choice as one set.';

/**
 * The card's callback ref. The plumbing and the §12.2 mount check are the shared
 * radio-card recipe; only the warning's wording belongs to this card, because it
 * names the component the consumer actually wrote.
 */
export default function useCardRef(
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
  wired: boolean
): React.RefCallback<HTMLButtonElement> {
  return useRadioCardRef(forwardedRef, wired, RADIOGROUP_CONTEXT_WARNING);
}
