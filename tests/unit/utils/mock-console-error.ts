/**
 * Registers `beforeEach`/`afterEach` hooks that silence `console.error` for the
 * enclosing suite — React logs every error an error boundary catches, and that
 * noise would otherwise swamp unrelated suites — and returns a live handle to
 * the active spy for suites that need to assert on it.
 *
 * Usage:
 *   const error = mockConsoleError();
 *   // ...later, inside a test:
 *   expect(error.spy).toHaveBeenCalled();
 */
export default function mockConsoleError(): { readonly spy: jest.SpyInstance } {
  const handle: { spy: jest.SpyInstance } = {
    spy: undefined as unknown as jest.SpyInstance,
  };

  beforeEach((): void => {
    handle.spy = jest.spyOn(console, 'error').mockImplementation((): void => undefined);
  });

  afterEach((): void => {
    handle.spy.mockRestore();
  });

  return handle;
}
