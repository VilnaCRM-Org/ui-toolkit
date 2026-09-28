import { Box } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import UiTypography from '../ui-typography';

import styles from './styles';

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

function useRestoredNotice(online: boolean): boolean {
  const [restored, setRestored] = useState(false);
  const wasOffline: React.RefObject<boolean> = useRef(false);

  useEffect((): (() => void) | undefined => {
    if (!online) {
      wasOffline.current = true;
      return undefined;
    }
    if (!wasOffline.current) {
      return undefined;
    }
    setRestored(true);
    const timer: ReturnType<typeof setTimeout> = setTimeout(
      (): void => setRestored(false),
      RESTORED_NOTICE_MS
    );
    return (): void => clearTimeout(timer);
  }, [online]);

  return restored;
}

function noticeMessage(online: boolean, restored: boolean, copy: OfflineNoticeCopy): string {
  if (!online) {
    return copy.offline;
  }
  return restored ? copy.restored : '';
}

export default function OfflineNotice({
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
