import mockConsoleMethod from './mock-console-method';

/**
 * Silences `console.error` for the enclosing suite — React logs every error an
 * error boundary catches, and that noise would otherwise swamp unrelated
 * suites — and returns a live handle to the active spy.
 *
 * Usage:
 *   const error = mockConsoleError();
 *   // ...later, inside a test:
 *   expect(error.spy).toHaveBeenCalled();
 */
export default function mockConsoleError(): { readonly spy: jest.SpyInstance } {
  return mockConsoleMethod('error');
}
