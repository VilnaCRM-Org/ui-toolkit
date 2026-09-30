import type React from 'react';
import type { ReactNode } from 'react';
import type { DefaultValues, FieldValues, SubmitHandler, UseFormProps } from 'react-hook-form';

import type { UiButtonProps } from '../ui-button/types';

export interface UiFormProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>;
  defaultValues: DefaultValues<T>;
  children: ReactNode;
  formOptions?: Omit<UseFormProps<T>, 'defaultValues'> | undefined;
  isSubmitting?: boolean | undefined;
  /**
   * Form-level failure copy, rendered in a `role="alert"` banner that takes
   * focus when it appears or its message changes. Clear it when a new submit
   * starts: React re-renders only on a changed value, so a repeated identical
   * failure that is never cleared can be neither re-announced nor refocused.
   */
  error?: string | null | undefined;
  submitLabel: string;
  /**
   * Spoken by the submit button's polite `role="status"` region once a submit
   * has been in flight long enough to be worth announcing — forwarded as the
   * button's `loadingText`, so it falls back to the kit's shared loading copy.
   */
  submittingLabel?: string | undefined;
  title: ReactNode;
  subtitle?: ReactNode | undefined;
  showTitle?: boolean | undefined;
  showSubtitle?: boolean | undefined;
  resetOnSuccess?: boolean | undefined;
  isSubmitDisabled?: boolean | undefined;
  /**
   * Receives whatever value a rejected `onSubmit` carried, so the rejection is contained
   * instead of escaping. With no handler attached the rejection is still contained and a
   * development-only warning is emitted in its place.
   *
   * Accessibility: the `error` display prop's banner and an escalation into an error
   * boundary are mutually exclusive paths for one failure. Wiring both produces two
   * competing `role="alert"` regions, whose announcements are duplicated, interrupted,
   * or dropped. Pick exactly one path per failure.
   */
  onSubmitError?: ((error: unknown) => void) | undefined;
  /** Element the title renders as, e.g. `'h1'` on a page whose heading it is. Defaults to `'p'`. */
  titleComponent?: React.ElementType | undefined;
  /** Forwarded to the submit button's `loadingMode`. */
  submitLoadingMode?: UiButtonProps['loadingMode'] | undefined;
  submitFocusOutline?: UiButtonProps['focusOutline'] | undefined;
  inheritTheme?: boolean | undefined;
  /**
   * Opts into offline handling: while the browser is offline the submit is
   * disabled and described by a status notice after the title that shows
   * `offline`, and `restored` shows for five seconds after reconnection. Focus
   * on the submit when the connection drops moves to the notice.
   */
  offlineNotice?: { offline: string; restored: string } | undefined;
}

// Display props collected from UiForm via `...view` rest and passed as a single
// prop. Their defaults are applied where each is read (FormHeader, SubmitControls),
// not in UiForm's signature, so a new display prop must also be defaulted there.
export type FormViewProps<T extends FieldValues> = Omit<
  UiFormProps<T>,
  | 'onSubmit'
  | 'defaultValues'
  | 'formOptions'
  | 'isSubmitting'
  | 'resetOnSuccess'
  | 'children'
  | 'onSubmitError'
>;
