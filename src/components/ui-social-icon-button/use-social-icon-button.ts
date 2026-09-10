import { useDevWarning } from '@/utils/dev-warn';

import socialIconButtonWarning from './social-icon-button-warnings';
import type { SocialNetwork, UiSocialIconButtonProps } from './types';

// Default accessible names, one per brand mark (extraction.md, "Contract").
// Kept un-exported: nothing outside this module needs it, and an un-imported
// export is instrumented as a phantom uncovered function by esbuild-jest.
const DEFAULT_LABELS: Record<SocialNetwork, string> = {
  instagram: 'Instagram',
  github: 'GitHub',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};

// The view model the chip renders from: element choice, the `aria-disabled`
// boundary and the accessible-name fallback all resolve here, keeping the
// component itself a thin render switch.
export interface SocialIconButtonModel {
  /** True when `href` is present — the chip renders as an `<a>`. */
  isAnchor: boolean;
  /** The resolved accessible name. */
  ariaLabel: string;
  /** `aria-disabled` for a disabled chip; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** Fired on activation in button mode; a no-op while disabled. */
  onActivate: () => void;
}

// Activation is gated here, before any DOM concern: a disabled chip swallows
// it so `onActivate` never fires, keeping the button focusable (the
// `ui-filter-chip` boundary precedent).
function makeActivate(disabled: boolean, onActivate?: () => void): () => void {
  return (): void => {
    if (disabled) return;
    onActivate?.();
  };
}

export function useSocialIconButton(props: UiSocialIconButtonProps): SocialIconButtonModel {
  useDevWarning(socialIconButtonWarning(props));
  const disabled: boolean = props.disabled ?? false;
  return {
    isAnchor: props.href != null,
    ariaLabel: props.label ?? DEFAULT_LABELS[props.network],
    ariaDisabled: disabled ? true : undefined,
    onActivate: makeActivate(disabled, props.onActivate),
  };
}
