import { CircularProgress } from '@mui/material';
import React, { ReactNode } from 'react';
import {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
  useForm,
} from 'react-hook-form';

import UiButton from '../ui-button';
import UiTypography from '../ui-typography';

import FormProviderBridge from './form-provider-bridge';
import styles from './styles';

export interface UiFormProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>;
  defaultValues: DefaultValues<T>;
  children: ReactNode;
  formOptions?: Omit<UseFormProps<T>, 'defaultValues'>;
  isSubmitting?: boolean;
  error?: string | null;
  submitLabel: string;
  title: ReactNode;
  subtitle?: ReactNode;
  showTitle?: boolean;
  showSubtitle?: boolean;
  resetOnSuccess?: boolean;
  isSubmitDisabled?: boolean;
}

type SubmitHandlerOptions<T extends FieldValues> = {
  onSubmit: SubmitHandler<T>;
  methods: UseFormReturn<T>;
  defaultValues: DefaultValues<T>;
  resetOnSuccess: boolean;
};

type SubmitControlsProps = {
  submitting: boolean;
  isSubmitDisabled: boolean;
  submitLabel: string;
};

type FormBodyProps<T extends FieldValues> = {
  methods: UseFormReturn<T>;
  handleSubmit: SubmitHandler<T>;
  children: ReactNode;
  error?: string | null;
  title: ReactNode;
  subtitle?: ReactNode;
  showTitle: boolean;
  showSubtitle: boolean;
  submitting: boolean;
  isSubmitDisabled: boolean;
  submitLabel: string;
};

function ErrorBanner({ error }: { error?: string | null }): React.ReactElement | null {
  if (!error) {
    return null;
  }

  return (
    <UiTypography role="alert" aria-live="polite" sx={{ color: 'red', marginBottom: '1rem' }}>
      {error}
    </UiTypography>
  );
}

function FormHeader({
  title,
  subtitle,
  showTitle,
  showSubtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  showTitle: boolean;
  showSubtitle: boolean;
}): React.ReactElement {
  return (
    <>
      {showTitle && title ? (
        <UiTypography variant="h4" sx={styles.formTitle}>
          {title}
        </UiTypography>
      ) : null}
      {showSubtitle && subtitle ? (
        <UiTypography sx={styles.formSubtitle}>{subtitle}</UiTypography>
      ) : null}
    </>
  );
}

function buildSubmitHandler<T extends FieldValues>({
  onSubmit,
  methods,
  defaultValues,
  resetOnSuccess,
}: SubmitHandlerOptions<T>): SubmitHandler<T> {
  return async (data, event) => {
    await onSubmit(data, event);

    if (resetOnSuccess) {
      methods.reset(defaultValues);
    }
  };
}

function SubmitControls({
  submitting,
  isSubmitDisabled,
  submitLabel,
}: SubmitControlsProps): React.ReactElement {
  return (
    <>
      <UiButton
        type="submit"
        disabled={submitting || isSubmitDisabled}
        variant="contained"
        sx={styles.submitButton}
      >
        {submitLabel}
      </UiButton>
      {submitting ? <CircularProgress color="primary" size={70} sx={styles.loader} /> : null}
    </>
  );
}

function FormBody<T extends FieldValues>({
  methods,
  handleSubmit,
  children,
  error,
  title,
  subtitle,
  showTitle,
  showSubtitle,
  submitting,
  isSubmitDisabled,
  submitLabel,
}: FormBodyProps<T>): React.ReactElement {
  return (
    <form noValidate onSubmit={methods.handleSubmit(handleSubmit)}>
      <ErrorBanner error={error} />
      <FormHeader
        title={title}
        subtitle={subtitle}
        showTitle={showTitle}
        showSubtitle={showSubtitle}
      />
      {children}
      <SubmitControls
        submitting={submitting}
        isSubmitDisabled={isSubmitDisabled}
        submitLabel={submitLabel}
      />
    </form>
  );
}

export default function UiForm<T extends FieldValues>({
  onSubmit,
  defaultValues,
  children,
  formOptions = {},
  isSubmitting = undefined,
  error = null,
  submitLabel,
  title,
  subtitle = null,
  showTitle = true,
  showSubtitle = true,
  resetOnSuccess = false,
  isSubmitDisabled = false,
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
  });

  return (
    <FormProviderBridge methods={methods}>
      <FormBody
        methods={methods}
        handleSubmit={handleSubmit}
        error={error}
        title={title}
        subtitle={subtitle}
        showTitle={showTitle}
        showSubtitle={showSubtitle}
        submitting={submitting}
        isSubmitDisabled={isSubmitDisabled}
        submitLabel={submitLabel}
      >
        {children}
      </FormBody>
    </FormProviderBridge>
  );
}
