import React, { ReactNode } from 'react';
import { FieldValues, SubmitHandler, UseFormReturn, useForm } from 'react-hook-form';

import { ErrorBanner, FormHeader, SubmitControls } from './form-parts';
import FormProviderBridge from './form-provider-bridge';
import FormOfflineNotice from './offline-notice';
import SubmitAnnouncement from './submit-announcement';
import buildSubmitHandler from './submit-handler';
import type { FormViewProps, UiFormProps } from './types';
import useOfflineSubmit, { type OfflineSubmit } from './use-offline-submit';

export type { UiFormProps } from './types';

type FormBodyProps<T extends FieldValues> = {
  methods: UseFormReturn<T>;
  handleSubmit: SubmitHandler<T>;
  submitting: boolean;
  children: ReactNode;
  view: FormViewProps<T>;
};

function FormBody<T extends FieldValues>({
  methods,
  handleSubmit,
  submitting,
  children,
  view,
}: FormBodyProps<T>): React.ReactElement {
  const offline: OfflineSubmit = useOfflineSubmit(view.offlineNotice !== undefined);

  return (
    <form noValidate aria-busy={submitting} onSubmit={methods.handleSubmit(handleSubmit)}>
      <ErrorBanner error={view.error} inheritTheme={view.inheritTheme} />
      <FormHeader view={view} />
      <FormOfflineNotice offline={offline} copy={view.offlineNotice} />
      {children}
      <SubmitControls view={view} submitting={submitting} offline={offline} />
      <SubmitAnnouncement view={view} submitting={submitting} />
    </form>
  );
}

export default function UiForm<T extends FieldValues>({
  onSubmit,
  defaultValues,
  formOptions = {},
  isSubmitting = undefined,
  resetOnSuccess = false,
  onSubmitError = undefined,
  children,
  ...view
}: UiFormProps<T>): React.ReactElement {
  const methods: UseFormReturn<T> = useForm<T>({
    mode: 'onTouched',
    defaultValues,
    ...formOptions,
  });
  const submitting: boolean = isSubmitting ?? methods.formState.isSubmitting;
  const handleSubmit: SubmitHandler<T> = buildSubmitHandler({
    onSubmit,
    methods,
    defaultValues,
    resetOnSuccess,
    onSubmitError,
  });

  return (
    <FormProviderBridge methods={methods}>
      <FormBody methods={methods} handleSubmit={handleSubmit} submitting={submitting} view={view}>
        {children}
      </FormBody>
    </FormProviderBridge>
  );
}
