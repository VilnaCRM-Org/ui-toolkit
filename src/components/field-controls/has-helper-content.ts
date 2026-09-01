import type { ReactNode } from 'react';

import { hasText } from './has-text';

// True when `helperText` will actually paint something. React renders BOTH
// booleans as nothing, so the ubiquitous `helperText={hasError && message}` idiom
// collapses to `false` and has to count as absent — otherwise an empty
// `<FormHelperText>` mounts, every control describes itself with it, and the
// `error`-without-`helperText` warning is silenced by a node that renders no
// explanation at all. Blank and whitespace-only strings are absent for the same
// reason; a numeric `0` is a real glyph and stays present.
//
// Arrays (`helperText={[a, b]}`, and every fragment React flattens into one) are
// walked recursively: an EMPTY array renders nothing, so counting it as present
// would mount a blank `<FormHelperText>`, silence the missing-helper warning and
// still point `aria-describedby` at it. Only an array with at least one
// renderable child is content.
export function hasHelperContent(helperText: ReactNode): boolean {
  if (Array.isArray(helperText)) {
    return helperText.some(hasHelperContent);
  }
  if (typeof helperText === 'string') {
    return hasText(helperText);
  }
  return typeof helperText !== 'boolean' && helperText != null;
}
