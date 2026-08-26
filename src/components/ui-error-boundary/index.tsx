import React from 'react';

import { devWarn } from '../../utils/dev-warn';

import FallbackView from './fallback-view';
import type { UiErrorBoundaryProps, UiErrorBoundaryState } from './types';

const NO_ERROR: UiErrorBoundaryState = { error: null };

// Module-scope constant, deliberately not exported: the file must contain zero
// module-scope FUNCTIONS (rust-code-analysis counts class methods toward the
// file's `nom_functions` ceiling and this class already needs nine), and a
// `const` is invisible to that count.
const MISSING_ON_ERROR_WARNING: string =
  'UiErrorBoundary caught an error but no onError handler was supplied.';

export default class UiErrorBoundary extends React.Component<
  UiErrorBoundaryProps,
  UiErrorBoundaryState
> {
  constructor(props: UiErrorBoundaryProps) {
    super(props);
    this.state = NO_ERROR;
    this.resetBoundary = this.resetBoundary.bind(this);
  }

  public static getDerivedStateFromError(error: Error): UiErrorBoundaryState {
    return { error };
  }

  public override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.reportBoundaryError(error, info);
  }

  // The `prevState.error` half of the guard keeps a keys change that lands in
  // the same commit as the throw itself from resetting straight back into the
  // still-throwing child (which would double every `onError` report).
  public override componentDidUpdate(
    prevProps: UiErrorBoundaryProps,
    prevState: UiErrorBoundaryState
  ): void {
    if (this.state.error === null || prevState.error === null) {
      return;
    }

    if (this.shouldResetFromKeys(prevProps)) {
      this.resetBoundary();
    }
  }

  public override render(): React.ReactNode {
    const { error } = this.state;

    if (error === null) {
      return this.props.children;
    }

    return this.renderFallback(error);
  }

  // Bound in the constructor rather than declared as an arrow-function class
  // member: a class field would raise `npa` and `cda` for no behavioural gain.
  private resetBoundary(): void {
    this.setState(NO_ERROR);
  }

  private shouldResetFromKeys(prevProps: UiErrorBoundaryProps): boolean {
    const previous: unknown[] = prevProps.resetKeys ?? [];
    const next: unknown[] = this.props.resetKeys ?? [];

    if (previous.length !== next.length) {
      return true;
    }

    return next.some((key, index): boolean => !Object.is(key, previous[index]));
  }

  private reportBoundaryError(error: Error, info: React.ErrorInfo): void {
    const { onError } = this.props;

    if (onError) {
      onError(error, info);
      return;
    }

    devWarn(MISSING_ON_ERROR_WARNING);
  }

  private renderFallback(error: Error): React.ReactElement {
    return <FallbackView fallback={this.props.fallback} error={error} reset={this.resetBoundary} />;
  }
}
