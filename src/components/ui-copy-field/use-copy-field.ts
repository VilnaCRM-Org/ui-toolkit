import { useDevWarning } from '@/utils/dev-warn';

import copyFieldWarning from './copy-field-warnings';
import type { UiCopyFieldProps } from './types';

/**
 * The visually-hidden suffix appended to the visible code, in Ukrainian like
 * every other built-in string in the toolkit (the `UiFilterChip` precedent).
 */
export const DEFAULT_COPY_LABEL: string = 'Копіювати';

// The view model the chip renders from. It keeps the component thin: the
// `aria-disabled` boundary, the name suffix resolution and the clipboard
// activation all live here.
export interface CopyFieldModel {
  /** `aria-disabled` for a disabled chip; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** The hidden suffix that turns the visible code into an action name. */
  copyLabel: string;
  /** Fired on activation; a no-op while disabled. */
  onActivate: () => void;
}

// Reaches for the Clipboard API defensively: jsdom (and older browsers) never
// define `navigator.clipboard`, and that absence is one of the three branches
// the contract routes to `onCopyError`, not a thrown exception.
function writeToClipboard(value: string): Promise<void> {
  const clipboard: Clipboard | undefined = navigator.clipboard;
  if (clipboard == null) {
    return Promise.reject(new Error('Clipboard API unavailable'));
  }
  return clipboard.writeText(value);
}

interface ActivateConfig {
  disabled: boolean;
  value: string;
  onCopy?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
}

// Activation is gated in the model layer, before any DOM concern: a disabled
// chip swallows it so the clipboard is never touched (the `aria-disabled`
// boundary), which is what keeps the button focusable and keeps focus from
// being dropped when a focused chip flips disabled. The three clipboard paths
// — success, rejection, missing API — all resolve here into exactly one of
// `onCopy` or `onCopyError`, never both and never a thrown exception.
function makeActivate(config: Readonly<ActivateConfig>): () => void {
  return (): void => {
    if (config.disabled) return;
    writeToClipboard(config.value)
      .then((): void => config.onCopy?.(config.value))
      .catch((error: unknown): void => config.onCopyError?.(error));
  };
}

export function useCopyField(props: UiCopyFieldProps): CopyFieldModel {
  useDevWarning(copyFieldWarning(props));
  const disabled: boolean = props.disabled ?? false;
  return {
    ariaDisabled: disabled ? true : undefined,
    copyLabel: props.copyLabel ?? DEFAULT_COPY_LABEL,
    onActivate: makeActivate({
      disabled,
      value: props.value,
      onCopy: props.onCopy,
      onCopyError: props.onCopyError,
    }),
  };
}
