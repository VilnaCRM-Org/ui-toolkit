import { useDevWarning } from '@/utils/dev-warn';

import copyFieldWarning from './copy-field-warnings';
import type { UiCopyFieldProps } from './types';
import { useCopiedLatch, type CopiedLatch } from './use-copied-latch';

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
  /** True while the post-copy confirmation latch is held; drives the chrome. */
  copied: boolean;
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
  onCopied: () => void;
  onCopy?: ((value: string) => void) | undefined;
  onCopyError?: ((error: unknown) => void) | undefined;
}

// Activation is gated in the model layer, before any DOM concern: a disabled
// chip swallows it so the clipboard is never touched (the `aria-disabled`
// boundary), which is what keeps the button focusable and keeps focus from
// being dropped when a focused chip flips disabled. The three clipboard paths
// — success, rejection, missing API — all resolve here into exactly one of
// `onCopy` or `onCopyError`, never both and never a thrown exception.
/**
 * The success path. `onCopy` is a consumer callback, so it may throw — and that
 * exception is the consumer's bug, not a clipboard failure. It must not reach
 * `onCopyError`, and it must not be left as an unhandled rejection either, so
 * it is rethrown clear of the promise chain where the page's own error
 * reporting sees it unchanged.
 */
// Re-raises an error clear of the promise chain, where the page's own error
// reporting sees it, instead of leaving it as an unhandled rejection.
function rethrowLater(error: unknown): void {
  setTimeout((): void => {
    throw error;
  }, 0);
}

function reportCopied(config: Readonly<ActivateConfig>): void {
  config.onCopied();
  try {
    // `onCopy` is typed to return void, but nothing stops a consumer handing
    // back a promise — and a rejection from one would sail straight past this
    // `catch`. Normalising the result routes an async failure exactly like a
    // synchronous throw: reported, never mistaken for a clipboard error.
    void Promise.resolve(config.onCopy?.(config.value)).catch(rethrowLater);
  } catch (error: unknown) {
    rethrowLater(error);
  }
}

function makeActivate(config: Readonly<ActivateConfig>): () => void {
  return (): void => {
    if (config.disabled) return;
    // The rejection handler is the SECOND argument of `then`, not a trailing
    // `.catch`: a trailing catch also sees anything the consumer's own
    // `onCopy` throws, and would then report a successful copy as a clipboard
    // failure — calling both callbacks for one activation, which is exactly
    // what the contract above rules out.
    writeToClipboard(config.value).then(
      (): void => reportCopied(config),
      (error: unknown): void => config.onCopyError?.(error)
    );
  };
}

export function useCopyField(props: UiCopyFieldProps): CopyFieldModel {
  useDevWarning(copyFieldWarning(props));
  const disabled: boolean = props.disabled ?? false;
  const { copied, latch }: CopiedLatch = useCopiedLatch();
  return {
    ariaDisabled: disabled ? true : undefined,
    copyLabel: props.copyLabel ?? DEFAULT_COPY_LABEL,
    copied: copied && !disabled,
    onActivate: makeActivate({
      disabled,
      value: props.value,
      onCopied: latch,
      onCopy: props.onCopy,
      onCopyError: props.onCopyError,
    }),
  };
}
