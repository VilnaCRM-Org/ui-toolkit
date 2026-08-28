import { useCallback } from 'react';

// CRM port (`crm/src/utils/use-focus-on-mount`): a callback ref that moves focus
// to the node the moment it mounts — used to land focus on the error banner when
// a submit failure renders it.
export default function useFocusOnMount<T extends HTMLElement = HTMLElement>(): (
  node: T | null
) => void {
  return useCallback((node: T | null) => {
    node?.focus();
  }, []);
}
