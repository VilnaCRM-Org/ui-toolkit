import React from 'react';

/**
 * How long a fetch must have been in flight before it is worth speaking. Fast
 * local filtering never reaches the threshold, so a typing user is not talked
 * over — the same "announce transitions, not ticks" ruling
 * `ui-file-upload-input/announce.ts` already applies. 500ms is the conventional
 * spinner-delay heuristic, not a WCAG-mandated number.
 */
export const LOADING_ANNOUNCE_DELAY_MS: number = 500;

/**
 * The default spoken (and popup) loading copy. Kept identical to
 * `ui-skeletons`' `DEFAULT_LOADING_TEXT` so the kit speaks with one voice;
 * declared here rather than imported because a shared field module must not
 * reach into another component's internals (the dependency-cruiser boundary).
 */
export const DEFAULT_LOADING_TEXT: string = 'Завантаження';

/**
 * The text a field control's polite `role="status"` region should carry: empty
 * while idle or while a fetch is still under the threshold, `loadingText` once
 * it crosses.
 *
 * The effect's cleanup is the whole safety contract: it clears the pending timer
 * before any re-run and on unmount, so a fetch that settles before the threshold
 * can never let a stale timeout announce late, and a fast typist cannot stack a
 * burst of overlapping announcements.
 */
export function useLoadingAnnouncement(
  loading: boolean | null | undefined,
  loadingText: string
): string {
  const [announced, setAnnounced] = React.useState<string>('');

  React.useEffect((): (() => void) => {
    if (loading !== true) {
      setAnnounced('');
      return (): void => undefined;
    }
    const timer: ReturnType<typeof setTimeout> = setTimeout(
      (): void => setAnnounced(loadingText),
      LOADING_ANNOUNCE_DELAY_MS
    );
    return (): void => clearTimeout(timer);
  }, [loading, loadingText]);

  return announced;
}

/** The `loading`/`loadingText` slice every field control shares. */
export interface FieldLoadingProps {
  loading?: boolean | null;
  loadingText?: string;
}

/**
 * `useLoadingAnnouncement` bound to a field control's own props, so the default
 * copy is resolved in one place rather than restated at each call site (which
 * also keeps the calling hooks inside the metrics gate's per-function budget).
 */
export function useFieldLoadingAnnouncement(props: Readonly<FieldLoadingProps>): string {
  return useLoadingAnnouncement(props.loading, props.loadingText ?? DEFAULT_LOADING_TEXT);
}
