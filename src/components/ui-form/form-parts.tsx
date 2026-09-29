import { Box } from '@mui/material';
import React from 'react';
import type { FieldValues } from 'react-hook-form';

import UiButton from '../ui-button';
import UiTypography from '../ui-typography';

import styles from './styles';
import type { FormViewProps } from './types';
import useFocusOnError from './use-focus-on-error';
import type { OfflineSubmit } from './use-offline-submit';

// CRM parity: a submit failure moves focus to the alert banner so the error is
// both announced and brought into view (the focus ring is the error-token
// outline from `styles.errorBannerFocus`). See `useFocusOnError` for when.
export function ErrorBanner({
  error,
  inheritTheme,
}: Readonly<{
  error?: string | null | undefined;
  inheritTheme?: boolean | undefined;
}>): React.ReactElement | null {
  const bannerRef: React.RefObject<HTMLDivElement | null> = useFocusOnError<HTMLDivElement>(error);

  if (!error) {
    return null;
  }

  return (
    <Box ref={bannerRef} tabIndex={-1} sx={styles.errorBannerFocus}>
      <UiTypography
        role="alert"
        inheritTheme={inheritTheme}
        sx={{ color: 'red', marginBottom: '1rem' }}
      >
        {error}
      </UiTypography>
    </Box>
  );
}

export function FormHeader<T extends FieldValues>({
  view,
}: Readonly<{ view: FormViewProps<T> }>): React.ReactElement {
  const { title, subtitle, showTitle = true, showSubtitle = true, titleComponent } = view;
  const { inheritTheme } = view;
  return (
    <>
      {showTitle && title ? (
        <UiTypography
          variant="h4"
          component={titleComponent}
          inheritTheme={inheritTheme}
          sx={styles.formTitle}
        >
          {title}
        </UiTypography>
      ) : null}
      {showSubtitle && subtitle ? (
        <UiTypography inheritTheme={inheritTheme} sx={styles.formSubtitle}>
          {subtitle}
        </UiTypography>
      ) : null}
    </>
  );
}

// CRM parity: the spinner renders INSIDE the submit button, replacing the old
// external size-70 loader below the form. The busy state is UiButton's own
// contract — the kit's shared arc, `aria-disabled` rather than a native
// `disabled` (which would drop a keyboard user's focus the moment their own
// activation starts the fetch), and the one polite status announcement.
export function SubmitControls<T extends FieldValues>({
  view,
  submitting,
  offline,
}: Readonly<{
  view: FormViewProps<T>;
  submitting: boolean;
  offline: OfflineSubmit;
}>): React.ReactElement {
  const { isSubmitDisabled = false, submitLabel, submittingLabel, submitLoadingMode } = view;
  return (
    <UiButton
      ref={offline.submitRef}
      type="submit"
      loading={submitting}
      loadingText={submittingLabel}
      loadingMode={submitLoadingMode}
      focusOutline={view.submitFocusOutline}
      disabled={isSubmitDisabled || !offline.online}
      aria-describedby={view.offlineNotice ? offline.noticeId : undefined}
      variant="contained"
      sx={styles.submitButton}
    >
      {submitLabel}
    </UiButton>
  );
}
