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

// Display props collected from UiForm via `...view` rest and passed as a single
// prop. Their defaults are applied in FormBody's destructure (not UiForm's
// signature), so a new display prop on UiFormProps must also be defaulted there.
type FormViewProps<T extends FieldValues> = Omit<
  UiFormProps<T>,
  'onSubmit' | 'defaultValues' | 'formOptions' | 'isSubmitting' | 'resetOnSuccess' | 'children'
>;

type FormBodyProps<T extends FieldValues> = {
  methods: UseFormReturn<T>;
  handleSubmit: SubmitHandler<T>;
  submitting: boolean;
  children: ReactNode;
  view: FormViewProps<T>;
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
  submitting,
  children,
  view,
}: FormBodyProps<T>): React.ReactElement {
  const {
    error = null,
    title,
    subtitle = null,
    showTitle = true,
    showSubtitle = true,
    isSubmitDisabled = false,
    submitLabel,
  } = view;

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
  formOptions = {},
  isSubmitting = undefined,
  resetOnSuccess = false,
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
  });

  return (
    <FormProviderBridge methods={methods}>
      <FormBody methods={methods} handleSubmit={handleSubmit} submitting={submitting} view={view}>
        {children}
      </FormBody>
    </FormProviderBridge>
  );
}
