import mockConsoleMethod from './mock-console-method';

/**
 * Silences `console.warn` for the enclosing suite — several controls emit
 * dev-only accessibility guidance we do not want cluttering test output — and
 * returns a live handle to the active spy.
 *
 * Usage:
 *   const warn = mockConsoleWarn();
 *   // ...later, inside a test:
 *   expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('...'));
 */
export default function mockConsoleWarn(): { readonly spy: jest.SpyInstance } {
  return mockConsoleMethod('warn');
}
