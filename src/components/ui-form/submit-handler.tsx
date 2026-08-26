import type { BaseSyntheticEvent } from 'react';
import type { DefaultValues, FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';

import { devWarn } from '../../utils/dev-warn';

// Sibling .tsx module (not .ts: Stryker mutates src/components/**/*.tsx only,
// and the rejection contract must stay inside mutation scope) rather than more
// code in `index.tsx`: with the rejection
// contract inlined, that file dropped under the metrics policy's
// `mi_visual_studio_min` floor, and the builder's own `lloc` (which rust-code-
// analysis charges with its nested closure) went over `lloc_function_max`.

export type SubmitHandlerOptions<T extends FieldValues> = {
  onSubmit: SubmitHandler<T>;
  methods: UseFormReturn<T>;
  defaultValues: DefaultValues<T>;
  resetOnSuccess: boolean;
  onSubmitError?: ((error: unknown) => void) | undefined;
};

const UNHANDLED_SUBMIT_REJECTION_WARNING: string =
  'UiForm caught a rejected onSubmit; pass onSubmitError to handle it.';

function reportSubmitError(error: unknown, onSubmitError?: (error: unknown) => void): void {
  if (onSubmitError) {
    onSubmitError(error);
    return;
  }

  devWarn(UNHANDLED_SUBMIT_REJECTION_WARNING);
}

function resetAfterSuccess<T extends FieldValues>(
  methods: UseFormReturn<T>,
  defaultValues: DefaultValues<T>,
  resetOnSuccess: boolean
): void {
  if (resetOnSuccess) {
    methods.reset(defaultValues);
  }
}

/**
 * Wraps the consumer's `onSubmit` so a rejection is contained instead of
 * escaping as an unhandled promise rejection: it is handed to `onSubmitError`
 * when one is supplied and reported through the development-only warning
 * otherwise, and the `resetOnSuccess` reset is skipped either way.
 */
export default function buildSubmitHandler<T extends FieldValues>({
  onSubmit,
  methods,
  defaultValues,
  resetOnSuccess,
  onSubmitError,
}: SubmitHandlerOptions<T>): SubmitHandler<T> {
  return async (data: T, event?: BaseSyntheticEvent): Promise<void> => {
    try {
      await onSubmit(data, event);
    } catch (error) {
      reportSubmitError(error, onSubmitError);
      return;
    }

    resetAfterSuccess(methods, defaultValues, resetOnSuccess);
  };
}
