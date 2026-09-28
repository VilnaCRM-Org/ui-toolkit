import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return (): void => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

function readOnline(): boolean {
  return navigator.onLine;
}

function readServerOnline(): boolean {
  return true;
}

export default function useConnectivity(): boolean {
  return useSyncExternalStore(subscribe, readOnline, readServerOnline);
}
