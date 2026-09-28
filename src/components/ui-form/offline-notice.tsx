import { Box } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import UiTypography from '../ui-typography';

import styles from './styles';
import type { OfflineSubmit } from './use-offline-submit';

export const RESTORED_NOTICE_MS: number = 5_000;

export type OfflineNoticeCopy = {
  offline: string;
  restored: string;
};

type OfflineNoticeProps = {
  id: string;
  online: boolean;
  copy: OfflineNoticeCopy;
  noticeRef: React.RefObject<HTMLSpanElement | null>;
};

function scheduleRestoredNotice(setRestored: (restored: boolean) => void): () => void {
  setRestored(true);
  const timer: ReturnType<typeof setTimeout> = setTimeout(
    (): void => setRestored(false),
    RESTORED_NOTICE_MS
  );
  return (): void => clearTimeout(timer);
}

function useRestoredNotice(online: boolean): boolean {
  const [restored, setRestored] = useState(false);
  const wasOffline: React.RefObject<boolean> = useRef(false);

  useEffect((): (() => void) | undefined => {
    if (!online) {
      wasOffline.current = true;
      return undefined;
    }
    return wasOffline.current ? scheduleRestoredNotice(setRestored) : undefined;
  }, [online]);

  return restored;
}

function noticeMessage(online: boolean, restored: boolean, copy: OfflineNoticeCopy): string {
  if (!online) {
    return copy.offline;
  }
  return restored ? copy.restored : '';
}

function OfflineNotice({
  id,
  online,
  copy,
  noticeRef,
}: Readonly<OfflineNoticeProps>): React.ReactElement {
  const message: string = noticeMessage(online, useRestoredNotice(online), copy);

  return (
    <Box
      component="span"
      ref={noticeRef}
      id={id}
      role="status"
      aria-atomic="true"
      tabIndex={-1}
      sx={message ? styles.offlineNotice : styles.offlineNoticeEmpty}
    >
      {message ? (
        <UiTypography component="span" sx={styles.offlineNoticeText}>
          {message}
        </UiTypography>
      ) : null}
    </Box>
  );
}

export default function FormOfflineNotice({
  offline,
  copy,
}: Readonly<{
  offline: OfflineSubmit;
  copy: OfflineNoticeCopy | undefined;
}>): React.ReactElement | null {
  if (!copy) {
    return null;
  }
  return (
    <OfflineNotice
      id={offline.noticeId}
      online={offline.online}
      copy={copy}
      noticeRef={offline.noticeRef}
    />
  );
}
