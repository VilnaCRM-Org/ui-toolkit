import React from 'react';

import DefaultFallback from './default-fallback';
import type { UiErrorBoundaryFallback, UiErrorBoundaryReset } from './types';

// Local, non-exported props type: FallbackView is internal to this folder, and
// `esbuild-jest` counts an un-imported export as an uncovered function.
type FallbackViewProps = {
  fallback: UiErrorBoundaryFallback;
  error: Error;
  reset: UiErrorBoundaryReset;
};

// The single place fallback resolution is decided: render prop, then node, then
// the built-in default. Resolution is nullish on purpose — an explicit `null`
// (as the prop or as a render-prop's return value) still yields the default,
// because the never-blank guarantee outranks a consumer's ability to render
// nothing.
export default function FallbackView({
  fallback,
  error,
  reset,
}: FallbackViewProps): React.ReactElement {
  if (typeof fallback === 'function') {
    return <>{fallback(error, reset) ?? <DefaultFallback />}</>;
  }

  if (fallback == null) {
    return <DefaultFallback />;
  }

  return <>{fallback}</>;
}
