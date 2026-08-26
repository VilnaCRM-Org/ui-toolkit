import { Box } from '@mui/material';
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
import LiveStatus from './live-status';
import styles from './styles';
import buildSubmitHandler from './submit-handler';
import SubmitSpinner from './submit-spinner';
import useFocusOnMount from './use-focus-on-mount';

export interface UiFormProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>;
  defaultValues: DefaultValues<T>;
  children: ReactNode;
  formOptions?: Omit<UseFormProps<T>, 'defaultValues'>;
  isSubmitting?: boolean;
  error?: string | null;
  submitLabel: string;
  /** Announced through the polite status region while the form submits. */
  submittingLabel?: string;
  /** Overrides whether the submitting announcement is made (defaults to `submitting`). */
  submittingAnnouncement?: boolean;
  title: ReactNode;
  subtitle?: ReactNode;
  showTitle?: boolean;
  showSubtitle?: boolean;
  resetOnSuccess?: boolean;
  isSubmitDisabled?: boolean;
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
  onSubmitError?: (error: unknown) => void;
}

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
  | 'onSubmit'
  | 'defaultValues'
  | 'formOptions'
  | 'isSubmitting'
  | 'resetOnSuccess'
  | 'children'
  | 'onSubmitError'
>;

type FormBodyProps<T extends FieldValues> = {
  methods: UseFormReturn<T>;
  handleSubmit: SubmitHandler<T>;
  submitting: boolean;
  children: ReactNode;
  view: FormViewProps<T>;
};

// CRM parity: a submit failure moves focus to the alert banner so the error is
// both announced and brought into view (the focus ring is the error-token
// outline from `styles.errorBannerFocus`).
function ErrorBanner({ error }: { error?: string | null }): React.ReactElement | null {
  const focusOnAppear: (node: HTMLDivElement | null) => void = useFocusOnMount<HTMLDivElement>();

  if (!error) {
    return null;
  }

  return (
    <Box ref={focusOnAppear} tabIndex={-1} sx={styles.errorBannerFocus}>
      <UiTypography role="alert" sx={{ color: 'red', marginBottom: '1rem' }}>
        {error}
      </UiTypography>
    </Box>
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

// CRM parity: the spinner renders INSIDE the button through the MUI `loading`
// slot (which also handles the non-interactive submitting semantics); the old
// external size-70 loader below the form is gone.
function SubmitControls({
  submitting,
  isSubmitDisabled,
  submitLabel,
}: SubmitControlsProps): React.ReactElement {
  return (
    <UiButton
      type="submit"
      loading={submitting}
      loadingPosition="center"
      loadingIndicator={<SubmitSpinner />}
      disabled={isSubmitDisabled}
      variant="contained"
      sx={styles.submitButton}
    >
      {submitLabel}
    </UiButton>
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
    submittingLabel = 'Submitting…',
    submittingAnnouncement,
  } = view;
  const announceSubmitting: boolean = submittingAnnouncement ?? submitting;

  return (
    <form noValidate aria-busy={submitting} onSubmit={methods.handleSubmit(handleSubmit)}>
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
      <LiveStatus message={announceSubmitting ? submittingLabel : ''} />
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
