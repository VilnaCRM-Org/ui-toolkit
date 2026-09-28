import { useId, useLayoutEffect, useRef, type RefObject } from 'react';

import useConnectivity from './use-connectivity';

export type OfflineSubmit = {
  online: boolean;
  noticeId: string;
  noticeRef: RefObject<HTMLSpanElement | null>;
  submitRef: RefObject<HTMLButtonElement | null>;
};

function useOfflineFocus(
  online: boolean,
  submitRef: OfflineSubmit['submitRef'],
  noticeRef: OfflineSubmit['noticeRef']
): void {
  useLayoutEffect((): void => {
    if (!online && document.activeElement === submitRef.current) {
      (noticeRef.current as HTMLSpanElement).focus();
    }
  }, [online, submitRef, noticeRef]);
}

export default function useOfflineSubmit(enabled: boolean): OfflineSubmit {
  const connected: boolean = useConnectivity();
  const online: boolean = connected || !enabled;
  const noticeId: string = useId();
  const noticeRef: OfflineSubmit['noticeRef'] = useRef<HTMLSpanElement>(null);
  const submitRef: OfflineSubmit['submitRef'] = useRef<HTMLButtonElement>(null);
  useOfflineFocus(online, submitRef, noticeRef);

  return { online, noticeId, noticeRef, submitRef };
}
