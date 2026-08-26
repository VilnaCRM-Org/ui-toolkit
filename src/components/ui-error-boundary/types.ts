import type { ErrorInfo, ReactNode } from 'react';

export type UiErrorBoundaryReset = () => void;

export type UiErrorBoundaryFallbackRender = (
  error: Error,
  reset: UiErrorBoundaryReset
) => ReactNode;

export type UiErrorBoundaryFallback = ReactNode | UiErrorBoundaryFallbackRender;

export type UiErrorBoundaryErrorHandler = (error: Error, info: ErrorInfo) => void;

export interface UiErrorBoundaryProps {
  children: ReactNode;
  fallback?: UiErrorBoundaryFallback;
  onError?: UiErrorBoundaryErrorHandler;
  resetKeys?: unknown[];
}

export interface UiErrorBoundaryState {
  error: Error | null;
}
